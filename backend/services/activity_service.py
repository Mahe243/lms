from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import ActivityEvent, StudySession, Course, Topic, Resource, Note, Task, FlashcardReview, QuizAttempt
from backend.config import settings

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

def dt_to_timestamp(dt: datetime) -> float:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc).timestamp()
    return dt.astimezone(timezone.utc).timestamp()

def record_platform_visit(db: Session, session_visit_id: str) -> bool:
    """
    Records a platform visit if more than 30 minutes have elapsed since last visit
    or it is a new distinct session, preventing refresh inflation.
    """
    now = utc_now()
    thirty_mins_ago = now - timedelta(minutes=settings.IDLE_TIMEOUT_MINUTES)
    
    # Check if there is an existing visit within the last 30 minutes with the same session ID
    recent_visit = db.query(ActivityEvent).filter(
        ActivityEvent.event_type == "platform_visit",
        ActivityEvent.timestamp >= thirty_mins_ago
    ).order_by(ActivityEvent.timestamp.desc()).first()

    if recent_visit:
        # If the same session or within 30 min window, do not add a new visit
        if recent_visit.session_visit_id == session_visit_id:
            return False

    # Also check if ANY platform visit was recorded in the last 2 minutes to prevent rapid reload spam
    very_recent = db.query(ActivityEvent).filter(
        ActivityEvent.event_type == "platform_visit",
        ActivityEvent.timestamp >= (now - timedelta(seconds=120))
    ).first()
    if very_recent:
        return False

    new_event = ActivityEvent(
        event_type="platform_visit",
        session_visit_id=session_visit_id,
        timestamp=now
    )
    db.add(new_event)
    db.commit()
    return True

def record_deliberate_visit(
    db: Session,
    event_type: str, # course_visit, topic_visit, resource_open
    target_type: str,
    target_id: str,
    course_id: Optional[str] = None
) -> bool:
    """
    Records a deliberate course/topic entry or resource open with duplicate protection (60s debounce).
    """
    now = utc_now()
    sixty_secs_ago = now - timedelta(seconds=60)
    
    existing = db.query(ActivityEvent).filter(
        ActivityEvent.event_type == event_type,
        ActivityEvent.target_id == target_id,
        ActivityEvent.timestamp >= sixty_secs_ago
    ).first()
    
    if existing:
        return False

    event = ActivityEvent(
        event_type=event_type,
        target_type=target_type,
        target_id=target_id,
        course_id=course_id,
        timestamp=now
    )
    db.add(event)

    # If resource open, also update resource.last_opened_at and open_count
    if event_type == "resource_open":
        res = db.query(Resource).filter(Resource.id == target_id).first()
        if res:
            res.last_opened_at = now
            res.open_count = (res.open_count or 0) + 1

    # If topic visit, update topic.last_studied_at
    if event_type == "topic_visit":
        top = db.query(Topic).filter(Topic.id == target_id).first()
        if top:
            top.last_studied_at = now

    db.commit()
    return True

def record_heartbeat(
    db: Session,
    duration_secs: int,
    course_id: Optional[str] = None,
    session_visit_id: Optional[str] = None
) -> None:
    """
    Records active studying heartbeat only when tab is visible and active.
    Max duration per heartbeat capped at 60s to prevent idle spikes.
    """
    capped_duration = min(max(duration_secs, 0), 60)
    if capped_duration <= 0:
        return

    event = ActivityEvent(
        event_type="heartbeat_active",
        duration_secs=capped_duration,
        course_id=course_id,
        session_visit_id=session_visit_id,
        timestamp=utc_now()
    )
    db.add(event)
    db.commit()

