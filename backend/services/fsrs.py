from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple, Optional

def to_naive_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

def schedule_flashcard(
    rating: str, # again, hard, good, easy
    reps: int,
    lapses: int,
    stability: float,
    current_interval: int,
    state: str
) -> Dict[str, Any]:
    """
    Spaced repetition calculation (modified SM-2 / FSRS principles).
    Ratings: again (1), hard (2), good (3), easy (4)
    """
    rating = rating.lower()
    stability = max(1.3, stability)
    now = utc_now()
    
    if rating == "again":
        new_lapses = lapses + 1
        new_reps = 0
        new_interval = 1
        new_state = "relearning" if state != "new" else "learning"
        new_stability = max(1.3, stability - 0.2)
    elif rating == "hard":
        new_lapses = lapses
        new_reps = reps + 1
        new_interval = max(1, int(round(current_interval * 1.2))) if current_interval > 0 else 1
        new_state = "review"
        new_stability = max(1.3, stability - 0.15)
    elif rating == "good":
        new_lapses = lapses
        new_reps = reps + 1
        if reps == 0 or current_interval == 0:
            new_interval = 1
        elif reps == 1:
            new_interval = 3
        else:
            new_interval = max(1, int(round(current_interval * stability)))
        new_state = "review"
        new_stability = stability
    elif rating == "easy":
        new_lapses = lapses
        new_reps = reps + 1
        if reps == 0 or current_interval == 0:
            new_interval = 4
        else:
            new_interval = max(1, int(round(max(current_interval, 1) * stability * 1.35))) + 1
        new_state = "review"
        new_stability = stability + 0.15
    else:
        # fallback default
        new_lapses = lapses
        new_reps = reps + 1
        new_interval = max(1, current_interval)
        new_state = state
        new_stability = stability

    next_review = now + timedelta(days=new_interval)
    
    return {
        "reps": new_reps,
        "lapses": new_lapses,
        "stability": round(new_stability, 3),
        "interval_days": new_interval,
        "state": new_state,
        "last_review_at": now,
        "next_review_at": next_review
    }

DEFAULT_TOPIC_INTERVALS = [1, 3, 7, 14, 30, 60]

def schedule_topic_revision(
    rating: str, # forgot, difficult, good, easy
    current_interval: int,
    revision_count: int
) -> Tuple[int, datetime]:
    """
    Topic spaced revision interval updater.
    """
    rating = rating.lower()
    now = utc_now()
    
    if rating == "forgot":
        new_interval = 1
        new_count = 0
    elif rating == "difficult":
        new_interval = max(1, current_interval)
        new_count = revision_count
    elif rating == "good":
        # Find next interval in list or double
        next_intervals = [i for i in DEFAULT_TOPIC_INTERVALS if i > current_interval]
        new_interval = next_intervals[0] if next_intervals else int(round(current_interval * 2.0))
        new_count = revision_count + 1
    elif rating == "easy":
        next_intervals = [i for i in DEFAULT_TOPIC_INTERVALS if i > current_interval]
        if len(next_intervals) >= 2:
            new_interval = next_intervals[1]
        elif next_intervals:
            new_interval = int(round(next_intervals[0] * 1.5))
        else:
            new_interval = int(round(current_interval * 2.5))
        new_count = revision_count + 1
    else:
        new_interval = max(1, current_interval)
        new_count = revision_count

    next_date = now + timedelta(days=new_interval)
    return new_interval, next_date
