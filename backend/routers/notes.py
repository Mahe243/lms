import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Note, NoteVersion, NoteLink
from backend.schemas import NoteCreate, NoteUpdate, NoteOut, NoteVersionOut

router = APIRouter(prefix="/api/notes", tags=["Notes"])

NOTE_TEMPLATES = [
    {
        "id": "lecture",
        "name": "Lecture Notes",
        "description": "Structured format with main ideas, key takeaways, and summary",
        "content": "# Lecture Title\n\n**Instructor:** \n**Date:** \n\n## 1. Key Concepts\n- \n\n## 2. Detailed Notes\n\n## 3. Questions & Doubts\n- [ ] \n\n## 4. Summary\n"
    },
    {
        "id": "video",
        "name": "Video Notes",
        "description": "Timestamped video study notes with core takeaways",
        "content": "# Video Title\n\n**Video URL:** \n**Speaker / Channel:** \n\n## Timestamps & Observations\n- **[00:00]** Introduction\n- **[02:30]** \n\n## Key Diagrams & Insights\n\n## Action Items\n- [ ] "
    },
    {
        "id": "reading",
        "name": "Reading & Paper Notes",
        "description": "Research paper or textbook chapter analysis",
        "content": "# Paper / Book Title\n\n**Authors:** \n**Publication / Edition:** \n\n## Core Thesis & Contribution\n\n## Methodology & Architecture\n\n## Strengths & Limitations\n\n## Reflection\n"
    },
    {
        "id": "case_analysis",
        "name": "Case Analysis",
        "description": "Problem statement, constraints, solutions, and tradeoffs",
        "content": "# Case Title\n\n## Problem Statement\n\n## Key Constraints\n\n## Proposed Architecture / Solution\n\n## Trade-offs & Alternatives\n"
    },
    {
        "id": "formula_sheet",
        "name": "Formula & Reference Sheet",
        "description": "Mathematical formulas, definitions, units, and assumptions",
        "content": "# Formula Sheet\n\n## Formula 1\n`LaTeX / Formula`\n- **Variables:**\n- **Assumptions:**\n- **Example Application:**\n"
    },
    {
        "id": "exam_revision",
        "name": "Exam Revision Sheet",
        "description": "High-yield topics, must-know proofs, and common pitfalls",
        "content": "# Exam High-Yield Revision\n\n## Must-Remember Theorems & Invariants\n1. \n\n## Common Pitfalls & Mistakes\n- \n\n## Practice Checklist\n- [ ] "
    },
    {
        "id": "questions_doubts",
        "name": "Questions & Doubts Log",
        "description": "Track unresolved conceptual questions and tutor insights",
        "content": "# Doubt & Inquiry Log\n\n## Doubt Statement\n\n## What I Tried / Why It's Confusing\n\n## AI Tutor / Instructor Explanation\n\n## Resolution Status: Unresolved\n"
    },
    {
        "id": "weekly_review",
        "name": "Weekly Learning Review",
        "description": "Reflect on weekly milestones, bottlenecks, and next week plan",
        "content": "# Weekly Learning Review\n\n## Highlights & Topics Mastered\n- \n\n## Difficulties & Blockers\n- \n\n## Next Week Study Goals\n1. \n"
    }
]

def note_to_dict(n: Note, db: Session) -> dict:
    # Find backlinks (other notes mentioning this note's ID or title)
    backlinks = []
    other_notes = db.query(Note).filter(Note.id != n.id, Note.is_deleted == False).all()
    for on in other_notes:
        if n.id in on.content or f"[[{n.title}]]" in on.content:
            backlinks.append(on.title)

    return {
        "id": n.id,
        "course_id": n.course_id,
        "topic_id": n.topic_id,
        "title": n.title,
        "content": n.content,
        "summary": n.summary,
        "tags": json.loads(n.tags) if n.tags else [],
        "is_pinned": n.is_pinned,
        "is_favorite": n.is_favorite,
        "needs_revision": n.needs_revision,
        "template_type": n.template_type,
        "is_deleted": n.is_deleted,
        "deleted_at": n.deleted_at,
        "created_at": n.created_at,
        "updated_at": n.updated_at,
        "backlinks": backlinks,
        "is_demo": n.is_demo
    }

@router.get("/templates")
def get_templates():
    return NOTE_TEMPLATES

