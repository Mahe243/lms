from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import ActivityEvent
from backend.services.activity_service import (
    record_platform_visit,
    record_deliberate_visit,
    record_heartbeat,
    calculate_study_streak,
    get_analytics_metrics
)
from backend.config import settings

router = APIRouter(prefix="/api/activity", tags=["Activity & Visits"])

class PlatformVisitRequest(BaseModel):
    session_visit_id: str

class DeliberateVisitRequest(BaseModel):
    event_type: str # course_visit, topic_visit, resource_open
    target_type: str
    target_id: str
    course_id: Optional[str] = None

class HeartbeatRequest(BaseModel):
    duration_secs: int
    course_id: Optional[str] = None
    session_visit_id: Optional[str] = None

@router.post("/platform-visit")
def handle_platform_visit(data: PlatformVisitRequest, db: Session = Depends(get_db)):
    is_new = record_platform_visit(db, data.session_visit_id)
    return {"new_visit_recorded": is_new}

@router.post("/deliberate-visit")
def handle_deliberate_visit(data: DeliberateVisitRequest, db: Session = Depends(get_db)):
    recorded = record_deliberate_visit(
        db=db,
        event_type=data.event_type,
        target_type=data.target_type,
        target_id=data.target_id,
        course_id=data.course_id
    )
    return {"recorded": recorded}

@router.post("/heartbeat")
def handle_heartbeat(data: HeartbeatRequest, db: Session = Depends(get_db)):
    record_heartbeat(
        db=db,
        duration_secs=data.duration_secs,
        course_id=data.course_id,
        session_visit_id=data.session_visit_id
    )
    return {"status": "ok"}

@router.get("/streak")
def get_streak(min_minutes: Optional[int] = None, db: Session = Depends(get_db)):
    threshold = min_minutes or settings.STREAK_MIN_MINUTES
    return calculate_study_streak(db, threshold)

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return get_analytics_metrics(db)

@router.delete("/clear")
def clear_activity(db: Session = Depends(get_db)):
    db.query(ActivityEvent).delete()
    db.commit()
    return {"message": "Activity log cleared successfully"}
