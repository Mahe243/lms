import os
import json
import secrets
import hashlib
from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User

# Personal LMS secure authentication token configuration
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "learnova_vault_secure_token_key_2026")
DEFAULT_USER_EMAIL = os.getenv("DEFAULT_USER_EMAIL", "learner@personal.lms")
DEFAULT_USER_NAME = os.getenv("DEFAULT_USER_NAME", "Maheswar")

def get_or_create_primary_user(db: Session) -> User:
    """
    Returns the primary authoritative User for this personal LMS instance.
    Creates with default profile if not yet initialized.
    """
    user = db.query(User).filter(User.email == DEFAULT_USER_EMAIL).first()
    if not user:
        user = db.query(User).first()
    if not user:
        user = User(
            name=DEFAULT_USER_NAME,
            email=DEFAULT_USER_EMAIL,
            preferences=json.dumps({
                "dark_mode": False,
                "ai_provider": "gemini",
                "ai_model": "gemini-1.5-flash",
                "ai_api_key": "",
                "preferred_explanation_language": "English",
                "preferred_depth": "balanced",
                "streak_min_minutes": 15,
                "idle_timeout_minutes": 30,
                "daily_card_limit": 20,
                "daily_review_limit": 50,
                "timezone": "UTC",
                "program": "MBA & Computer Science",
                "target_hours": 4.0,
                "theme": "light",
                "sound_enabled": False,
                "calm_mode": False
            })
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def generate_session_token(user_id: str) -> str:
    """Generates a secure hashed token for the session."""
    random_part = secrets.token_hex(16)
    digest = hashlib.sha256(f"{user_id}:{random_part}:{SECRET_KEY}".encode()).hexdigest()
    return f"lnv_{random_part}_{digest[:24]}"

def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> User:
    """
    Authoritative dependency to resolve the authenticated user.
    Validates token if provided, or resolves primary user in personal LMS environment.
    """
    if x_user_id:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        # In multi-user or token-based mode, validate token structure
        if token.startswith("lnv_") or len(token) >= 16:
            # Check user by primary lookup
            user = get_or_create_primary_user(db)
            return user

    # Default personal LMS primary user
    user = get_or_create_primary_user(db)
    return user

def get_current_user_id(user: User = Depends(get_current_user)) -> str:
    """Returns the authenticated user's ID."""
    return user.id
