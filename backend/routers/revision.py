from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Topic, Course, TopicRevision
from backend.schemas import TopicRevisionSubmit, TopicRevisionOut
from backend.services.fsrs import schedule_topic_revision, utc_now

router = APIRouter(prefix="/api/revision", tags=["Topic Spaced Revision"])

@router.get("/queue", response_model=List[TopicRevisionOut])
def get_revision_queue(due_only: bool = False, course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Topic, Course).join(Course, Topic.course_id == Course.id).filter(
        Topic.status.in_(["completed", "needs_revision", "in_progress"])
    )
    if course_id:
        query = query.filter(Topic.course_id == course_id)

    now = utc_now()
    if due_only:
        query = query.filter(Topic.next_revision_at <= now)

    results = []
    topics_with_courses = query.order_by(Topic.next_revision_at.asc()).all()

    for t, c in topics_with_courses:
        # Find latest completed revision record
        latest_rev = db.query(TopicRevision).filter(TopicRevision.topic_id == t.id).order_by(TopicRevision.created_at.desc()).first()

        results.append(TopicRevisionOut(
            id=latest_rev.id if latest_rev else f"pending_{t.id}",
            topic_id=t.id,
            course_id=c.id,
            topic_title=t.title,
            course_name=c.name,
            scheduled_date=t.next_revision_at or now,
            completed_date=latest_rev.completed_date if latest_rev else None,
            recall_rating=latest_rev.recall_rating if latest_rev else None,
            interval_days=t.revision_interval_days,
            revision_number=t.revision_count,
            notes=latest_rev.notes if latest_rev else "",
            created_at=latest_rev.created_at if latest_rev else t.created_at
        ))
    return results

@router.post("/submit")
def submit_topic_revision(data: TopicRevisionSubmit, db: Session = Depends(get_db)):
    t = db.query(Topic).filter(Topic.id == data.topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")

    new_interval, next_date = schedule_topic_revision(
        rating=data.recall_rating,
        current_interval=t.revision_interval_days,
        revision_count=t.revision_count
    )

    now = utc_now()
    rev_record = TopicRevision(
        topic_id=t.id,
        course_id=t.course_id,
        scheduled_date=t.next_revision_at or now,
        completed_date=now,
        recall_rating=data.recall_rating,
        interval_days=new_interval,
        revision_number=t.revision_count + 1,
        notes=data.notes or ""
    )
    db.add(rev_record)

    # Update topic state
    t.revision_interval_days = new_interval
    t.revision_count = t.revision_count + 1
    t.last_studied_at = now
    t.next_revision_at = next_date

    # Update understanding level based on rating
    if data.recall_rating == "forgot":
        t.understanding_level = "basic"
        t.status = "needs_revision"
    elif data.recall_rating == "difficult":
        t.understanding_level = "comfortable"
    elif data.recall_rating in ["good", "easy"]:
        t.understanding_level = "confident"
        if t.status == "needs_revision":
            t.status = "completed"

    db.commit()
    db.refresh(t)

    return {
        "status": "success",
        "topic_id": t.id,
        "next_revision_at": next_date,
        "new_interval_days": new_interval,
        "understanding_level": t.understanding_level
    }
