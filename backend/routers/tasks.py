import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Task
from backend.schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api/tasks", tags=["Tasks & Assignments"])

def task_to_dict(t: Task) -> dict:
    return {
        "id": t.id,
        "course_id": t.course_id,
        "topic_id": t.topic_id,
        "title": t.title,
        "description": t.description,
        "task_type": t.task_type,
        "due_date": t.due_date,
        "priority": t.priority,
        "status": t.status,
        "estimated_minutes": t.estimated_minutes,
        "actual_minutes": t.actual_minutes,
        "subtasks": json.loads(t.subtasks) if t.subtasks else [],
        "instructions": t.instructions,
        "submission_link": t.submission_link,
        "submission_text": t.submission_text,
        "marks": t.marks,
        "feedback": t.feedback,
        "reflection": t.reflection,
        "completed_at": t.completed_at,
        "is_demo": t.is_demo,
        "created_at": t.created_at,
        "updated_at": t.updated_at
    }

@router.get("", response_model=List[TaskOut])
def list_tasks(
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if course_id: query = query.filter(Task.course_id == course_id)
    if topic_id: query = query.filter(Task.topic_id == topic_id)
    if task_type: query = query.filter(Task.task_type == task_type)
    if status: query = query.filter(Task.status == status)
    if priority: query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.due_date.asc(), Task.created_at.desc()).all()
    return [task_to_dict(t) for t in tasks]

@router.post("", response_model=TaskOut)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    t = Task(
        course_id=data.course_id,
        topic_id=data.topic_id,
        title=data.title,
        description=data.description or "",
        task_type=data.task_type or "study",
        due_date=data.due_date,
        priority=data.priority or "medium",
        status=data.status or "todo",
        estimated_minutes=data.estimated_minutes or 30,
        subtasks=json.dumps(data.subtasks or []),
        instructions=data.instructions or "",
        submission_link=data.submission_link,
        submission_text=data.submission_text or ""
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return task_to_dict(t)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, data: TaskUpdate, db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.course_id is not None: t.course_id = data.course_id
    if data.topic_id is not None: t.topic_id = data.topic_id
    if data.title is not None: t.title = data.title
    if data.description is not None: t.description = data.description
    if data.task_type is not None: t.task_type = data.task_type
    if data.due_date is not None: t.due_date = data.due_date
    if data.priority is not None: t.priority = data.priority
    if data.status is not None:
        t.status = data.status
        if data.status == "completed" and not t.completed_at:
            t.completed_at = datetime.now(timezone.utc)
        elif data.status != "completed":
            t.completed_at = None
    if data.estimated_minutes is not None: t.estimated_minutes = data.estimated_minutes
    if data.actual_minutes is not None: t.actual_minutes = data.actual_minutes
    if data.subtasks is not None: t.subtasks = json.dumps(data.subtasks)
    if data.instructions is not None: t.instructions = data.instructions
    if data.submission_link is not None: t.submission_link = data.submission_link
    if data.submission_text is not None: t.submission_text = data.submission_text
    if data.marks is not None: t.marks = data.marks
    if data.feedback is not None: t.feedback = data.feedback
    if data.reflection is not None: t.reflection = data.reflection

    db.commit()
    db.refresh(t)
    return task_to_dict(t)

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(t)
    db.commit()
    return {"message": "Task deleted successfully"}
