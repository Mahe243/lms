import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import AIConversation, AIMessage, Flashcard, FlashcardDeck, Question, QuestionBank, User
from backend.schemas import AIChatRequest, AIMessageOut, AIConversationOut
from backend.services.rag import search_materials
from backend.services.ai_service import generate_tutor_response

router = APIRouter(prefix="/api/ai", tags=["AI Tutor"])

def conversation_to_dict(conv: AIConversation) -> dict:
    return {
        "id": conv.id,
        "title": conv.title,
        "course_id": conv.course_id,
        "topic_id": conv.topic_id,
        "resource_id": conv.resource_id,
        "doubt_id": conv.doubt_id,
        "context_mode": conv.context_mode,
        "selected_passage": conv.selected_passage,
        "source_references": json.loads(conv.source_references) if conv.source_references else [],
        "is_archived": conv.is_archived,
        "is_demo": conv.is_demo,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "messages": [
            {
                "id": m.id,
                "conversation_id": m.conversation_id,
                "role": m.role,
                "content": m.content,
                "source_citations": json.loads(m.source_citations) if m.source_citations else [],
                "helpfulness_rating": m.helpfulness_rating,
                "prompt_type": m.prompt_type,
                "created_at": m.created_at
            } for m in conv.messages
        ]
    }

@router.get("/conversations", response_model=List[AIConversationOut])
def list_conversations(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AIConversation).filter(AIConversation.is_archived == False)
    if course_id:
        query = query.filter(AIConversation.course_id == course_id)
    convs = query.order_by(AIConversation.updated_at.desc()).all()
    return [conversation_to_dict(c) for c in convs]

@router.get("/conversations/{conversation_id}", response_model=AIConversationOut)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(AIConversation).filter(AIConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation_to_dict(conv)

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(AIConversation).filter(AIConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully"}

@router.post("/chat")
async def chat_with_tutor(data: AIChatRequest, db: Session = Depends(get_db)):
    # 1. Fetch user preferences if available
    user = db.query(User).first()
    user_prefs = json.loads(user.preferences) if (user and user.preferences) else {}
    api_key_override = user_prefs.get("ai_api_key")
    provider_override = user_prefs.get("ai_provider")
    preferred_lang = user_prefs.get("preferred_explanation_language", "English")
    preferred_depth = user_prefs.get("preferred_depth", "balanced")

    # 2. Get or create conversation
    conv = None
    if data.conversation_id:
        conv = db.query(AIConversation).filter(AIConversation.id == data.conversation_id).first()
    
    if not conv:
        first_title = data.message[:40] + ("..." if len(data.message) > 40 else "")
        conv = AIConversation(
            title=first_title or "Tutor Session",
            course_id=data.course_id,
            topic_id=data.topic_id,
            resource_id=data.resource_id,
            doubt_id=data.doubt_id,
            context_mode=data.context_mode or "my_materials_plus_general",
            selected_passage=data.selected_passage
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 3. Retrieve grounding sources
    sources = []
    if data.context_mode in ["my_materials", "my_materials_plus_general"]:
        sources = search_materials(
            db=db,
            query=data.message,
            course_id=data.course_id or conv.course_id,
            topic_id=data.topic_id or conv.topic_id,
            resource_id=data.resource_id or conv.resource_id,
            limit=4
        )

    # 4. Build recent history
    history = []
    for m in conv.messages[-6:]:
        history.append({"role": m.role, "content": m.content})

    # Save user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        content=data.message,
        prompt_type=data.prompt_type
    )
    db.add(user_msg)
    db.commit()

    # 5. Call tutor service
    tutor_result = await generate_tutor_response(
        message=data.message,
        context_mode=data.context_mode or conv.context_mode,
        sources=sources,
        selected_passage=data.selected_passage or conv.selected_passage,
        history=history,
        prompt_type=data.prompt_type or "standard",
        api_key_override=api_key_override,
        provider_override=provider_override,
        preferred_language=preferred_lang,
        preferred_depth=preferred_depth
    )

    assistant_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=tutor_result["content"],
        source_citations=json.dumps(tutor_result["citations"]),
        prompt_type=data.prompt_type
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_msg)

    return {
        "conversation_id": conv.id,
        "message_id": assistant_msg.id,
        "role": "assistant",
        "content": assistant_msg.content,
        "citations": tutor_result["citations"],
        "configured": tutor_result["configured"],
        "prompt_type": data.prompt_type
    }

@router.post("/rate-message")
def rate_message(message_id: str, rating: int, db: Session = Depends(get_db)):
    msg = db.query(AIMessage).filter(AIMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.helpfulness_rating = rating
    db.commit()
    return {"status": "success", "rating": rating}

@router.post("/generate-drafts")
async def generate_draft_study_material(
    text: str,
    draft_type: str = "flashcards", # flashcards or quiz
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Creates uncommitted draft flashcards or quiz questions from selected note/material text.
    Learner reviews before permanently adding to decks/banks.
    """
    user = db.query(User).first()
    user_prefs = json.loads(user.preferences) if (user and user.preferences) else {}
    api_key_override = user_prefs.get("ai_api_key")
    provider_override = user_prefs.get("ai_provider")

    if draft_type == "flashcards":
        prompt = (
            "Generate 3 high quality flashcards based on the following text. "
            "Return valid JSON array of objects with keys: 'front', 'back', 'explanation', 'card_type' ('basic' or 'cloze').\n"
            f"TEXT:\n{text}"
        )
    else:
        prompt = (
            "Generate 2 high quality practice questions (1 multiple choice, 1 short answer) based on the following text. "
            "Return valid JSON array of objects with keys: 'question_type' ('mcq' or 'short_answer'), 'question_text', 'options' (array of 4 choices for mcq), 'correct_answer', 'explanation'.\n"
            f"TEXT:\n{text}"
        )

    res = await generate_tutor_response(
        message=prompt,
        context_mode="my_materials",
        sources=[],
        selected_passage=text,
        api_key_override=api_key_override,
        provider_override=provider_override
    )

    if not res["configured"]:
        # Fallback structured draft from text directly so feature works even before API key is configured!
        if draft_type == "flashcards":
            lines = [l.strip() for l in text.splitlines() if l.strip()]
            first_line = lines[0] if lines else "Key Concept"
            draft_items = [
                {
                    "front": f"What is the definition of: {first_line[:60]}?",
                    "back": text[:200],
                    "explanation": "Extracted draft from notes.",
                    "card_type": "basic",
                    "is_draft": True
                }
            ]
        else:
            draft_items = [
                {
                    "question_type": "mcq",
                    "question_text": f"Regarding: {text[:80]}... which statement is true?",
                    "options": ["It is an essential concept", "It is obsolete", "It is optional", "None of the above"],
                    "correct_answer": "It is an essential concept",
                    "explanation": "Draft practice question based on your selected notes.",
                    "is_draft": True
                }
            ]
        return {"items": draft_items, "configured": False}

    # Parse AI JSON
    try:
        clean_text = res["content"].strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()
        parsed = json.loads(clean_text)
        return {"items": parsed, "configured": True}
    except Exception:
        return {"raw": res["content"], "configured": True}
