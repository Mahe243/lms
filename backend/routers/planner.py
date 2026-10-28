from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import CalendarEvent, Task
from backend.schemas import CalendarEventCreate, CalendarEventOut

router = APIRouter(prefix="/api/planner", tags=["Study Planner & Calendar"])

@router.get("/events", response_model=List[CalendarEventOut])
def list_calendar_events(
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    course_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CalendarEvent)
    if start:
        query = query.filter(CalendarEvent.end_time >= start)
    if end:
        query = query.filter(CalendarEvent.start_time <= end)
    if course_id:
        query = query.filter(CalendarEvent.course_id == course_id)

    events = query.order_by(CalendarEvent.start_time.asc()).all()
    return events

@router.post("/events", response_model=CalendarEventOut)
def create_calendar_event(data: CalendarEventCreate, db: Session = Depends(get_db)):
    ev = CalendarEvent(
        course_id=data.course_id,
        topic_id=data.topic_id,
        title=data.title,
        event_type=data.event_type or "session",
        start_time=data.start_time,
        end_time=data.end_time,
        is_all_day=data.is_all_day or False,
        is_recurring=data.is_recurring or False,
        recurrence_rule=data.recurrence_rule,
        reminder_mins_before=data.reminder_mins_before or 15,
        related_task_id=data.related_task_id
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

@router.put("/events/{event_id}", response_model=CalendarEventOut)
def update_calendar_event(
    event_id: str,
    title: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    is_completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    ev = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    if title is not None: ev.title = title
    if start_time is not None: ev.start_time = start_time
    if end_time is not None: ev.end_time = end_time
    if is_completed is not None: ev.is_completed = is_completed
    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/events/{event_id}")
def delete_calendar_event(event_id: str, db: Session = Depends(get_db)):
    ev = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(ev)
    db.commit()
    return {"message": "Calendar event deleted successfully"}

@router.get("/conflicts")
def check_workload_conflicts(db: Session = Depends(get_db)):
    """
    Identifies overlapping scheduled study sessions and exams.
    """
    events = db.query(CalendarEvent).filter(CalendarEvent.is_completed == False).order_by(CalendarEvent.start_time.asc()).all()
    conflicts = []
    for i in range(len(events)):
        for j in range(i + 1, len(events)):
            ev1 = events[i]
            ev2 = events[j]
            # Check overlap
            if ev1.start_time < ev2.end_time and ev1.end_time > ev2.start_time:
                conflicts.append({
                    "event_1": {"id": ev1.id, "title": ev1.title, "start": ev1.start_time, "end": ev1.end_time},
                    "event_2": {"id": ev2.id, "title": ev2.title, "start": ev2.start_time, "end": ev2.end_time},
                    "warning": f"Time conflict between '{ev1.title}' and '{ev2.title}'"
                })
    return conflicts