@router.get("", response_model=List[NoteOut])
def list_notes(
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_favorite: Optional[bool] = None,
    needs_revision: Optional[bool] = None,
    in_trash: bool = False,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.is_deleted == in_trash)
    if course_id:
        query = query.filter(Note.course_id == course_id)
    if topic_id:
        query = query.filter(Note.topic_id == topic_id)
    if is_pinned is not None:
        query = query.filter(Note.is_pinned == is_pinned)
    if is_favorite is not None:
        query = query.filter(Note.is_favorite == is_favorite)
    if needs_revision is not None:
        query = query.filter(Note.needs_revision == needs_revision)

    notes = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).all()
    
    if tag:
        notes = [n for n in notes if tag in (json.loads(n.tags) if n.tags else [])]

    return [note_to_dict(n, db) for n in notes]

@router.post("", response_model=NoteOut)
def create_note(data: NoteCreate, db: Session = Depends(get_db)):
    n = Note(
        course_id=data.course_id,
        topic_id=data.topic_id,
        title=data.title,
        content=data.content or "",
        summary=data.summary or "",
        tags=json.dumps(data.tags or []),
        is_pinned=data.is_pinned or False,
        is_favorite=data.is_favorite or False,
        needs_revision=data.needs_revision or False,
        template_type=data.template_type or "general"
    )
    db.add(n)
    db.commit()
    db.refresh(n)

    # Initial version
    nv = NoteVersion(
        note_id=n.id,
        version_number=1,
        title=n.title,
        content=n.content,
        summary=n.summary
    )
    db.add(nv)
    db.commit()

    return note_to_dict(n, db)

@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: str, db: Session = Depends(get_db)):
    n = db.query(Note).filter(Note.id == note_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")
    return note_to_dict(n, db)

@router.put("/{note_id}", response_model=NoteOut)
def update_note(note_id: str, data: NoteUpdate, db: Session = Depends(get_db)):
    n = db.query(Note).filter(Note.id == note_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")

    content_changed = data.content is not None and data.content != n.content

    if data.course_id is not None: n.course_id = data.course_id
    if data.topic_id is not None: n.topic_id = data.topic_id
    if data.title is not None: n.title = data.title
    if data.content is not None: n.content = data.content
    if data.summary is not None: n.summary = data.summary
    if data.tags is not None: n.tags = json.dumps(data.tags)
    if data.is_pinned is not None: n.is_pinned = data.is_pinned
    if data.is_favorite is not None: n.is_favorite = data.is_favorite
    if data.needs_revision is not None: n.needs_revision = data.needs_revision
    if data.template_type is not None: n.template_type = data.template_type

    if content_changed:
        # Create version snapshot if changed
        latest_v = db.query(NoteVersion).filter(NoteVersion.note_id == n.id).order_by(NoteVersion.version_number.desc()).first()
        next_v_num = (latest_v.version_number + 1) if latest_v else 1
        nv = NoteVersion(
            note_id=n.id,
            version_number=next_v_num,
            title=n.title,
            content=n.content,
            summary=n.summary
        )
        db.add(nv)

    db.commit()
    db.refresh(n)
    return note_to_dict(n, db)

@router.delete("/{note_id}")
def delete_note(note_id: str, permanent: bool = False, db: Session = Depends(get_db)):
    n = db.query(Note).filter(Note.id == note_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")

    if permanent or n.is_deleted:
        # Permanent deletion
        db.delete(n)
        db.commit()
        return {"message": "Note permanently deleted"}
    else:
        # Move to trash
        n.is_deleted = True
        n.deleted_at = datetime.now(timezone.utc)
        db.commit()
        return {"message": "Note moved to trash"}

@router.post("/{note_id}/restore", response_model=NoteOut)
def restore_note(note_id: str, db: Session = Depends(get_db)):
    n = db.query(Note).filter(Note.id == note_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")
    n.is_deleted = False
    n.deleted_at = None
    db.commit()
    db.refresh(n)
    return note_to_dict(n, db)

@router.get("/{note_id}/versions", response_model=List[NoteVersionOut])
def get_note_versions(note_id: str, db: Session = Depends(get_db)):
    versions = db.query(NoteVersion).filter(NoteVersion.note_id == note_id).order_by(NoteVersion.version_number.desc()).all()
    return versions
