from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Comment
from backend.schemas import CommentCreate, CommentUpdate, CommentOut

router = APIRouter(prefix="/api/comments", tags=["Comments & Doubts"])

@router.get("", response_model=List[CommentOut])
def list_comments(
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    comment_type: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    doubts_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Comment)
    if target_type and target_id:
        query = query.filter(Comment.target_type == target_type, Comment.target_id == target_id)
    if course_id:
        query = query.filter(Comment.course_id == course_id)
    if topic_id:
        query = query.filter(Comment.topic_id == topic_id)
    if comment_type:
        query = query.filter(Comment.comment_type == comment_type)
    elif doubts_only:
        query = query.filter(Comment.comment_type == "doubt")
    if is_resolved is not None:
        query = query.filter(Comment.is_resolved == is_resolved)

    comments = query.order_by(Comment.is_pinned.desc(), Comment.created_at.desc()).all()
    return comments

@router.post("", response_model=CommentOut)
def create_comment(data: CommentCreate, db: Session = Depends(get_db)):
    c = Comment(
        target_type=data.target_type,
        target_id=data.target_id,
        course_id=data.course_id,
        topic_id=data.topic_id,
        text=data.text,
        comment_type=data.comment_type or "observation",
        priority=data.priority or "medium",
        timestamp_secs=data.timestamp_secs,
        page_number=data.page_number
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.put("/{comment_id}", response_model=CommentOut)
def update_comment(comment_id: str, data: CommentUpdate, db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")

    if data.text is not None: c.text = data.text
    if data.comment_type is not None: c.comment_type = data.comment_type
    if data.is_resolved is not None:
        c.is_resolved = data.is_resolved
        c.resolved_at = datetime.now(timezone.utc) if data.is_resolved else None
    if data.resolution_notes is not None: c.resolution_notes = data.resolution_notes
    if data.is_pinned is not None: c.is_pinned = data.is_pinned
    if data.priority is not None: c.priority = data.priority
    if data.timestamp_secs is not None: c.timestamp_secs = data.timestamp_secs
    if data.page_number is not None: c.page_number = data.page_number

    db.commit()
    db.refresh(c)
    return c

@router.delete("/{comment_id}")
def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(c)
    db.commit()
    return {"message": "Comment deleted successfully"}
