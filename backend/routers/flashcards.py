import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import FlashcardDeck, Flashcard, FlashcardReview
from backend.schemas import (
    FlashcardDeckCreate, FlashcardDeckOut,
    FlashcardCreate, FlashcardUpdate, FlashcardOut,
    FlashcardReviewSubmit
)
from backend.services.fsrs import (
    schedule_flashcard, utc_now, to_naive_utc
)

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])

def card_to_dict(fc: Flashcard) -> dict:
    return {
        "id": fc.id,
        "deck_id": fc.deck_id,
        "course_id": fc.course_id,
        "topic_id": fc.topic_id,
        "card_type": fc.card_type,
        "front": fc.front,
        "back": fc.back,
        "cloze_text": fc.cloze_text,
        "explanation": fc.explanation,
        "source_ref": fc.source_ref,
        "tags": json.loads(fc.tags) if fc.tags else [],
        "image_url": fc.image_url,
        "is_suspended": fc.is_suspended,
        "is_draft": fc.is_draft,
        "draft_reviewed": fc.draft_reviewed,
        "reps": fc.reps,
        "lapses": fc.lapses,
        "stability": fc.stability,
        "state": fc.state,
        "interval_days": fc.interval_days,
        "last_review_at": fc.last_review_at,
        "next_review_at": fc.next_review_at,
        "is_demo": fc.is_demo,
        "created_at": fc.created_at,
        "updated_at": fc.updated_at
    }

@router.get("/decks", response_model=List[FlashcardDeckOut])
def list_decks(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FlashcardDeck)
    if course_id:
        query = query.filter(FlashcardDeck.course_id == course_id)
    decks = query.order_by(FlashcardDeck.created_at.desc()).all()
    
    now = utc_now()
    results = []
    for d in decks:
        cards = db.query(Flashcard).filter(Flashcard.deck_id == d.id, Flashcard.is_suspended == False, Flashcard.is_draft == False).all()
        card_count = len(cards)
        due_count = sum(1 for c in cards if c.next_review_at and to_naive_utc(c.next_review_at) <= now)
        new_count = sum(1 for c in cards if c.state == "new")

        results.append({
            "id": d.id,
            "course_id": d.course_id,
            "topic_id": d.topic_id,
            "name": d.name,
            "description": d.description,
            "tags": json.loads(d.tags) if d.tags else [],
            "card_count": card_count,
            "due_count": due_count,
            "new_count": new_count,
            "is_demo": d.is_demo,
            "created_at": d.created_at,
            "updated_at": d.updated_at
        })
    return results

