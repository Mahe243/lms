import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserOut, UserUpdate
from backend.security import get_current_user, generate_session_token

router = APIRouter(prefix="/api/user", tags=["User & Settings"])

@router.get("/me", response_model=UserOut)
def get_user_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "preferences": json.loads(user.preferences) if user.preferences else {},
        "created_at": user.created_at
    }

@router.put("/me", response_model=UserOut)
def update_user_preferences(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name is not None:
        user.name = data.name.strip()
    if data.email is not None:
        user.email = data.email.strip()
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    if data.preferences is not None:
        curr = json.loads(user.preferences) if user.preferences else {}
        curr.update(data.preferences)
        user.preferences = json.dumps(curr)

    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "preferences": json.loads(user.preferences) if user.preferences else {},
        "created_at": user.created_at
    }

@router.post("/token")
def issue_user_session_token(user: User = Depends(get_current_user)):
    """Issues a session bearer token for client-side API requests."""
    token = generate_session_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name
    }
