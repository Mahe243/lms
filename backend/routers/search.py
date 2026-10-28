import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from backend.database import get_db
from backend.models import (
    Course, Topic, Note, Resource, Comment, Flashcard, Question, Task, JournalEntry
)

router = APIRouter(prefix="/api/search", tags=["Global Search & Quick Capture"])

class QuickCaptureRequest(BaseModel):
    capture_type: str # link, note, doubt, task, flashcard
    title: str
    content: Optional[str] = ""
    url: Optional[str] = None
    course_id: Optional[str] = None
    topic_id: Optional[str] = None

@router.get("")
def global_search(
    q: str = Query(..., min_length=1),
    filter_type: Optional[str] = None, # all, course, note, resource, doubt, flashcard, task
    db: Session = Depends(get_db)
):
    query_str = f"%{q.strip().lower()}%"
    results = []

    # 1. Courses
    if not filter_type or filter_type in ["all", "course"]:
        courses = db.query(Course).filter(
            or_(Course.name.ilike(query_str), Course.description.ilike(query_str), Course.syllabus.ilike(query_str))
        ).limit(10).all()
        for c in courses:
            results.append({
                "type": "course",
                "id": c.id,
                "title": c.name,
                "subtitle": c.category,
                "snippet": c.description[:150] if c.description else "",
                "url": f"/courses/{c.id}"
            })

    # 2. Topics
    if not filter_type or filter_type in ["all", "topic"]:
        topics = db.query(Topic).filter(
            or_(Topic.title.ilike(query_str), Topic.description.ilike(query_str))
        ).limit(10).all()
        for t in topics:
            results.append({
                "type": "topic",
                "id": t.id,
                "title": t.title,
                "subtitle": f"Status: {t.status}",
                "snippet": t.description[:150] if t.description else "",
                "url": f"/courses/{t.course_id}?topic={t.id}"
            })

    # 3. Notes
    if not filter_type or filter_type in ["all", "note"]:
        notes = db.query(Note).filter(
            Note.is_deleted == False,
            or_(Note.title.ilike(query_str), Note.content.ilike(query_str), Note.summary.ilike(query_str))
        ).limit(15).all()
        for n in notes:
            results.append({
                "type": "note",
                "id": n.id,
                "title": n.title,
                "subtitle": n.template_type,
                "snippet": n.summary or n.content[:150],
                "url": f"/notes?noteId={n.id}"
            })

    # 4. Resources
    if not filter_type or filter_type in ["all", "resource"]:
        resources = db.query(Resource).filter(
            Resource.is_deleted == False,
            or_(Resource.title.ilike(query_str), Resource.description.ilike(query_str), Resource.extracted_text.ilike(query_str))
        ).limit(15).all()
        for r in resources:
            results.append({
                "type": "resource",
                "id": r.id,
                "title": r.title,
                "subtitle": r.type,
                "snippet": r.description[:150] if r.description else "",
                "url": f"/resources?resourceId={r.id}"
            })

    # 5. Doubts / Comments
    if not filter_type or filter_type in ["all", "doubt"]:
        comments = db.query(Comment).filter(
            or_(Comment.text.ilike(query_str), Comment.resolution_notes.ilike(query_str))
        ).limit(10).all()
        for cm in comments:
            results.append({
                "type": "doubt" if cm.comment_type == "doubt" else "comment",
                "id": cm.id,
                "title": cm.text[:60] + ("..." if len(cm.text) > 60 else ""),
                "subtitle": f"Status: {'Resolved' if cm.is_resolved else 'Unresolved'}",
                "snippet": cm.text[:150],
                "url": "/doubts"
            })

    # 6. Flashcards
    if not filter_type or filter_type in ["all", "flashcard"]:
        cards = db.query(Flashcard).filter(
            or_(Flashcard.front.ilike(query_str), Flashcard.back.ilike(query_str), Flashcard.explanation.ilike(query_str))
        ).limit(10).all()
        for fc in cards:
            results.append({
                "type": "flashcard",
                "id": fc.id,
                "title": fc.front[:60],
                "subtitle": f"State: {fc.state}",
                "snippet": fc.back[:150],
                "url": f"/flashcards?cardId={fc.id}"
            })

    # 7. Tasks
    if not filter_type or filter_type in ["all", "task"]:
        tasks = db.query(Task).filter(
            or_(Task.title.ilike(query_str), Task.description.ilike(query_str))
        ).limit(10).all()
        for tk in tasks:
            results.append({
                "type": "task",
                "id": tk.id,
                "title": tk.title,
                "subtitle": f"Priority: {tk.priority}",
                "snippet": tk.description[:150] if tk.description else "",
                "url": f"/tasks?taskId={tk.id}"
            })

    return results

@router.post("/quick-capture")
def quick_capture(data: QuickCaptureRequest, db: Session = Depends(get_db)):
    """
    Rapidly stores captured links, ideas, notes, or doubts into the learner's workspace.
    """
    if data.capture_type == "note":
        item = Note(
            course_id=data.course_id,
            topic_id=data.topic_id,
            title=data.title,
            content=data.content or "",
            template_type="general"
        )
        db.add(item)
    elif data.capture_type == "link":
        item = Resource(
            course_id=data.course_id,
            topic_id=data.topic_id,
            title=data.title,
            type="article" if not ("youtube.com" in (data.url or "") or "youtu.be" in (data.url or "")) else "video",
            url=data.url,
            description=data.content or ""
        )
        db.add(item)
    elif data.capture_type == "doubt":
        item = Comment(
            target_type="workspace",
            target_id="inbox",
            course_id=data.course_id,
            topic_id=data.topic_id,
            text=f"{data.title}\n{data.content or ''}".strip(),
            comment_type="doubt",
            priority="medium"
        )
        db.add(item)
    elif data.capture_type == "task":
        item = Task(
            course_id=data.course_id,
            topic_id=data.topic_id,
            title=data.title,
            description=data.content or "",
            task_type="study",
            status="todo"
        )
        db.add(item)
    elif data.capture_type == "flashcard":
        item = Flashcard(
            deck_id="inbox",
            course_id=data.course_id,
            topic_id=data.topic_id,
            front=data.title,
            back=data.content or "",
            is_draft=True
        )
        db.add(item)
    else:
        # Default to note
        item = Note(title=data.title, content=data.content or "")
        db.add(item)

    db.commit()
    db.refresh(item)
    return {"message": "Captured successfully", "id": item.id, "type": data.capture_type}