def get_study_time_intervals_for_range(
    db: Session,
    start_time: datetime,
    end_time: datetime
) -> int:
    """
    Calculates total non-overlapping active study seconds between start_time and end_time.
    Merges heartbeat active chunks and completed study sessions so times are NEVER double-counted!
    """
    intervals: List[Tuple[float, float]] = []

    # 1. Study Sessions
    sessions = db.query(StudySession).filter(
        StudySession.status == "completed",
        StudySession.start_time >= start_time,
        StudySession.start_time <= end_time
    ).all()
    
    for s in sessions:
        s_start = dt_to_timestamp(s.start_time)
        duration = s.actual_duration_secs or (s.planned_duration_mins * 60)
        s_end = dt_to_timestamp(s.end_time) if s.end_time else (s_start + duration)
        if s_end > s_start:
            intervals.append((s_start, s_end))

    # 2. Heartbeat active events
    heartbeats = db.query(ActivityEvent).filter(
        ActivityEvent.event_type == "heartbeat_active",
        ActivityEvent.timestamp >= start_time,
        ActivityEvent.timestamp <= end_time
    ).all()
    
    for h in heartbeats:
        h_end = dt_to_timestamp(h.timestamp)
        h_start = h_end - (h.duration_secs or 0)
        if h_end > h_start:
            intervals.append((h_start, h_end))

    if not intervals:
        return 0

    # Merge overlapping intervals
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current in intervals[1:]:
        prev_start, prev_end = merged[-1]
        curr_start, curr_end = current
        if curr_start <= prev_end:
            # Overlap exists, merge
            merged[-1] = (prev_start, max(prev_end, curr_end))
        else:
            merged.append(current)

    total_seconds = sum(end - start for start, end in merged)
    return int(total_seconds)

def calculate_study_streak(db: Session, min_minutes: int = 15) -> Dict[str, Any]:
    """
    Calculates consecutive study day streak.
    A day only counts if the user studied at least min_minutes (opening the app alone does NOT count).
    """
    now = utc_now()
    streak_count = 0
    active_days_set = set()

    # Look back over the past 365 days
    for day_offset in range(365):
        day_date = (now - timedelta(days=day_offset)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        day_end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)
        
        study_secs = get_study_time_intervals_for_range(db, day_start, day_end)
        study_mins = study_secs / 60.0
        
        if study_mins >= min_minutes:
            active_days_set.add(day_date.isoformat())
            if day_offset == 0 or day_offset == streak_count:
                streak_count += 1
        else:
            # If today has not met threshold yet, don't break streak if yesterday met it!
            if day_offset == 0:
                continue
            else:
                break

    return {
        "streak_days": streak_count,
        "min_minutes_threshold": min_minutes,
        "total_active_days": len(active_days_set)
    }

def get_analytics_metrics(db: Session) -> Dict[str, Any]:
    """
    Gathers honest, calculated platform analytics.
    """
    now = utc_now()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    week_start = today_start - timedelta(days=now.weekday()) # Monday

    study_time_today_secs = get_study_time_intervals_for_range(db, today_start, now)
    study_time_week_secs = get_study_time_intervals_for_range(db, week_start, now)

    # Visits
    total_visits = db.query(func.count(ActivityEvent.id)).filter(ActivityEvent.event_type == "platform_visit").scalar() or 0
    today_visits = db.query(func.count(ActivityEvent.id)).filter(
        ActivityEvent.event_type == "platform_visit",
        ActivityEvent.timestamp >= today_start
    ).scalar() or 0

    streak_info = calculate_study_streak(db, settings.STREAK_MIN_MINUTES)

    # Activity heatmap: study minutes per day for last 90 days
    heatmap = []
    for day_offset in range(89, -1, -1):
        day_date = (now - timedelta(days=day_offset)).date()
        d_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        d_end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)
        sec = get_study_time_intervals_for_range(db, d_start, d_end)
        heatmap.append({
            "date": day_date.isoformat(),
            "minutes": round(sec / 60.0, 1),
            "count": int(sec // 300) # intensity levels
        })

    # Study time by course
    courses = db.query(Course).all()
    course_times = []
    for c in courses:
        # Sum completed study sessions for course
        sessions_time = db.query(func.sum(StudySession.actual_duration_secs)).filter(
            StudySession.course_id == c.id,
            StudySession.status == "completed"
        ).scalar() or 0
        course_times.append({
            "course_id": c.id,
            "course_name": c.name,
            "color": c.cover_color,
            "minutes": round(sessions_time / 60.0, 1)
        })

    # Quiz accuracy trends
    recent_attempts = db.query(QuizAttempt).order_by(QuizAttempt.completed_at.desc()).limit(10).all()
    quiz_trend = [
        {
            "quiz_title": a.quiz_title,
            "percentage": a.percentage,
            "date": a.completed_at.strftime("%b %d")
        } for a in reversed(recent_attempts)
    ]

    return {
        "study_time_today_minutes": round(study_time_today_secs / 60.0, 1),
        "study_time_week_hours": round(study_time_week_secs / 3600.0, 2),
        "total_visits": total_visits,
        "today_visits": today_visits,
        "streak_days": streak_info["streak_days"],
        "total_active_days": streak_info["total_active_days"],
        "heatmap": heatmap,
        "course_times": course_times,
        "quiz_trend": quiz_trend
    }
