from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Goal
from backend.schemas import GoalCreate, GoalUpdate, GoalOut

router = APIRouter(prefix="/api/goals", tags=["Goals & Habit Trackers"])

def goal_to_dict(g: Goal) -> dict:
    pct = round((g.current_value / g.target_value * 100.0), 1) if g.target_value > 0 else 0.0
    return {
        "id": g.id,
        "title": g.title,
        "goal_type": g.goal_type,
        "target_value": g.target_value,
        "current_value": g.current_value,
        "unit": g.unit,
        "period": g.period,
        "deadline": g.deadline,
        "course_id": g.course_id,
        "topic_id": g.topic_id,
        "is_completed": g.is_completed,
        "progress_percentage": min(100.0, pct),
        "is_demo": g.is_demo,
        "created_at": g.created_at,
        "updated_at": g.updated_at
    }

@router.get("", response_model=List[GoalOut])
def list_goals(period: Optional[str] = None, course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Goal)
    if period: query = query.filter(Goal.period == period)
    if course_id: query = query.filter(Goal.course_id == course_id)
    goals = query.order_by(Goal.is_completed.asc(), Goal.created_at.desc()).all()
    return [goal_to_dict(g) for g in goals]

@router.post("", response_model=GoalOut)
def create_goal(data: GoalCreate, db: Session = Depends(get_db)):
    g = Goal(
        title=data.title,
        goal_type=data.goal_type or "hours",
        target_value=data.target_value,
        current_value=data.current_value or 0.0,
        unit=data.unit or "hours",
        period=data.period or "weekly",
        deadline=data.deadline,
        course_id=data.course_id,
        topic_id=data.topic_id,
        is_completed=(data.current_value or 0.0) >= data.target_value
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return goal_to_dict(g)

@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: str, data: GoalUpdate, db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")

    if data.title is not None: g.title = data.title
    if data.target_value is not None: g.target_value = data.target_value
    if data.current_value is not None:
        g.current_value = data.current_value
        g.is_completed = g.current_value >= g.target_value
    if data.unit is not None: g.unit = data.unit
    if data.period is not None: g.period = data.period
    if data.deadline is not None: g.deadline = data.deadline
    if data.is_completed is not None: g.is_completed = data.is_completed

    db.commit()
    db.refresh(g)
    return goal_to_dict(g)

@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(g)
    db.commit()
    return {"message": "Goal deleted successfully"}
