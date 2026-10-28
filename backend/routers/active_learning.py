import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ActiveLearningItem
from backend.schemas import ActiveLearningCreate, ActiveLearningUpdate, ActiveLearningOut

router = APIRouter(prefix="/api/active-learning", tags=["Active Learning Tools"])

def item_to_dict(item: ActiveLearningItem) -> dict:
    return {
        "id": item.id,
        "item_type": item.item_type,
        "course_id": item.course_id,
        "topic_id": item.topic_id,
        "title": item.title,
        "content": json.loads(item.content) if item.content else {},
        "reflection_notes": item.reflection_notes,
        "mastery_level": item.mastery_level,
        "is_demo": item.is_demo,
        "created_at": item.created_at,
        "updated_at": item.updated_at
    }

@router.get("", response_model=List[ActiveLearningOut])
def list_items(
    item_type: Optional[str] = None, # teach_back, formula, concept_comparison, glossary, mistake
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ActiveLearningItem)
    if item_type: query = query.filter(ActiveLearningItem.item_type == item_type)
    if course_id: query = query.filter(ActiveLearningItem.course_id == course_id)
    if topic_id: query = query.filter(ActiveLearningItem.topic_id == topic_id)
    items = query.order_by(ActiveLearningItem.created_at.desc()).all()
    return [item_to_dict(i) for i in items]

@router.post("", response_model=ActiveLearningOut)
def create_item(data: ActiveLearningCreate, db: Session = Depends(get_db)):
    item = ActiveLearningItem(
        item_type=data.item_type,
        course_id=data.course_id,
        topic_id=data.topic_id,
        title=data.title,
        content=json.dumps(data.content),
        reflection_notes=data.reflection_notes or "",
        mastery_level=data.mastery_level or "learning"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item_to_dict(item)

@router.put("/{item_id}", response_model=ActiveLearningOut)
def update_item(item_id: str, data: ActiveLearningUpdate, db: Session = Depends(get_db)):
    item = db.query(ActiveLearningItem).filter(ActiveLearningItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if data.title is not None: item.title = data.title
    if data.content is not None: item.content = json.dumps(data.content)
    if data.reflection_notes is not None: item.reflection_notes = data.reflection_notes
    if data.mastery_level is not None: item.mastery_level = data.mastery_level

    db.commit()
    db.refresh(item)
    return item_to_dict(item)

@router.delete("/{item_id}")
def delete_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(ActiveLearningItem).filter(ActiveLearningItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}