@router.post("/decks", response_model=FlashcardDeckOut)
def create_deck(data: FlashcardDeckCreate, db: Session = Depends(get_db)):
    d = FlashcardDeck(
        course_id=data.course_id,
        topic_id=data.topic_id,
        name=data.name,
        description=data.description or "",
        tags=json.dumps(data.tags or [])
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return {
        "id": d.id,
        "course_id": d.course_id,
        "topic_id": d.topic_id,
        "name": d.name,
        "description": d.description,
        "tags": json.loads(d.tags) if d.tags else [],
        "card_count": 0,
        "due_count": 0,
        "new_count": 0,
        "is_demo": d.is_demo,
        "created_at": d.created_at,
        "updated_at": d.updated_at
    }

@router.delete("/decks/{deck_id}")
def delete_deck(deck_id: str, db: Session = Depends(get_db)):
    d = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(d)
    db.commit()
    return {"message": "Deck deleted successfully"}

@router.get("", response_model=List[FlashcardOut])
def list_cards(
    deck_id: Optional[str] = None,
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    mode: Optional[str] = None, # due_today, new, difficult, random, drafts
    db: Session = Depends(get_db)
):
    query = db.query(Flashcard)
    if deck_id: query = query.filter(Flashcard.deck_id == deck_id)
    if course_id: query = query.filter(Flashcard.course_id == course_id)
    if topic_id: query = query.filter(Flashcard.topic_id == topic_id)

    if mode == "drafts":
        query = query.filter(Flashcard.is_draft == True)
    else:
        query = query.filter(Flashcard.is_draft == False, Flashcard.is_suspended == False)

    now = utc_now()
    if mode == "due_today":
        query = query.filter(Flashcard.next_review_at <= now)
    elif mode == "new":
        query = query.filter(Flashcard.state == "new")
    elif mode == "difficult":
        query = query.filter((Flashcard.stability < 2.0) | (Flashcard.lapses > 0))

    cards = query.all()
    return [card_to_dict(c) for c in cards]

@router.post("", response_model=FlashcardOut)
def create_card(data: FlashcardCreate, db: Session = Depends(get_db)):
    now = utc_now()
    fc = Flashcard(
        deck_id=data.deck_id,
        course_id=data.course_id,
        topic_id=data.topic_id,
        card_type=data.card_type or "basic",
        front=data.front,
        back=data.back,
        cloze_text=data.cloze_text,
        explanation=data.explanation or "",
        source_ref=data.source_ref,
        tags=json.dumps(data.tags or []),
        image_url=data.image_url,
        is_draft=data.is_draft or False,
        draft_reviewed=not (data.is_draft or False),
        next_review_at=now
    )
    db.add(fc)
    db.commit()
    db.refresh(fc)
    return card_to_dict(fc)

@router.put("/{card_id}", response_model=FlashcardOut)
def update_card(card_id: str, data: FlashcardUpdate, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    if data.front is not None: fc.front = data.front
    if data.back is not None: fc.back = data.back
    if data.cloze_text is not None: fc.cloze_text = data.cloze_text
    if data.explanation is not None: fc.explanation = data.explanation
    if data.source_ref is not None: fc.source_ref = data.source_ref
    if data.tags is not None: fc.tags = json.dumps(data.tags)
    if data.image_url is not None: fc.image_url = data.image_url
    if data.is_suspended is not None: fc.is_suspended = data.is_suspended
    if data.is_draft is not None: fc.is_draft = data.is_draft
    if data.draft_reviewed is not None: fc.draft_reviewed = data.draft_reviewed

    db.commit()
    db.refresh(fc)
    return card_to_dict(fc)

@router.delete("/{card_id}")
def delete_card(card_id: str, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    db.delete(fc)
    db.commit()
    return {"message": "Flashcard deleted successfully"}

@router.post("/review")
def review_flashcard(data: FlashcardReviewSubmit, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == data.card_id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    # Spaced repetition scheduling
    sched = schedule_flashcard(
        rating=data.rating,
        reps=fc.reps,
        lapses=fc.lapses,
        stability=fc.stability,
        current_interval=fc.interval_days,
        state=fc.state
    )

    # Save review record
    rev = FlashcardReview(
        card_id=fc.id,
        rating=data.rating,
        review_time_ms=data.review_time_ms or 0,
        scheduled_days=sched["interval_days"],
        elapsed_days=fc.interval_days,
        reviewed_at=sched["last_review_at"]
    )
    db.add(rev)

    # Update card fields
    fc.reps = sched["reps"]
    fc.lapses = sched["lapses"]
    fc.stability = sched["stability"]
    fc.state = sched["state"]
    fc.interval_days = sched["interval_days"]
    fc.last_review_at = sched["last_review_at"]
    fc.next_review_at = sched["next_review_at"]

    db.commit()
    db.refresh(fc)

    return {
        "status": "success",
        "card": card_to_dict(fc),
        "scheduled_days": sched["interval_days"],
        "next_review_at": sched["next_review_at"]
    }

@router.post("/undo-review/{card_id}")
def undo_last_review(card_id: str, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    last_rev = db.query(FlashcardReview).filter(FlashcardReview.card_id == card_id).order_by(FlashcardReview.reviewed_at.desc()).first()
    if not last_rev:
        raise HTTPException(status_code=400, detail="No prior review to undo")

    # Revert to elapsed days
    fc.interval_days = last_rev.elapsed_days
    fc.reps = max(0, fc.reps - 1)
    fc.next_review_at = utc_now()
    db.delete(last_rev)
    db.commit()
    db.refresh(fc)
    return {"message": "Review reverted", "card": card_to_dict(fc)}
