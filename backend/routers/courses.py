import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Course, Module, Topic, Subtopic, Resource, QuizAttempt, TopicRevision
from backend.schemas import (
    CourseCreate, CourseUpdate, CourseOut, CourseProgress,
    ModuleCreate, ModuleUpdate, ModuleOut,
    TopicCreate, TopicUpdate, TopicOut,
    SubtopicCreate, SubtopicOut
)

router = APIRouter(prefix="/api/courses", tags=["Courses"])

def calculate_course_progress(db: Session, course_id: str) -> CourseProgress:
    topics = db.query(Topic).filter(Topic.course_id == course_id).all()
    non_opt_topics = [t for t in topics if not t.is_optional]
    total_non_opt = len(non_opt_topics)
    completed_non_opt = sum(1 for t in non_opt_topics if t.status == "completed")
    
    pct = (completed_non_opt / total_non_opt * 100.0) if total_non_opt > 0 else 0.0

    opt_topics = [t for t in topics if t.is_optional]
    completed_opt = sum(1 for t in opt_topics if t.status == "completed")

    # Resource completion
    resources = db.query(Resource).filter(Resource.course_id == course_id, Resource.is_deleted == False).all()
    total_res = len(resources)
    completed_res = sum(1 for r in resources if r.status == "completed")
    res_pct = (completed_res / total_res * 100.0) if total_res > 0 else 0.0

    # Quiz average
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.course_id == course_id).all()
    avg_quiz = (sum(a.percentage for a in quiz_attempts) / len(quiz_attempts)) if quiz_attempts else 0.0

    # Revision readiness (topics needing revision)
    needs_rev = sum(1 for t in topics if t.status == "needs_revision")
    rev_readiness = max(0.0, 100.0 - (needs_rev * 15.0))

    return CourseProgress(
        completed_topics=completed_non_opt,
        total_topics=total_non_opt,
        completion_percentage=round(pct, 1),
        optional_topics_count=len(opt_topics),
        completed_optional_topics=completed_opt,
        resource_count=total_res,
        completed_resources=completed_res,
        resource_completion_percentage=round(res_pct, 1),
        quiz_average_percentage=round(avg_quiz, 1),
        revision_readiness_score=round(rev_readiness, 1)
    )

def course_to_dict(c: Course, progress: Optional[CourseProgress] = None) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "category": c.category,
        "instructor": c.instructor,
        "start_date": c.start_date,
        "target_completion_date": c.target_completion_date,
        "exam_date": c.exam_date,
        "priority": c.priority,
        "cover_color": c.cover_color,
        "tags": json.loads(c.tags) if c.tags else [],
        "syllabus": c.syllabus,
        "learning_goals": json.loads(c.learning_goals) if c.learning_goals else [],
        "status": c.status,
        "is_demo": c.is_demo,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "modules": [
            {
                "id": m.id,
                "course_id": m.course_id,
                "title": m.title,
                "description": m.description,
                "order_index": m.order_index,
                "created_at": m.created_at,
                "updated_at": m.updated_at,
                "topics": [
                    {
                        "id": t.id,
                        "module_id": t.module_id,
                        "course_id": t.course_id,
                        "title": t.title,
                        "description": t.description,
                        "learning_objectives": json.loads(t.learning_objectives) if t.learning_objectives else [],
                        "estimated_minutes": t.estimated_minutes,
                        "status": t.status,
                        "understanding_level": t.understanding_level,
                        "is_optional": t.is_optional,
                        "order_index": t.order_index,
                        "personal_questions": json.loads(t.personal_questions) if t.personal_questions else [],
                        "last_studied_at": t.last_studied_at,
                        "next_revision_at": t.next_revision_at,
                        "revision_interval_days": t.revision_interval_days,
                        "revision_count": t.revision_count,
                        "created_at": t.created_at,
                        "updated_at": t.updated_at,
                        "subtopics": [
                            {
                                "id": st.id,
                                "topic_id": st.topic_id,
                                "title": st.title,
                                "description": st.description,
                                "order_index": st.order_index,
                                "is_completed": st.is_completed,
                                "created_at": st.created_at
                            } for st in t.subtopics
                        ]
                    } for t in m.topics
                ]
            } for m in c.modules
        ],
        "progress": progress
    }

