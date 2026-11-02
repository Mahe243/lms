import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import Base, get_db
from backend.models import (
    User, Course, Module, Topic, Resource, FlashcardDeck,
    Flashcard, QuestionBank, Question, StudySession, GameWallet
)
from backend.security import generate_session_token

# Shared in-memory SQLite database across threads via StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Create primary test user
        user = User(
            id="test-primary-user",
            name="Archon Learner",
            email="learner@personal.lms"
        )
        db.add(user)
        db.commit()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_token_auth_flow(client, test_db):
    # Request session token
    res = client.post("/api/user/token")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user_id"] == "test-primary-user"

    # Use token in Authorization header
    token = data["access_token"]
    res_wallet = client.get("/api/game/wallet", headers={"Authorization": f"Bearer {token}"})
    assert res_wallet.status_code == 200
    wallet_data = res_wallet.json()
    assert wallet_data["coin_balance"] == 0
    assert wallet_data["total_xp"] == 0
    assert wallet_data["level"] == 1

def test_video_watch_progress_and_completion(client, test_db):
    # Setup course, module, topic, and video resource
    c = Course(id="course-rag", name="Enterprise RAG", is_demo=False)
    test_db.add(c)
    test_db.flush()

    m = Module(id="mod-1", course_id=c.id, title="Module 1")
    test_db.add(m)
    test_db.flush()

    t = Topic(id="topic-fusion", course_id=c.id, module_id=m.id, title="Reciprocal Rank Fusion", status="not_started")
    test_db.add(t)
    test_db.flush()

    res_video = Resource(
        id="res-vid-1",
        course_id=c.id,
        topic_id=t.id,
        title="RRF Fusion Lecture",
        type="video",
        url="https://youtube.com/watch?v=kCc8FmEb1nY",
        resume_position_secs=0,
        status="saved"
    )
    test_db.add(res_video)
    test_db.commit()

    # 1. Post partial watch progress (50% - not completed)
    resp1 = client.post(f"/api/courses/topics/{t.id}/watch-progress", json={
        "position_secs": 600,
        "duration_secs": 1200,
        "resource_id": res_video.id,
        "completed": False
    })
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["position_secs"] == 600
    assert data1["topic_status"] == "in_progress"

    # Verify resume state
    state_res = client.get(f"/api/courses/topics/{t.id}/watch-progress")
    assert state_res.status_code == 200
    assert state_res.json()["resume_position_secs"] == 600

    # 2. Post progress crossing 85% completion threshold (1050 / 1200 = 87.5%)
    resp2 = client.post(f"/api/courses/topics/{t.id}/watch-progress", json={
        "position_secs": 1050,
        "duration_secs": 1200,
        "resource_id": res_video.id
    })
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["topic_status"] == "completed"
    assert data2["reward"] is not None
    assert data2["reward"]["success"] is True
    assert data2["reward"]["awarded_xp"] == 50
    assert data2["reward"]["awarded_coins"] == 25

    # Check updated wallet
    w_res = client.get("/api/game/wallet")
    assert w_res.status_code == 200
    assert w_res.json()["total_xp"] >= 50
    assert w_res.json()["coin_balance"] >= 25

def test_flashcard_fsrs_review_rewards(client, test_db):
    deck = FlashcardDeck(id="deck-algo", name="Algorithms", is_demo=False)
    test_db.add(deck)
    test_db.flush()

    card = Flashcard(
        id="card-hashing",
        deck_id=deck.id,
        front="What is consistent hashing?",
        back="A distributed hashing scheme that minimizes remapping on node additions.",
        stability=1.0,
        interval_days=0,
        reps=0,
        lapses=0,
        state="new",
        next_review_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    test_db.add(card)
    test_db.commit()

    # Review card with rating 3 (Good)
    rev_res = client.post("/api/flashcards/review", json={
        "card_id": card.id,
        "rating": 3,
        "review_time_ms": 2500
    })
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["status"] == "success"
    assert rev_data["reward"]["success"] is True
    assert rev_data["reward"]["awarded_xp"] == 5
    assert rev_data["reward"]["awarded_coins"] == 2

    # Check wallet
    w = client.get("/api/game/wallet").json()
    assert w["total_xp"] == 5
    assert w["coin_balance"] == 2

def test_quiz_attempt_grading_and_rewards(client, test_db):
    bank = QuestionBank(id="bank-quant", name="Quant Questions", is_demo=False)
    test_db.add(bank)
    test_db.flush()

    q1 = Question(
        id="q-greeks-1",
        bank_id=bank.id,
        question_type="mcq",
        question_text="What represents option price sensitivity to interest rate shifts?",
        options='["Delta", "Gamma", "Rho", "Theta"]',
        correct_answer='"Rho"',
        numerical_tolerance=0.0,
        difficulty="medium"
    )
    test_db.add(q1)
    test_db.commit()

    # Submit quiz attempt with correct answer
    sub_res = client.post("/api/quizzes/submit", json={
        "bank_id": bank.id,
        "quiz_title": "Options Greek Assessment",
        "mode": "exam",
        "responses": {
            q1.id: "Rho"
        },
        "time_spent_secs": 45
    })
    assert sub_res.status_code == 200
    data = sub_res.json()
    assert data["percentage"] == 100.0
    assert data["score"] == 1.0

    # Wallet awarded 40 XP + 20 Coins for score >= 70%
    w = client.get("/api/game/wallet").json()
    assert w["total_xp"] == 40
    assert w["coin_balance"] == 20

def test_project_milestone_idempotency(client, test_db):
    # First execution earns rewards
    res1 = client.post("/api/game/projects/milestone", json={
        "project_key": "fintech_underwriting",
        "milestone_key": "underwriting_sim_v1",
        "title": "Completed Multi-Agent Underwriting Simulation",
        "summary": "Risk Index 0.82"
    })
    assert res1.status_code == 200
    assert res1.json()["success"] is True
    assert res1.json()["awarded_xp"] == 60
    assert res1.json()["awarded_coins"] == 30

    # Duplicate execution for identical milestone rejected idempotently
    res2 = client.post("/api/game/projects/milestone", json={
        "project_key": "fintech_underwriting",
        "milestone_key": "underwriting_sim_v1",
        "title": "Completed Multi-Agent Underwriting Simulation",
        "summary": "Risk Index 0.82"
    })
    assert res2.status_code == 200
    assert res2.json()["success"] is False
    assert res2.json()["reason"] == "already_awarded"
