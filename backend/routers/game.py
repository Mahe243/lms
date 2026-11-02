from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import (
    GameWalletOut, KingdomBuildingOut, DailyMissionOut,
    GameAchievementOut, CosmeticItemOut, PurchaseRequest,
    EquipRequest, GameProfileOut
)
from backend.services.earning_rules import (
    get_or_create_wallet, calculate_level_info, get_real_kingdom_stats,
    get_or_generate_daily_missions, claim_mission_reward,
    check_achievements, list_market_items, purchase_cosmetic,
    equip_cosmetic, reset_game_progress, process_project_milestone, utc_now
)
from backend.models import CosmeticUnlock, GameAchievement, ProjectRecord

router = APIRouter(prefix="/api/game", tags=["Evergrowth Kingdom & Game Economy"])

@router.get("/wallet", response_model=GameWalletOut)
def get_wallet(owner_id: str = "learner", db: Session = Depends(get_db)):
    wallet = get_or_create_wallet(db, owner_id)
    lvl_info = calculate_level_info(wallet.total_xp)
    return {
        "id": wallet.id,
        "coin_balance": wallet.coin_balance,
        "total_xp": wallet.total_xp,
        "level": lvl_info["level"],
        "next_level_xp": lvl_info["next_level_xp"],
        "current_level_xp": lvl_info["xp_in_current_level"],
        "streak_days": 1 if wallet.total_xp > 0 else 0,
        "total_active_days": 1 if wallet.total_xp > 0 else 0
    }

@router.get("/kingdom")
def get_kingdom(owner_id: str = "learner", db: Session = Depends(get_db)):
    data = get_real_kingdom_stats(db, owner_id)
    return data

@router.get("/missions/today", response_model=List[DailyMissionOut])
def get_today_missions(
    today: Optional[str] = None,
    owner_id: str = "learner",
    db: Session = Depends(get_db)
):
    today_str = today or utc_now().strftime("%Y-%m-%d")
    missions = get_or_generate_daily_missions(db, today_str, owner_id)
    return missions

@router.post("/missions/{mission_id}/claim")
def claim_mission(
    mission_id: str,
    owner_id: str = "learner",
    db: Session = Depends(get_db)
):
    success, msg, mission = claim_mission_reward(db, mission_id, owner_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    wallet = get_or_create_wallet(db, owner_id)
    lvl = calculate_level_info(wallet.total_xp)
    return {
        "message": msg,
        "mission_id": mission_id,
        "awarded_coins": mission.reward_coins if mission else 0,
        "awarded_xp": mission.reward_xp if mission else 0,
        "wallet": {
            "coin_balance": wallet.coin_balance,
            "total_xp": wallet.total_xp,
            "level": lvl["level"]
        }
    }

@router.get("/achievements", response_model=List[GameAchievementOut])
def get_achievements(owner_id: str = "learner", db: Session = Depends(get_db)):
    achievements = check_achievements(db, owner_id)
    return achievements

@router.get("/shop", response_model=List[CosmeticItemOut])
def get_shop_items(owner_id: str = "learner", db: Session = Depends(get_db)):
    items = list_market_items(db, owner_id)
    return items

@router.get("/unlocks")
def get_unlocks(owner_id: str = "learner", db: Session = Depends(get_db)):
    unlocks = db.query(CosmeticUnlock).filter(CosmeticUnlock.owner_id == owner_id).all()
    return [
        {
            "id": u.id,
            "item_id": u.item_id,
            "item_type": u.item_type,
            "is_equipped": u.is_equipped,
            "unlocked_at": u.unlocked_at
        } for u in unlocks
    ]

@router.post("/shop/purchase")
def buy_cosmetic(
    data: PurchaseRequest,
    owner_id: str = "learner",
    db: Session = Depends(get_db)
):
    success, msg, wallet = purchase_cosmetic(db, data.item_id, owner_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "message": msg,
        "item_id": data.item_id,
        "wallet": {
            "coin_balance": wallet.coin_balance,
            "total_xp": wallet.total_xp
        }
    }

@router.post("/equip")
def equip_item(
    data: EquipRequest,
    owner_id: str = "learner",
    db: Session = Depends(get_db)
):
    success, msg = equip_cosmetic(db, data.item_id, owner_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg, "item_id": data.item_id}

@router.post("/reset")
def reset_progress(owner_id: str = "learner", db: Session = Depends(get_db)):
    result = reset_game_progress(db, owner_id)
    return result

@router.get("/profile")
def get_game_profile(owner_id: str = "learner", db: Session = Depends(get_db)):
    kingdom = get_real_kingdom_stats(db, owner_id)
    today_str = utc_now().strftime("%Y-%m-%d")
    missions = get_or_generate_daily_missions(db, today_str, owner_id)
    achievements = check_achievements(db, owner_id)
    equipped = [
        u.item_id for u in db.query(CosmeticUnlock).filter(
            CosmeticUnlock.owner_id == owner_id,
            CosmeticUnlock.is_equipped == True
        ).all()
    ]

    return {
        "wallet": kingdom["wallet"],
        "stats": kingdom["stats"],
        "missions": missions,
        "achievements": achievements,
        "equipped_cosmetics": equipped
    }

class ProjectMilestoneSubmit(BaseModel):
    project_key: str
    milestone_key: str
    title: str
    summary: Optional[str] = ""

@router.post("/projects/milestone")
def record_project_milestone(data: ProjectMilestoneSubmit, owner_id: str = "learner", db: Session = Depends(get_db)):
    result = process_project_milestone(db, data.project_key, data.milestone_key, data.title, data.summary or "", owner_id)
    return result

@router.get("/projects")
def get_project_milestones(owner_id: str = "learner", db: Session = Depends(get_db)):
    records = db.query(ProjectRecord).filter(ProjectRecord.owner_id == owner_id).all()
    return [
        {
            "id": r.id,
            "project_key": r.project_key,
            "milestone_key": r.milestone_key,
            "title": r.title,
            "completed": r.completed,
            "result_summary": r.result_summary,
            "completed_at": r.completed_at
        } for r in records
    ]
