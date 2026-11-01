import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserOut, UserUpdate
from backend.config import settings, is_serverless

router = APIRouter(prefix="/api/user", tags=["User & Settings"])

def verify_destructive_access(x_learnova_token: Optional[str] = Header(None, alias="X-Learnova-Token")):
    """
    Enforces access protection on destructive routes (deleting courses/resources, restoring backups, cleaning demo data).
    Required when REQUIRE_AUTH is true or when running in serverless preview/production.
    """
    if not (settings.REQUIRE_AUTH or is_serverless):
        return True

    expected = settings.LEARNOVA_ACCESS_TOKEN
    if not x_learnova_token or x_learnova_token.strip() != expected:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Destructive operations require a valid X-Learnova-Token."
        )
    return True

def get_or_create_user(db: Session) -> User:
    u = db.query(User).first()
    if not u:
        u = User(
            name="Maheswar",
            email="maheswar@learnova.edu",
            preferences=json.dumps({
                "dark_mode": False,
                "ai_provider": "gemini",
                "ai_model": "gemini-2.5-flash",
                "ai_api_key": "",
                "preferred_explanation_language": "English",
                "preferred_depth": "balanced",
                "streak_min_minutes": 15,
                "idle_timeout_minutes": 30,
                "daily_card_limit": 20,
                "daily_review_limit": 50,
                "timezone": "UTC",
                "quiet_hours_start": "22:00",
                "quiet_hours_end": "07:00"
            })
        )
        db.add(u)
        db.commit()
        db.refresh(u)
    return u

@router.get("/me", response_model=UserOut)
def get_current_user(db: Session = Depends(get_db)):
    u = get_or_create_user(db)
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "avatar_url": u.avatar_url,
        "preferences": json.loads(u.preferences) if u.preferences else {},
        "created_at": u.created_at
    }

@router.put("/me", response_model=UserOut)
def update_user_preferences(data: UserUpdate, db: Session = Depends(get_db)):
    u = get_or_create_user(db)
    if data.name is not None: u.name = data.name
    if data.email is not None: u.email = data.email
    if data.avatar_url is not None: u.avatar_url = data.avatar_url
    if data.preferences is not None:
        curr = json.loads(u.preferences) if u.preferences else {}
        curr.update(data.preferences)
        u.preferences = json.dumps(curr)

    db.commit()
    db.refresh(u)
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "avatar_url": u.avatar_url,
        "preferences": json.loads(u.preferences) if u.preferences else {},
        "created_at": u.created_at
    }
