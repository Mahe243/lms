from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models import ActivityEvent, StudySession
from backend.services.activity_service import (
    record_platform_visit,
    get_study_time_intervals_for_range,
    calculate_study_streak
)

def get_test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    return TestingSession()

def test_platform_visit_deduplication():
    db = get_test_db()
    # First visit records True
    res1 = record_platform_visit(db, "session-abc")
    assert res1 is True

    # Immediate second call with same session ID does not record
    res2 = record_platform_visit(db, "session-abc")
    assert res2 is False

def test_study_time_no_double_counting():
    db = get_test_db()
    now = datetime.now(timezone.utc)
    t0 = now - timedelta(minutes=60)
    t1 = now - timedelta(minutes=30)

    # 1. Study session from t0 to t1 (30 mins = 1800 secs)
    sess = StudySession(
        start_time=t0,
        end_time=t1,
        actual_duration_secs=1800,
        status="completed"
    )
    db.add(sess)

    # 2. Heartbeat events that OVERLAP with the study session (e.g. at t0 + 10 mins)
    overlap_time = t0 + timedelta(minutes=10)
    hb = ActivityEvent(
        event_type="heartbeat_active",
        duration_secs=60,
        timestamp=overlap_time
    )
    db.add(hb)
    db.commit()

    # The total duration should still be 1800 seconds (30 mins), not 1860 seconds!
    total_secs = get_study_time_intervals_for_range(db, t0 - timedelta(minutes=5), now)
    assert total_secs == 1800

def test_streak_requires_minimum_duration():
    db = get_test_db()
    now = datetime.now(timezone.utc)
    
    # Only 5 minutes study today
    sess = StudySession(
        start_time=now - timedelta(minutes=5),
        end_time=now,
        actual_duration_secs=300,
        status="completed"
    )
    db.add(sess)
    db.commit()

    # If min threshold is 15 minutes, streak should be 0
    res = calculate_study_streak(db, min_minutes=15)
    assert res["streak_days"] == 0

    # If min threshold is 5 minutes, streak should be 1
    res2 = calculate_study_streak(db, min_minutes=5)
    assert res2["streak_days"] == 1
