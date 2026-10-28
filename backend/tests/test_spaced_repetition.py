import pytest
from backend.services.fsrs import schedule_flashcard, schedule_topic_revision

def test_flashcard_again_resets_interval():
    res = schedule_flashcard(
        rating="again",
        reps=3,
        lapses=0,
        stability=2.5,
        current_interval=6,
        state="review"
    )
    assert res["reps"] == 0
    assert res["lapses"] == 1
    assert res["interval_days"] == 1
    assert res["state"] == "relearning"
    assert res["stability"] <= 2.3

def test_flashcard_good_progression():
    # Initial review
    res1 = schedule_flashcard(
        rating="good",
        reps=0,
        lapses=0,
        stability=2.5,
        current_interval=0,
        state="new"
    )
    assert res1["interval_days"] == 1
    assert res1["reps"] == 1

    # Second review
    res2 = schedule_flashcard(
        rating="good",
        reps=1,
        lapses=0,
        stability=2.5,
        current_interval=1,
        state="review"
    )
    assert res2["interval_days"] == 3
    assert res2["reps"] == 2

    # Third review (multiplied by ease factor)
    res3 = schedule_flashcard(
        rating="good",
        reps=2,
        lapses=0,
        stability=2.5,
        current_interval=3,
        state="review"
    )
    assert res3["interval_days"] >= 7
    assert res3["reps"] == 3

def test_flashcard_easy_boost():
    res = schedule_flashcard(
        rating="easy",
        reps=1,
        lapses=0,
        stability=2.5,
        current_interval=2,
        state="review"
    )
    assert res["interval_days"] > 4
    assert res["stability"] > 2.5

def test_topic_revision_intervals():
    # 1 -> 3 -> 7 -> 14 -> 30
    int1, _ = schedule_topic_revision("good", 1, 0)
    assert int1 == 3

    int2, _ = schedule_topic_revision("good", 3, 1)
    assert int2 == 7

    int3, _ = schedule_topic_revision("forgot", 7, 2)
    assert int3 == 1
