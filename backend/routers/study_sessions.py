from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import StudySession
from backend.schemas import StudySessionStart, StudySessionUpdate, StudySessionOut

router = APIRouter(prefix="/api/study-sessions", tags=["Study Sessions & Timers"])

@router.get("/active", response_model=Optional[StudySessionOut])
def get_active_session(db: Session = Depends(get_db)):
    """
    Returns currently running or paused session for cross-refresh persistence.
    """
    session = db.query(StudySession).filter(
        StudySession.status.in_(["running", "paused"])
    ).order_by(StudySession.start_time.desc()).first()
    return session

@router.post("/start", response_model=StudySessionOut)
def start_session(data: StudySessionStart, db: Session = Depends(get_db)):
    # Check if there is an active session already running
    active = db.query(StudySession).filter(
        StudySession.status.in_(["running", "paused"])
    ).first()
    if active:
        # Auto-complete or close previous running session to avoid double counting
        active.status = "completed"
        active.end_time = datetime.now(timezone.utc)
        db.commit()

    now = datetime.now(timezone.utc)
    new_sess = StudySession(
        course_id=data.course_id,
        topic_id=data.topic_id,
        goal=data.goal or "",
        session_type=data.session_type or "focus",
        planned_duration_mins=data.planned_duration_mins or 25,
        actual_duration_secs=0,
        break_duration_secs=0,
        start_time=now,
        status="running"
    )
    db.add(new_sess)
    db.commit()
    db.refresh(new_sess)
    return new_sess

@router.put("/{session_id}", response_model=StudySessionOut)
def update_session(session_id: str, data: StudySessionUpdate, db: Session = Depends(get_db)):
    sess = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Study session not found")

    if data.actual_duration_secs is not None: sess.actual_duration_secs = data.actual_duration_secs
    if data.break_duration_secs is not None: sess.break_duration_secs = data.break_duration_secs
    if data.status is not None:
        sess.status = data.status
        if data.status in ["completed", "abandoned"] and not sess.end_time:
            sess.end_time = datetime.now(timezone.utc)
    if data.reflection_completed is not None: sess.reflection_completed = data.reflection_completed
    if data.reflection_unclear is not None: sess.reflection_unclear = data.reflection_unclear
    if data.reflection_confidence is not None: sess.reflection_confidence = data.reflection_confidence
    if data.reflection_next is not None: sess.reflection_next = data.reflection_next
    if data.session_notes is not None: sess.session_notes = data.session_notes

    db.commit()
    db.refresh(sess)
    return sess

@router.get("/history", response_model=List[StudySessionOut])
def get_session_history(
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    limit: int = 30,
    db: Session = Depends(get_db)
):
    query = db.query(StudySession)
    if course_id:
        query = query.filter(StudySession.course_id == course_id)
    if topic_id:
        query = query.filter(StudySession.topic_id == topic_id)
    sessions = query.order_by(StudySession.start_time.desc()).limit(limit).all()
    return sessions
