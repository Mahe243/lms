import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models import (
    GameWallet, GameTransaction, DailyMission, GameAchievement,
    CosmeticUnlock, Course, Module, Topic, Flashcard, QuizAttempt,
    StudySession, Note
)
from backend.services.earning_rules import (
    get_or_create_wallet, calculate_level_info, get_xp_for_level,
    award_rewards, spend_coins, process_lesson_completed,
    process_flashcard_review, process_quiz_completion,
    process_study_session_completion, get_or_generate_daily_missions,
    claim_mission_reward, check_achievements, purchase_cosmetic,
    equip_cosmetic, reset_game_progress, get_real_kingdom_stats
)

@pytest.fixture
def db_session():
    # In-memory SQLite for test isolation
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()

def test_wallet_creation_defaults(db_session):
    wallet = get_or_create_wallet(db_session, owner_id="test_user")
    assert wallet.coin_balance == 0
    assert wallet.total_xp == 0
    assert wallet.owner_id == "test_user"

def test_deterministic_level_formula():
    assert get_xp_for_level(1) == 0
    assert get_xp_for_level(2) == 100
    assert get_xp_for_level(3) == 300
    assert get_xp_for_level(4) == 600
    assert get_xp_for_level(5) == 1000
    assert get_xp_for_level(6) == 1500

    info_0 = calculate_level_info(0)
    assert info_0["level"] == 1
    assert info_0["xp_needed_for_next"] == 100

    info_150 = calculate_level_info(150)
    assert info_150["level"] == 2
    assert info_150["current_level_base_xp"] == 100
    assert info_150["next_level_xp"] == 300
    assert info_150["xp_in_current_level"] == 50
    assert info_150["progress_percentage"] == 25.0

def test_award_rewards_and_idempotency(db_session):
    res1 = award_rewards(
        db=db_session,
        source_type="lesson",
        source_id="topic_123",
        reason="Completed lesson",
        xp_amount=50,
        coin_amount=25,
        owner_id="test_user"
    )
    assert res1["success"] is True
    assert res1["awarded_xp"] == 50
    assert res1["awarded_coins"] == 25

    wallet = get_or_create_wallet(db_session, "test_user")
    assert wallet.total_xp == 50
    assert wallet.coin_balance == 25

    # Duplicate submission for exact same learning action must be rejected idempotently
    res2 = award_rewards(
        db=db_session,
        source_type="lesson",
        source_id="topic_123",
        reason="Completed lesson again",
        xp_amount=50,
        coin_amount=25,
        owner_id="test_user"
    )
    assert res2["success"] is False
    assert res2["reason"] == "already_awarded"
    assert wallet.total_xp == 50
    assert wallet.coin_balance == 25

def test_daily_caps_enforcement(db_session):
    # Cap of 3 actions per day
    for i in range(3):
        res = award_rewards(
            db=db_session,
            source_type="quiz",
            source_id=f"attempt_{i}",
            reason="Quiz attempt",
            xp_amount=40,
            coin_amount=20,
            daily_cap=3,
            owner_id="cap_user",
            today_date_str="2026-11-02"
        )
        assert res["success"] is True

    # 4th action exceeds daily cap
    res_overflow = award_rewards(
        db=db_session,
        source_type="quiz",
        source_id="attempt_99",
        reason="Quiz attempt overflow",
        xp_amount=40,
        coin_amount=20,
        daily_cap=3,
        owner_id="cap_user",
        today_date_str="2026-11-02"
    )
    assert res_overflow["success"] is False
    assert res_overflow["reason"] == "daily_cap_reached"

def test_spend_coins_protection(db_session):
    wallet = get_or_create_wallet(db_session, "spend_user")
    wallet.coin_balance = 50
    db_session.commit()

    # Attempt to spend more than available
    success, msg, _ = spend_coins(db_session, 100, "Too expensive", "shop", "item_1", "spend_user")
    assert success is False
    assert "Insufficient coins" in msg
    assert wallet.coin_balance == 50

    # Successful spend
    success2, msg2, w2 = spend_coins(db_session, 30, "Affordable skin", "shop", "item_2", "spend_user")
    assert success2 is True
    assert w2.coin_balance == 20

def test_daily_mission_generation_and_claiming(db_session):
    missions = get_or_generate_daily_missions(db_session, "2026-11-02", "mission_user")
    assert len(missions) >= 2

    m = missions[0]
    assert m.is_completed is False

    # Cannot claim incomplete mission
    success, msg, _ = claim_mission_reward(db_session, m.id, "mission_user")
    assert success is False
    assert "not completed" in msg

    # Complete mission
    m.current_value = m.target_value
    m.is_completed = True
    db_session.commit()

    # Claim mission
    success_claim, msg_claim, claimed_m = claim_mission_reward(db_session, m.id, "mission_user")
    assert success_claim is True
    assert claimed_m.is_claimed is True

    wallet = get_or_create_wallet(db_session, "mission_user")
    assert wallet.coin_balance >= 15
    assert wallet.total_xp >= 30

    # Cannot claim again
    success_second, msg_second, _ = claim_mission_reward(db_session, m.id, "mission_user")
    assert success_second is False
    assert "already claimed" in msg_second

def test_cosmetic_shop_purchase_and_equip(db_session):
    wallet = get_or_create_wallet(db_session, "buyer")
    wallet.coin_balance = 200
    db_session.commit()

    # Purchase valid item
    success, msg, w = purchase_cosmetic(db_session, "skin_citadel_royal_amethyst", "buyer")
    assert success is True
    assert w.coin_balance == 100  # 200 - 100

    # Cannot purchase already unlocked item
    success_dup, msg_dup, _ = purchase_cosmetic(db_session, "skin_citadel_royal_amethyst", "buyer")
    assert success_dup is False
    assert "already unlocked" in msg_dup

    # Equip
    eq_success, eq_msg = equip_cosmetic(db_session, "skin_citadel_royal_amethyst", "buyer")
    assert eq_success is True

def test_reset_game_progress_data_safety(db_session):
    # Create real learning records
    c = Course(name="Test Course", is_demo=False)
    db_session.add(c)
    db_session.flush()

    m = Module(course_id=c.id, title="Module 1")
    db_session.add(m)
    db_session.flush()

    t = Topic(module_id=m.id, course_id=c.id, title="Lesson 1", status="completed")
    db_session.add(t)

    note = Note(title="My Research Note", content="Vital formulas", is_demo=False)
    db_session.add(note)

    sess = StudySession(goal="Deep Work", actual_duration_secs=1800, status="completed", is_demo=False)
    db_session.add(sess)

    # Award game progress
    wallet = get_or_create_wallet(db_session, "reset_user")
    wallet.total_xp = 500
    wallet.coin_balance = 150
    db_session.commit()

    # Perform game reset
    result = reset_game_progress(db_session, "reset_user")
    assert result["success"] is True

    # Verify wallet reset
    assert wallet.total_xp == 0
    assert wallet.coin_balance == 0

    # CRITICAL: Verify academic materials were NOT deleted!
    assert db_session.query(Course).count() == 1
    assert db_session.query(Topic).count() == 1
    assert db_session.query(Note).count() == 1
    assert db_session.query(StudySession).count() == 1
