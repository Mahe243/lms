import json
import csv
import io
import zipfile
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    Course, Module, Topic, Subtopic, Note, NoteVersion, Resource, ResourceChunk,
    Comment, FlashcardDeck, Flashcard, FlashcardReview, QuestionBank, Question,
    QuizAttempt, ActiveLearningItem, StudySession, ActivityEvent, Task,
    CalendarEvent, Goal, JournalEntry, Notification
)
from backend.services.demo_data import seed_demo_data, clean_demo_data

router = APIRouter(prefix="/api/backup", tags=["Data Backup & Restore"])

@router.get("/export")
def export_full_backup(db: Session = Depends(get_db)):
    """
    Exports the complete workspace as structured JSON.
    """
    courses = [
        {
            "id": c.id, "name": c.name, "description": c.description,
            "category": c.category, "instructor": c.instructor,
            "start_date": c.start_date, "target_completion_date": c.target_completion_date,
            "exam_date": c.exam_date, "priority": c.priority, "cover_color": c.cover_color,
            "tags": c.tags, "syllabus": c.syllabus, "learning_goals": c.learning_goals,
            "status": c.status, "is_demo": c.is_demo
        } for c in db.query(Course).all()
    ]
    modules = [
        {
            "id": m.id, "course_id": m.course_id, "title": m.title,
            "description": m.description, "order_index": m.order_index
        } for m in db.query(Module).all()
    ]
    topics = [
        {
            "id": t.id, "module_id": t.module_id, "course_id": t.course_id,
            "title": t.title, "description": t.description,
            "learning_objectives": t.learning_objectives, "estimated_minutes": t.estimated_minutes,
            "status": t.status, "understanding_level": t.understanding_level,
            "is_optional": t.is_optional, "order_index": t.order_index,
            "personal_questions": t.personal_questions,
            "revision_interval_days": t.revision_interval_days, "revision_count": t.revision_count
        } for t in db.query(Topic).all()
    ]
    subtopics = [
        {
            "id": st.id, "topic_id": st.topic_id, "title": st.title,
            "description": st.description, "order_index": st.order_index, "is_completed": st.is_completed
        } for st in db.query(Subtopic).all()
    ]
    notes = [
        {
            "id": n.id, "course_id": n.course_id, "topic_id": n.topic_id,
            "title": n.title, "content": n.content, "summary": n.summary,
            "tags": n.tags, "is_pinned": n.is_pinned, "is_favorite": n.is_favorite,
            "needs_revision": n.needs_revision, "template_type": n.template_type,
            "is_deleted": n.is_deleted, "is_demo": n.is_demo
        } for n in db.query(Note).all()
    ]
    resources = [
        {
            "id": r.id, "course_id": r.course_id, "topic_id": r.topic_id,
            "title": r.title, "type": r.type, "url": r.url, "description": r.description,
            "author": r.author, "tags": r.tags, "estimated_duration_mins": r.estimated_duration_mins,
            "status": r.status, "personal_rating": r.personal_rating, "is_favorite": r.is_favorite,
            "extracted_text": r.extracted_text, "is_demo": r.is_demo
        } for r in db.query(Resource).all()
    ]
    comments = [
        {
            "id": cm.id, "target_type": cm.target_type, "target_id": cm.target_id,
            "course_id": cm.course_id, "topic_id": cm.topic_id, "text": cm.text,
            "comment_type": cm.comment_type, "is_resolved": cm.is_resolved,
            "resolution_notes": cm.resolution_notes, "is_pinned": cm.is_pinned,
            "priority": cm.priority, "is_demo": cm.is_demo
        } for cm in db.query(Comment).all()
    ]
    decks = [
        {
            "id": d.id, "course_id": d.course_id, "topic_id": d.topic_id,
            "name": d.name, "description": d.description, "tags": d.tags, "is_demo": d.is_demo
        } for d in db.query(FlashcardDeck).all()
    ]
    cards = [
        {
            "id": fc.id, "deck_id": fc.deck_id, "course_id": fc.course_id, "topic_id": fc.topic_id,
            "card_type": fc.card_type, "front": fc.front, "back": fc.back, "cloze_text": fc.cloze_text,
            "explanation": fc.explanation, "source_ref": fc.source_ref, "tags": fc.tags,
            "reps": fc.reps, "lapses": fc.lapses, "stability": fc.stability, "state": fc.state,
            "interval_days": fc.interval_days, "is_demo": fc.is_demo
        } for fc in db.query(Flashcard).all()
    ]
    banks = [
        {"id": b.id, "course_id": b.course_id, "topic_id": b.topic_id, "name": b.name, "description": b.description, "is_demo": b.is_demo}
        for b in db.query(QuestionBank).all()
    ]
    questions = [
        {
            "id": q.id, "bank_id": q.bank_id, "course_id": q.course_id, "topic_id": q.topic_id,
            "question_type": q.question_type, "question_text": q.question_text, "options": q.options,
            "correct_answer": q.correct_answer, "numerical_tolerance": q.numerical_tolerance,
            "numerical_unit": q.numerical_unit, "matching_pairs": q.matching_pairs,
            "order_items": q.order_items, "explanation": q.explanation, "difficulty": q.difficulty, "is_demo": q.is_demo
        } for q in db.query(Question).all()
    ]
    tasks = [
        {
            "id": tk.id, "course_id": tk.course_id, "topic_id": tk.topic_id,
            "title": tk.title, "description": tk.description, "task_type": tk.task_type,
            "priority": tk.priority, "status": tk.status, "estimated_minutes": tk.estimated_minutes,
            "subtasks": tk.subtasks, "instructions": tk.instructions, "is_demo": tk.is_demo
        } for tk in db.query(Task).all()
    ]
    goals = [
        {
            "id": g.id, "title": g.title, "goal_type": g.goal_type, "target_value": g.target_value,
            "current_value": g.current_value, "unit": g.unit, "period": g.period, "is_completed": g.is_completed, "is_demo": g.is_demo
        } for g in db.query(Goal).all()
    ]
    journals = [
        {
            "id": j.id, "entry_date": j.entry_date, "entry_type": j.entry_type,
            "learned_text": j.learned_text, "difficult_text": j.difficult_text,
            "unclear_text": j.unclear_text, "helped_text": j.helped_text, "next_text": j.next_text,
            "mood_rating": j.mood_rating, "is_demo": j.is_demo
        } for j in db.query(JournalEntry).all()
    ]

    backup_payload = {
        "version": "1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "courses": courses,
        "modules": modules,
        "topics": topics,
        "subtopics": subtopics,
        "notes": notes,
        "resources": resources,
        "comments": comments,
        "decks": decks,
        "flashcards": cards,
        "question_banks": banks,
        "questions": questions,
        "tasks": tasks,
        "goals": goals,
        "journal_entries": journals
    }

    return backup_payload