@router.get("", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    results = []
    for c in courses:
        prog = calculate_course_progress(db, c.id)
        results.append(course_to_dict(c, prog))
    return results

@router.post("", response_model=CourseOut)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    c = Course(
        name=data.name,
        description=data.description or "",
        category=data.category or "General",
        instructor=data.instructor,
        start_date=data.start_date,
        target_completion_date=data.target_completion_date,
        exam_date=data.exam_date,
        priority=data.priority or "medium",
        cover_color=data.cover_color or "#4f46e5",
        tags=json.dumps(data.tags or []),
        syllabus=data.syllabus or "",
        learning_goals=json.dumps(data.learning_goals or []),
        status=data.status or "active"
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    prog = calculate_course_progress(db, c.id)
    return course_to_dict(c, prog)

@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    prog = calculate_course_progress(db, c.id)
    return course_to_dict(c, prog)

@router.put("/{course_id}", response_model=CourseOut)
def update_course(course_id: str, data: CourseUpdate, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if data.name is not None: c.name = data.name
    if data.description is not None: c.description = data.description
    if data.category is not None: c.category = data.category
    if data.instructor is not None: c.instructor = data.instructor
    if data.start_date is not None: c.start_date = data.start_date
    if data.target_completion_date is not None: c.target_completion_date = data.target_completion_date
    if data.exam_date is not None: c.exam_date = data.exam_date
    if data.priority is not None: c.priority = data.priority
    if data.cover_color is not None: c.cover_color = data.cover_color
    if data.tags is not None: c.tags = json.dumps(data.tags)
    if data.syllabus is not None: c.syllabus = data.syllabus
    if data.learning_goals is not None: c.learning_goals = json.dumps(data.learning_goals)
    if data.status is not None: c.status = data.status

    db.commit()
    db.refresh(c)
    prog = calculate_course_progress(db, c.id)
    return course_to_dict(c, prog)

@router.delete("/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(c)
    db.commit()
    return {"message": "Course deleted successfully"}

# Modules
@router.post("/{course_id}/modules", response_model=ModuleOut)
def create_module(course_id: str, data: ModuleCreate, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    
    mod = Module(
        course_id=course_id,
        title=data.title,
        description=data.description or "",
        order_index=data.order_index or len(c.modules) + 1
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return mod

@router.put("/modules/{module_id}", response_model=ModuleOut)
def update_module(module_id: str, data: ModuleUpdate, db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    if data.title is not None: mod.title = data.title
    if data.description is not None: mod.description = data.description
    if data.order_index is not None: mod.order_index = data.order_index
    db.commit()
    db.refresh(mod)
    return mod

@router.delete("/modules/{module_id}")
def delete_module(module_id: str, db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(mod)
    db.commit()
    return {"message": "Module deleted successfully"}

# Topics
@router.post("/modules/{module_id}/topics")
def create_topic(module_id: str, data: TopicCreate, db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    
    topic = Topic(
        module_id=module_id,
        course_id=mod.course_id,
        title=data.title,
        description=data.description or "",
        learning_objectives=json.dumps(data.learning_objectives or []),
        estimated_minutes=data.estimated_minutes or 30,
        status=data.status or "not_started",
        understanding_level=data.understanding_level or "unfamiliar",
        is_optional=data.is_optional or False,
        order_index=data.order_index or len(mod.topics) + 1,
        personal_questions=json.dumps(data.personal_questions or [])
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return {
        "id": topic.id,
        "module_id": topic.module_id,
        "course_id": topic.course_id,
        "title": topic.title,
        "description": topic.description,
        "learning_objectives": json.loads(topic.learning_objectives) if topic.learning_objectives else [],
        "estimated_minutes": topic.estimated_minutes,
        "status": topic.status,
        "understanding_level": topic.understanding_level,
        "is_optional": topic.is_optional,
        "order_index": topic.order_index,
        "personal_questions": json.loads(topic.personal_questions) if topic.personal_questions else [],
        "subtopics": []
    }

@router.put("/topics/{topic_id}")
def update_topic(topic_id: str, data: TopicUpdate, db: Session = Depends(get_db)):
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    if data.title is not None: t.title = data.title
    if data.description is not None: t.description = data.description
    if data.learning_objectives is not None: t.learning_objectives = json.dumps(data.learning_objectives)
    if data.estimated_minutes is not None: t.estimated_minutes = data.estimated_minutes
    if data.status is not None: t.status = data.status
    if data.understanding_level is not None: t.understanding_level = data.understanding_level
    if data.is_optional is not None: t.is_optional = data.is_optional
    if data.order_index is not None: t.order_index = data.order_index
    if data.personal_questions is not None: t.personal_questions = json.dumps(data.personal_questions)
    if data.next_revision_at is not None: t.next_revision_at = data.next_revision_at
    if data.last_studied_at is not None: t.last_studied_at = data.last_studied_at

    db.commit()
    db.refresh(t)
    return {
        "id": t.id,
        "module_id": t.module_id,
        "course_id": t.course_id,
        "title": t.title,
        "description": t.description,
        "learning_objectives": json.loads(t.learning_objectives) if t.learning_objectives else [],
        "estimated_minutes": t.estimated_minutes,
        "status": t.status,
        "understanding_level": t.understanding_level,
        "is_optional": t.is_optional,
        "order_index": t.order_index,
        "personal_questions": json.loads(t.personal_questions) if t.personal_questions else [],
        "subtopics": []
    }

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: str, db: Session = Depends(get_db)):
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(t)
    db.commit()
    return {"message": "Topic deleted successfully"}

# Subtopics
@router.post("/topics/{topic_id}/subtopics", response_model=SubtopicOut)
def create_subtopic(topic_id: str, data: SubtopicCreate, db: Session = Depends(get_db)):
    st = Subtopic(
        topic_id=topic_id,
        title=data.title,
        description=data.description or "",
        order_index=data.order_index or 0
    )
    db.add(st)
    db.commit()
    db.refresh(st)
    return st

@router.put("/subtopics/{subtopic_id}")
def update_subtopic(subtopic_id: str, is_completed: Optional[bool] = None, title: Optional[str] = None, db: Session = Depends(get_db)):
    st = db.query(Subtopic).filter(Subtopic.id == subtopic_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    if is_completed is not None: st.is_completed = is_completed
    if title is not None: st.title = title
    db.commit()
    db.refresh(st)
    return st

@router.delete("/subtopics/{subtopic_id}")
def delete_subtopic(subtopic_id: str, db: Session = Depends(get_db)):
    st = db.query(Subtopic).filter(Subtopic.id == subtopic_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    db.delete(st)
    db.commit()
    return {"message": "Subtopic deleted successfully"}
