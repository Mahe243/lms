import json
from datetime import datetime, date, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import (
    GameWallet, GameTransaction, KingdomBuilding, DailyMission,
    GameAchievement, CosmeticUnlock, ProjectRecord, Topic, Course,
    FlashcardReview, Flashcard, QuizAttempt, StudySession, AIMessage, ActivityEvent
)

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

# -------------------------------------------------------------
# LEVEL FORMULA: Total XP for Level N = 100 * N * (N - 1) / 2
# -------------------------------------------------------------
def get_xp_for_level(level: int) -> int:
    if level <= 1:
        return 0
    return int(100 * level * (level - 1) // 2)

def calculate_level_info(total_xp: int) -> Dict[str, Any]:
    """
    Computes current level, XP thresholds, and progress percentage deterministically.
    """
    if total_xp < 0:
        total_xp = 0

    level = 1
    while True:
        next_xp = get_xp_for_level(level + 1)
        if total_xp < next_xp:
            break
        level += 1

    current_base = get_xp_for_level(level)
    next_base = get_xp_for_level(level + 1)
    xp_in_level = total_xp - current_base
    needed_for_next = next_base - current_base

    pct = round((xp_in_level / needed_for_next) * 100.0, 1) if needed_for_next > 0 else 100.0

    return {
        "level": level,
        "total_xp": total_xp,
        "current_level_base_xp": current_base,
        "next_level_xp": next_base,
        "xp_in_current_level": xp_in_level,
        "xp_needed_for_next": needed_for_next,
        "progress_percentage": min(100.0, max(0.0, pct))
    }

# -------------------------------------------------------------
# WALLET MANAGEMENT & ATOMIC TRANSACTIONS
# -------------------------------------------------------------
def get_or_create_wallet(db: Session, owner_id: str = "learner") -> GameWallet:
    wallet = db.query(GameWallet).filter(GameWallet.owner_id == owner_id).first()
    if not wallet:
        wallet = GameWallet(
            owner_id=owner_id,
            coin_balance=0,
            total_xp=0,
            created_at=utc_now(),
            updated_at=utc_now()
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def count_today_actions(db: Session, wallet_id: str, source_type: str, today_str: str) -> int:
    """
    Counts how many times a source_type rewarded coins/XP on today's local date.
    """
    today_start = datetime.strptime(today_str, "%Y-%m-%d")
    today_end = datetime(today_start.year, today_start.month, today_start.day, 23, 59, 59)
    return db.query(func.count(GameTransaction.id)).filter(
        GameTransaction.wallet_id == wallet_id,
        GameTransaction.source_type == source_type,
        GameTransaction.transaction_type == "award_bundle",
        GameTransaction.created_at >= today_start,
        GameTransaction.created_at <= today_end
    ).scalar() or 0

def award_rewards(
    db: Session,
    source_type: str,
    source_id: str,
    reason: str,
    xp_amount: int,
    coin_amount: int,
    daily_cap: Optional[int] = None,
    owner_id: str = "learner",
    today_date_str: Optional[str] = None
) -> Dict[str, Any]:
    """
    Awards XP and coins to the wallet with strict idempotency and daily cap enforcement.
    """
    wallet = get_or_create_wallet(db, owner_id)
    today_str = today_date_str or utc_now().strftime("%Y-%m-%d")

    # 1. Idempotency Key check: prevent duplicate reward for the exact same learning action
    idempotency_key = f"{source_type}_{source_id}"
    existing = db.query(GameTransaction).filter(
        GameTransaction.idempotency_key == idempotency_key
    ).first()
    if existing:
        return {
            "success": False,
            "reason": "already_awarded",
            "wallet": wallet,
            "awarded_xp": 0,
            "awarded_coins": 0
        }

    # 2. Daily action cap check
    if daily_cap is not None:
        today_count = count_today_actions(db, wallet.id, source_type, today_str)
        if today_count >= daily_cap:
            return {
                "success": False,
                "reason": "daily_cap_reached",
                "wallet": wallet,
                "awarded_xp": 0,
                "awarded_coins": 0
            }

    # 3. Apply rewards atomically
    wallet.total_xp += xp_amount
    wallet.coin_balance += coin_amount
    wallet.updated_at = utc_now()

    # Record transactions
    if xp_amount > 0:
        tx_xp = GameTransaction(
            wallet_id=wallet.id,
            transaction_type="earn_xp",
            amount=xp_amount,
            currency="xp",
            reason=reason,
            source_type=source_type,
            source_id=source_id,
            idempotency_key=f"{idempotency_key}_xp",
            created_at=utc_now()
        )
        db.add(tx_xp)

    if coin_amount > 0:
        tx_coin = GameTransaction(
            wallet_id=wallet.id,
            transaction_type="earn_coins",
            amount=coin_amount,
            currency="coins",
            reason=reason,
            source_type=source_type,
            source_id=source_id,
            idempotency_key=f"{idempotency_key}_coin",
            created_at=utc_now()
        )
        db.add(tx_coin)

    # Master idempotency record
    master_tx = GameTransaction(
        wallet_id=wallet.id,
        transaction_type="award_bundle",
        amount=coin_amount,
        currency="bundle",
        reason=reason,
        source_type=source_type,
        source_id=source_id,
        idempotency_key=idempotency_key,
        created_at=utc_now()
    )
    db.add(master_tx)

    # 4. Check & advance daily missions
    advance_daily_missions(db, source_type, 1, today_str, owner_id)

    # 5. Check achievement triggers
    check_achievements(db, owner_id)

    db.commit()
    db.refresh(wallet)

    return {
        "success": True,
        "awarded_xp": xp_amount,
        "awarded_coins": coin_amount,
        "wallet": wallet
    }

def spend_coins(
    db: Session,
    amount: int,
    reason: str,
    source_type: str,
    source_id: str,
    owner_id: str = "learner"
) -> Tuple[bool, str, GameWallet]:
    """
    Safely deducts coins with strict negative balance protection and atomic database transaction.
    """
    wallet = get_or_create_wallet(db, owner_id)
    if amount <= 0:
        return False, "Invalid coin amount", wallet

    if wallet.coin_balance < amount:
        return False, "Insufficient coins", wallet

    idempotency_key = f"spend_{source_type}_{source_id}_{utc_now().timestamp()}"

    wallet.coin_balance -= amount
    wallet.updated_at = utc_now()

    tx = GameTransaction(
        wallet_id=wallet.id,
        transaction_type="spend_coins",
        amount=-amount,
        currency="coins",
        reason=reason,
        source_type=source_type,
        source_id=source_id,
        idempotency_key=idempotency_key,
        created_at=utc_now()
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)
    return True, "Success", wallet

# -------------------------------------------------------------
# SPECIFIC EDUCATIONAL REWARD TRIGGERS
# -------------------------------------------------------------
def process_lesson_completed(db: Session, topic_id: str, owner_id: str = "learner") -> Dict[str, Any]:
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        return {"success": False, "reason": "topic_not_found"}

    # Verify topic exists and award idempotently
    course = db.query(Course).filter(Course.id == topic.course_id).first()

    return award_rewards(
        db=db,
        source_type="lesson",
        source_id=topic_id,
        reason=f"Mastered lesson: {topic.title}",
        xp_amount=50,
        coin_amount=25,
        daily_cap=5,
        owner_id=owner_id
    )

def process_flashcard_review(db: Session, card_id: str, rating: str, owner_id: str = "learner") -> Dict[str, Any]:
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        return {"success": False, "reason": "demo_or_not_found"}

    # Daily cap 50 reviews, award higher for good/easy (3, 4) than hard/again (1, 2)
    is_mastered = rating in ["good", "easy", 3, 4, "3", "4"]
    xp = 5 if is_mastered else 2
    coins = 2 if is_mastered else 1
    review_stamp = f"{card_id}_{utc_now().strftime('%Y-%m-%d_%H')}"

    return award_rewards(
        db=db,
        source_type="flashcard",
        source_id=review_stamp,
        reason=f"Flashcard recall review ({rating})",
        xp_amount=xp,
        coin_amount=coins,
        daily_cap=50,
        owner_id=owner_id
    )

def process_quiz_completion(db: Session, attempt_id: str, owner_id: str = "learner") -> Dict[str, Any]:
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        return {"success": False, "reason": "demo_or_not_found"}

    # Must score at least 60% to qualify for rewards
    if attempt.percentage < 60.0:
        return {"success": False, "reason": "score_below_threshold"}

    xp = 40 if attempt.percentage >= 70.0 else 20
    coins = 20 if attempt.percentage >= 70.0 else 10

    return award_rewards(
        db=db,
        source_type="quiz",
        source_id=attempt_id,
        reason=f"Completed {attempt.quiz_title} ({int(attempt.percentage)}%)",
        xp_amount=xp,
        coin_amount=coins,
        daily_cap=4,
        owner_id=owner_id
    )

def process_study_session_completion(db: Session, session_id: str, owner_id: str = "learner") -> Dict[str, Any]:
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        return {"success": False, "reason": "demo_or_not_found"}

    # Only reward sessions with at least 15 minutes of validated active duration
    duration_mins = (session.actual_duration_secs or 0) // 60
    if duration_mins < 15:
        return {"success": False, "reason": "duration_too_short"}

    capped_mins = min(duration_mins, 90)
    xp = int(capped_mins * 1.5)
    coins = capped_mins

    return award_rewards(
        db=db,
        source_type="study_session",
        source_id=session_id,
        reason=f"Deep work session completed ({duration_mins}m)",
        xp_amount=xp,
        coin_amount=coins,
        daily_cap=4,
        owner_id=owner_id
    )

def process_project_milestone(db: Session, project_key: str, milestone_key: str, title: str, summary: str, owner_id: str = "learner") -> Dict[str, Any]:
    # Record milestone
    existing_rec = db.query(ProjectRecord).filter(
        ProjectRecord.owner_id == owner_id,
        ProjectRecord.project_key == project_key,
        ProjectRecord.milestone_key == milestone_key
    ).first()

    if not existing_rec:
        rec = ProjectRecord(
            owner_id=owner_id,
            project_key=project_key,
            milestone_key=milestone_key,
            title=title,
            completed=True,
            result_summary=summary,
            completed_at=utc_now()
        )
        db.add(rec)
        db.commit()

    return award_rewards(
        db=db,
        source_type="project",
        source_id=f"{project_key}_{milestone_key}",
        reason=f"Completed capstone milestone: {title}",
        xp_amount=60,
        coin_amount=30,
        daily_cap=2,
        owner_id=owner_id
    )

# -------------------------------------------------------------
# DETERMINISTIC DAILY MISSIONS
# -------------------------------------------------------------
def get_or_generate_daily_missions(db: Session, today_date_str: str, owner_id: str = "learner") -> List[DailyMission]:
    missions = db.query(DailyMission).filter(
        DailyMission.owner_id == owner_id,
        DailyMission.mission_date == today_date_str
    ).all()

    if missions:
        return missions

    # Generate 3 deterministic missions based on real available learning material
    has_topics = db.query(Topic).filter(Topic.status != "completed").count() > 0
    has_cards = db.query(Flashcard).count() > 0
    from backend.models import Question, QuestionBank
    has_quizzes = db.query(Question).count() > 0 or db.query(QuestionBank).count() > 0

    generated = []

    # Mission 1: Lesson mastery
    if has_topics:
        m1 = DailyMission(
            owner_id=owner_id,
            mission_date=today_date_str,
            mission_type="lesson",
            title="Complete 1 Lesson",
            description="Study and complete any active curriculum lesson in the Academy.",
            target_value=1,
            current_value=0,
            reward_coins=15,
            reward_xp=30
        )
        generated.append(m1)

    # Mission 2: Flashcard revision or focus
    if has_cards:
        m2 = DailyMission(
            owner_id=owner_id,
            mission_date=today_date_str,
            mission_type="flashcard",
            title="Review 10 Flashcards",
            description="Exercise spaced retrieval in the Archive Tower.",
            target_value=10,
            current_value=0,
            reward_coins=15,
            reward_xp=30
        )
        generated.append(m2)
    else:
        m2 = DailyMission(
            owner_id=owner_id,
            mission_date=today_date_str,
            mission_type="focus",
            title="Log a 25-Minute Focus Session",
            description="Complete a Pomodoro deep work block in the Focus Sanctuary.",
            target_value=1,
            current_value=0,
            reward_coins=15,
            reward_xp=30
        )
        generated.append(m2)

    # Mission 3: Challenge Arena Quiz or Revision
    m3 = DailyMission(
        owner_id=owner_id,
        mission_date=today_date_str,
        mission_type="quiz",
        title="Pass a Practice Arena Challenge",
        description="Score at least 70% on a timed quiz or Kingdom Trials session.",
        target_value=1,
        current_value=0,
        reward_coins=20,
        reward_xp=40
    )
    generated.append(m3)

    db.add_all(generated)
    db.commit()
    return generated

def advance_daily_missions(db: Session, action_type: str, increment: int, today_str: str, owner_id: str = "learner") -> None:
    missions = db.query(DailyMission).filter(
        DailyMission.owner_id == owner_id,
        DailyMission.mission_date == today_str,
        DailyMission.mission_type == action_type,
        DailyMission.is_completed == False
    ).all()

    for m in missions:
        m.current_value += increment
        if m.current_value >= m.target_value:
            m.current_value = m.target_value
            m.is_completed = True
            m.completed_at = utc_now()

def claim_mission_reward(db: Session, mission_id: str, owner_id: str = "learner") -> Tuple[bool, str, Optional[DailyMission]]:
    mission = db.query(DailyMission).filter(
        DailyMission.id == mission_id,
        DailyMission.owner_id == owner_id
    ).first()

    if not mission:
        return False, "Mission not found", None

    if not mission.is_completed:
        return False, "Mission is not completed yet", mission

    if mission.is_claimed:
        return False, "Reward already claimed", mission

    mission.is_claimed = True
    mission.claimed_at = utc_now()

    # Award mission reward to wallet
    wallet = get_or_create_wallet(db, owner_id)
    wallet.total_xp += mission.reward_xp
    wallet.coin_balance += mission.reward_coins

    tx = GameTransaction(
        wallet_id=wallet.id,
        transaction_type="claim_mission",
        amount=mission.reward_coins,
        currency="coins",
        reason=f"Claimed mission: {mission.title}",
        source_type="mission",
        source_id=mission.id,
        idempotency_key=f"mission_{mission.id}",
        created_at=utc_now()
    )
    db.add(tx)
    db.commit()
    db.refresh(mission)
    return True, "Reward claimed successfully", mission

# -------------------------------------------------------------
# BUILDING PROGRESSION DERIVATION FROM REAL LEARNING RECORDS
# -------------------------------------------------------------
def get_real_kingdom_stats(db: Session, owner_id: str = "learner") -> Dict[str, Any]:
    wallet = get_or_create_wallet(db, owner_id)
    level_info = calculate_level_info(wallet.total_xp)

    # Real educational metrics
    completed_lessons = db.query(Topic).filter(Topic.status == "completed").count()
    reviewed_cards = db.query(FlashcardReview).count()
    completed_quizzes = db.query(QuizAttempt).filter(QuizAttempt.percentage >= 60.0).count()

    # Focus sessions (sum of completed session minutes)
    focus_seconds = db.query(func.sum(StudySession.actual_duration_secs)).filter(
        StudySession.status == "completed"
    ).scalar() or 0
    focus_minutes = round(focus_seconds / 60.0, 1)

    # Projects
    completed_projects = db.query(ProjectRecord).filter(ProjectRecord.owner_id == owner_id).count()

    # AI Conversations
    ai_interactions = db.query(AIMessage).filter(AIMessage.role == "user").count()

    # Achievements
    earned_achievements = db.query(GameAchievement).filter(GameAchievement.owner_id == owner_id).count()

    # Calculate building visual tiers & levels
    # Citadel: level determined by wallet.total_xp
    citadel_tier = 1 if level_info["level"] < 5 else (2 if level_info["level"] < 10 else (3 if level_info["level"] < 20 else 4))
    from backend.services.activity_service import calculate_study_streak
    streak_info = calculate_study_streak(db)
    streak_days = max(streak_info.get("streak_days", 0), 1 if (focus_minutes > 0 or completed_lessons > 0) else 0)
    total_active_days = max(streak_info.get("total_active_days", 0), 1 if (focus_minutes > 0 or completed_lessons > 0) else 0)


    return {
        "wallet": {
            "id": wallet.id,
            "coin_balance": wallet.coin_balance,
            "total_xp": wallet.total_xp,
            "level": level_info["level"],
            "next_level_xp": level_info["next_level_xp"],
            "current_level_xp": level_info["xp_in_current_level"],
            "streak_days": streak_days,
            "total_active_days": total_active_days
        },
        "stats": {
            "citadel_level": level_info["level"],
            "citadel_tier": citadel_tier,
            "total_xp": wallet.total_xp,
            "completed_lessons": completed_lessons,
            "reviewed_cards": reviewed_cards,
            "completed_quizzes": completed_quizzes,
            "focus_minutes": focus_minutes,
            "completed_projects": completed_projects,
            "ai_interactions": ai_interactions,
            "earned_achievements": earned_achievements
        }
    }

# -------------------------------------------------------------
# ACHIEVEMENTS SYSTEM
# -------------------------------------------------------------
ACHIEVEMENT_DEFINITIONS = [
    {
        "type": "first_lesson",
        "title": "First Step into the Academy",
        "description": "Complete your first lesson in the curriculum.",
        "badge_icon": "school",
        "reward_coins": 30,
        "reward_xp": 50,
        "check": lambda stats: stats["completed_lessons"] >= 1
    },
    {
        "type": "five_lessons",
        "title": "Scholar of the Citadel",
        "description": "Master 5 educational lessons.",
        "badge_icon": "auto_stories",
        "reward_coins": 50,
        "reward_xp": 100,
        "check": lambda stats: stats["completed_lessons"] >= 5
    },
    {
        "type": "first_focus",
        "title": "Sanctuary of Stillness",
        "description": "Complete your first deep work focus block.",
        "badge_icon": "self_improvement",
        "reward_coins": 25,
        "reward_xp": 50,
        "check": lambda stats: stats["focus_minutes"] >= 15
    },
    {
        "type": "focus_master",
        "title": "Architect of Deep Work",
        "description": "Log over 120 minutes of verified focused study.",
        "badge_icon": "timer",
        "reward_coins": 60,
        "reward_xp": 120,
        "check": lambda stats: stats["focus_minutes"] >= 120
    },
    {
        "type": "archive_initiate",
        "title": "Memory Vault Keeper",
        "description": "Review 20 flashcards using spaced repetition.",
        "badge_icon": "local_library",
        "reward_coins": 30,
        "reward_xp": 60,
        "check": lambda stats: stats["reviewed_cards"] >= 20
    },
    {
        "type": "arena_victor",
        "title": "Arena Champion",
        "description": "Score 70% or higher on 2 practice challenges.",
        "badge_icon": "military_tech",
        "reward_coins": 40,
        "reward_xp": 80,
        "check": lambda stats: stats["completed_quizzes"] >= 2
    },
    {
        "type": "capstone_forged",
        "title": "Innovation Pioneer",
        "description": "Complete and persist a project capstone milestone.",
        "badge_icon": "construction",
        "reward_coins": 50,
        "reward_xp": 100,
        "check": lambda stats: stats["completed_projects"] >= 1
    }
]

def check_achievements(db: Session, owner_id: str = "learner") -> List[GameAchievement]:
    kingdom_info = get_real_kingdom_stats(db, owner_id)
    stats = kingdom_info["stats"]

    unlocked_list = []
    for ach in ACHIEVEMENT_DEFINITIONS:
        # Check if already unlocked
        exists = db.query(GameAchievement).filter(
            GameAchievement.owner_id == owner_id,
            GameAchievement.achievement_type == ach["type"]
        ).first()

        if not exists and ach["check"](stats):
            new_ach = GameAchievement(
                owner_id=owner_id,
                achievement_type=ach["type"],
                title=ach["title"],
                description=ach["description"],
                badge_icon=ach["badge_icon"],
                reward_coins=ach["reward_coins"],
                reward_xp=ach["reward_xp"],
                unlocked_at=utc_now()
            )
            db.add(new_ach)

            # Award achievement rewards to wallet
            wallet = get_or_create_wallet(db, owner_id)
            wallet.total_xp += ach["reward_xp"]
            wallet.coin_balance += ach["reward_coins"]

            tx = GameTransaction(
                wallet_id=wallet.id,
                transaction_type="unlock_achievement",
                amount=ach["reward_coins"],
                currency="coins",
                reason=f"Achievement unlocked: {ach['title']}",
                source_type="achievement",
                source_id=ach["type"],
                idempotency_key=f"ach_{ach['type']}",
                created_at=utc_now()
            )
            db.add(tx)
            unlocked_list.append(new_ach)

    if unlocked_list:
        db.commit()

    return db.query(GameAchievement).filter(GameAchievement.owner_id == owner_id).all()

# -------------------------------------------------------------
# THE KINGDOM MARKET (COSMETICS ONLY)
# -------------------------------------------------------------
COSMETIC_CATALOGUE = [
    {
        "item_id": "skin_citadel_royal_amethyst",
        "name": "Royal Amethyst Citadel",
        "description": "A luminescent violet and indigo gemstone spire skin for your Knowledge Citadel.",
        "item_type": "citadel_skin",
        "price_coins": 100,
        "preview_accent": "#7869DE"
    },
    {
        "item_id": "skin_citadel_celestial_cyan",
        "name": "Celestial Cyan Outpost",
        "description": "Crystalline teal and cyan energy arches with glowing perimeter beacons.",
        "item_type": "citadel_skin",
        "price_coins": 120,
        "preview_accent": "#54CFE0"
    },
    {
        "item_id": "skin_academy_emerald_atrium",
        "name": "Emerald Atrium Academy",
        "description": "Lush hanging gardens and ivy-covered botanical reading spires.",
        "item_type": "academy_skin",
        "price_coins": 80,
        "preview_accent": "#58B995"
    },
    {
        "item_id": "path_crystal_runes",
        "name": "Glow-Rune Paved Walkways",
        "description": "Cobblestones inscribed with ancient glowing geometric knowledge runes.",
        "item_type": "path_style",
        "price_coins": 60,
        "preview_accent": "#FAD387"
    },
    {
        "item_id": "decor_celestial_fountain",
        "name": "Fountain of Continuous Inquiry",
        "description": "A levitating marble basin with shimmering water currents in the central courtyard.",
        "item_type": "water_feature",
        "price_coins": 75,
        "preview_accent": "#85E4F2"
    },
    {
        "item_id": "nova_golden_halo",
        "name": "Golden Scholar Halo for Nova",
        "description": "A shimmering ring of radiant starlight orbiting your knowledge companion.",
        "item_type": "nova_accessory",
        "price_coins": 50,
        "preview_accent": "#F2BD58"
    }
]

def list_market_items(db: Session, owner_id: str = "learner") -> List[Dict[str, Any]]:
    unlocked_map = {
        u.item_id: u for u in db.query(CosmeticUnlock).filter(CosmeticUnlock.owner_id == owner_id).all()
    }

    result = []
    for item in COSMETIC_CATALOGUE:
        is_unlocked = item["item_id"] in unlocked_map
        is_equipped = unlocked_map[item["item_id"]].is_equipped if is_unlocked else False
        result.append({
            "item_id": item["item_id"],
            "name": item["name"],
            "description": item["description"],
            "item_type": item["item_type"],
            "price_coins": item["price_coins"],
            "is_unlocked": is_unlocked,
            "is_equipped": is_equipped,
            "preview_accent": item["preview_accent"]
        })
    return result

def purchase_cosmetic(db: Session, item_id: str, owner_id: str = "learner") -> Tuple[bool, str, GameWallet]:
    # 1. Validate item in catalogue
    item = next((i for i in COSMETIC_CATALOGUE if i["item_id"] == item_id), None)
    if not item:
        return False, "Item not found in catalogue", get_or_create_wallet(db, owner_id)

    # 2. Check if already unlocked
    existing = db.query(CosmeticUnlock).filter(
        CosmeticUnlock.owner_id == owner_id,
        CosmeticUnlock.item_id == item_id
    ).first()
    if existing:
        return False, "Item already unlocked", get_or_create_wallet(db, owner_id)

    # 3. Spend coins atomically
    success, msg, wallet = spend_coins(
        db=db,
        amount=item["price_coins"],
        reason=f"Purchased cosmetic: {item['name']}",
        source_type="shop",
        source_id=item_id,
        owner_id=owner_id
    )
    if not success:
        return False, msg, wallet

    # 4. Create cosmetic unlock
    unlock = CosmeticUnlock(
        owner_id=owner_id,
        item_id=item_id,
        item_type=item["item_type"],
        is_equipped=True,
        unlocked_at=utc_now()
    )
    db.add(unlock)
    db.commit()
    return True, "Cosmetic unlocked and equipped", wallet

def equip_cosmetic(db: Session, item_id: str, owner_id: str = "learner") -> Tuple[bool, str]:
    unlock = db.query(CosmeticUnlock).filter(
        CosmeticUnlock.owner_id == owner_id,
        CosmeticUnlock.item_id == item_id
    ).first()
    if not unlock:
        return False, "Cosmetic not owned"

    # Unequip others of the same type
    db.query(CosmeticUnlock).filter(
        CosmeticUnlock.owner_id == owner_id,
        CosmeticUnlock.item_type == unlock.item_type
    ).update({"is_equipped": False})

    unlock.is_equipped = True
    db.commit()
    return True, "Item equipped"

# -------------------------------------------------------------
# SAFE GAME PROGRESS RESET
# -------------------------------------------------------------
def reset_game_progress(db: Session, owner_id: str = "learner") -> Dict[str, Any]:
    """
    Resets the gaming layer ONLY:
    - Wallet balance to 0 coins, 0 XP
    - Clears game transactions
    - Clears daily missions
    - Clears cosmetic unlocks
    - Clears game achievements
    - Clears persisted project milestone game records
    NEVER deletes courses, topics, notes, flashcards, study sessions, quiz attempts, goals or uploaded documents!
    """
    wallet = get_or_create_wallet(db, owner_id)
    wallet.coin_balance = 0
    wallet.total_xp = 0
    wallet.updated_at = utc_now()

    db.query(GameTransaction).filter(GameTransaction.wallet_id == wallet.id).delete()
    db.query(DailyMission).filter(DailyMission.owner_id == owner_id).delete()
    db.query(CosmeticUnlock).filter(CosmeticUnlock.owner_id == owner_id).delete()
    db.query(GameAchievement).filter(GameAchievement.owner_id == owner_id).delete()
    db.query(KingdomBuilding).filter(KingdomBuilding.owner_id == owner_id).delete()
    db.query(ProjectRecord).filter(ProjectRecord.owner_id == owner_id).delete()

    db.commit()
    db.refresh(wallet)

    return {
        "success": True,
        "message": "Game progress reset successfully. All academic materials, study notes, and flashcard history were preserved.",
        "wallet": wallet
    }