@router.post("/restore")
async def restore_backup(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Restores workspace from an exported JSON file while preserving relations and detecting duplicates.
    """
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")

    if "courses" not in data or "notes" not in data:
        raise HTTPException(status_code=400, detail="Unrecognized backup format")

    restored_counts = {"courses": 0, "notes": 0, "flashcards": 0, "tasks": 0}

    # Restore courses
    for c_data in data.get("courses", []):
        exists = db.query(Course).filter(Course.id == c_data["id"]).first()
        if not exists:
            c = Course(
                id=c_data["id"],
                name=c_data["name"],
                description=c_data.get("description", ""),
                category=c_data.get("category", "General"),
                instructor=c_data.get("instructor"),
                start_date=c_data.get("start_date"),
                target_completion_date=c_data.get("target_completion_date"),
                exam_date=c_data.get("exam_date"),
                priority=c_data.get("priority", "medium"),
                cover_color=c_data.get("cover_color", "#4f46e5"),
                tags=c_data.get("tags", "[]"),
                syllabus=c_data.get("syllabus", ""),
                learning_goals=c_data.get("learning_goals", "[]"),
                status=c_data.get("status", "active"),
                is_demo=False
            )
            db.add(c)
            restored_counts["courses"] += 1
    db.commit()

    # Restore modules
    for m_data in data.get("modules", []):
        exists = db.query(Module).filter(Module.id == m_data["id"]).first()
        if not exists:
            m = Module(
                id=m_data["id"],
                course_id=m_data["course_id"],
                title=m_data["title"],
                description=m_data.get("description", ""),
                order_index=m_data.get("order_index", 0)
            )
            db.add(m)
    db.commit()

    # Restore topics
    for t_data in data.get("topics", []):
        exists = db.query(Topic).filter(Topic.id == t_data["id"]).first()
        if not exists:
            t = Topic(
                id=t_data["id"],
                module_id=t_data["module_id"],
                course_id=t_data["course_id"],
                title=t_data["title"],
                description=t_data.get("description", ""),
                learning_objectives=t_data.get("learning_objectives", "[]"),
                estimated_minutes=t_data.get("estimated_minutes", 30),
                status=t_data.get("status", "not_started"),
                understanding_level=t_data.get("understanding_level", "unfamiliar"),
                is_optional=t_data.get("is_optional", False),
                order_index=t_data.get("order_index", 0),
                personal_questions=t_data.get("personal_questions", "[]"),
                revision_interval_days=t_data.get("revision_interval_days", 1),
                revision_count=t_data.get("revision_count", 0)
            )
            db.add(t)
    db.commit()

    # Restore notes
    for n_data in data.get("notes", []):
        exists = db.query(Note).filter(Note.id == n_data["id"]).first()
        if not exists:
            n = Note(
                id=n_data["id"],
                course_id=n_data.get("course_id"),
                topic_id=n_data.get("topic_id"),
                title=n_data["title"],
                content=n_data.get("content", ""),
                summary=n_data.get("summary", ""),
                tags=n_data.get("tags", "[]"),
                is_pinned=n_data.get("is_pinned", False),
                is_favorite=n_data.get("is_favorite", False),
                needs_revision=n_data.get("needs_revision", False),
                template_type=n_data.get("template_type", "general"),
                is_demo=False
            )
            db.add(n)
            restored_counts["notes"] += 1
    db.commit()

    # Restore flashcards
    for d_data in data.get("decks", []):
        if not db.query(FlashcardDeck).filter(FlashcardDeck.id == d_data["id"]).first():
            db.add(FlashcardDeck(
                id=d_data["id"],
                course_id=d_data.get("course_id"),
                topic_id=d_data.get("topic_id"),
                name=d_data["name"],
                description=d_data.get("description", ""),
                tags=d_data.get("tags", "[]"),
                is_demo=False
            ))
    db.commit()

    for fc_data in data.get("flashcards", []):
        if not db.query(Flashcard).filter(Flashcard.id == fc_data["id"]).first():
            db.add(Flashcard(
                id=fc_data["id"],
                deck_id=fc_data["deck_id"],
                course_id=fc_data.get("course_id"),
                topic_id=fc_data.get("topic_id"),
                card_type=fc_data.get("card_type", "basic"),
                front=fc_data["front"],
                back=fc_data["back"],
                cloze_text=fc_data.get("cloze_text"),
                explanation=fc_data.get("explanation", ""),
                source_ref=fc_data.get("source_ref"),
                tags=fc_data.get("tags", "[]"),
                reps=fc_data.get("reps", 0),
                lapses=fc_data.get("lapses", 0),
                stability=fc_data.get("stability", 2.5),
                state=fc_data.get("state", "new"),
                interval_days=fc_data.get("interval_days", 0),
                is_demo=False
            ))
            restored_counts["flashcards"] += 1
    db.commit()

    # Restore tasks
    for tk_data in data.get("tasks", []):
        if not db.query(Task).filter(Task.id == tk_data["id"]).first():
            db.add(Task(
                id=tk_data["id"],
                course_id=tk_data.get("course_id"),
                topic_id=tk_data.get("topic_id"),
                title=tk_data["title"],
                description=tk_data.get("description", ""),
                task_type=tk_data.get("task_type", "study"),
                priority=tk_data.get("priority", "medium"),
                status=tk_data.get("status", "todo"),
                estimated_minutes=tk_data.get("estimated_minutes", 30),
                subtasks=tk_data.get("subtasks", "[]"),
                instructions=tk_data.get("instructions", ""),
                is_demo=False
            ))
            restored_counts["tasks"] += 1
    db.commit()

    return {"message": "Backup successfully restored", "restored_counts": restored_counts}

@router.get("/export-notes-markdown")
def export_notes_markdown(db: Session = Depends(get_db)):
    """
    Downloads all notes as a zip archive containing Markdown (.md) files.
    """
    notes = db.query(Note).filter(Note.is_deleted == False).all()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for n in notes:
            clean_title = "".join(c for c in n.title if c.isalnum() or c in (" ", "-", "_")).rstrip()
            filename = f"{clean_title or 'Untitled'}_{n.id[:6]}.md"
            meta = f"---\ntitle: {n.title}\nsummary: {n.summary}\ntemplate: {n.template_type}\ncreated_at: {n.created_at}\n---\n\n"
            full_content = meta + (n.content or "")
            zf.writestr(filename, full_content)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=my_lms_notes.zip"}
    )

@router.get("/export-csv")
def export_activity_csv(db: Session = Depends(get_db)):
    """
    Exports activity events and study sessions as CSV.
    """
    events = db.query(ActivityEvent).order_by(ActivityEvent.timestamp.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Event Type", "Target Type", "Target ID", "Course ID", "Duration (Seconds)", "Timestamp"])

    for ev in events:
        writer.writerow([
            ev.id, ev.event_type, ev.target_type, ev.target_id, ev.course_id,
            ev.duration_secs, ev.timestamp.isoformat() if ev.timestamp else ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=activity_export.csv"}
    )

@router.post("/seed-demo")
def trigger_seed_demo(db: Session = Depends(get_db)):
    success = seed_demo_data(db)
    return {"message": "Demo data seeded successfully" if success else "Demo data already exists"}

@router.post("/clean-demo")
def trigger_clean_demo(db: Session = Depends(get_db)):
    deleted = clean_demo_data(db)
    return {"message": "Demo data cleaned successfully without modifying personal data", "deleted_counts": deleted}
