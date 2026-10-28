from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import JournalEntry
from backend.schemas import JournalEntryCreate, JournalEntryOut

router = APIRouter(prefix="/api/journal", tags=["Learning Journal"])

@router.get("", response_model=List[JournalEntryOut])
def list_journal_entries(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(JournalEntry)
    if course_id:
        query = query.filter(JournalEntry.course_id == course_id)
    entries = query.order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc()).all()
    return entries

@router.post("", response_model=JournalEntryOut)
def create_journal_entry(data: JournalEntryCreate, db: Session = Depends(get_db)):
    entry = JournalEntry(
        entry_date=data.entry_date,
        entry_type=data.entry_type or "daily",
        course_id=data.course_id,
        topic_id=data.topic_id,
        learned_text=data.learned_text or "",
        difficult_text=data.difficult_text or "",
        unclear_text=data.unclear_text or "",
        helped_text=data.helped_text or "",
        next_text=data.next_text or "",
        mood_rating=data.mood_rating or 3
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}
