import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_quiz_submit_payload_matching_frontend():
    """
    Verifies that the backend accepts the exact JSON payload sent by frontend
    (quiz_title, responses, course_id, bank_id, mode, time_spent_secs)
    and returns 200 with graded responses and valid score percentage.
    """
    client = TestClient(app)
    
    # 1. First get available questions to obtain real seeded Question IDs
    banks_resp = client.get("/api/quizzes/banks")
    assert banks_resp.status_code == 200
    banks = banks_resp.json()
    assert len(banks) > 0
    bank_id = banks[0]["id"]
    
    questions_resp = client.get(f"/api/quizzes/questions?bank_id={bank_id}")
    assert questions_resp.status_code == 200
    questions = questions_resp.json()
    assert len(questions) > 0

    # 2. Construct responses mapping question_id -> option index / answer
    # Answering correctly for the questions
    responses = {}
    for q in questions:
        # q['correct_answer'] is either '0', '1', or index
        ans = q.get("correct_answer", "0")
        try:
            responses[q["id"]] = int(ans)
        except (ValueError, TypeError):
            responses[q["id"]] = ans

    payload = {
        "quiz_title": "RBI Grade B Phase II - Economic & Social Issues (ESI) + FinTech Full Mock #04",
        "responses": responses,
        "course_id": "monetary-policy",
        "bank_id": bank_id,
        "mode": "exam",
        "time_spent_secs": 1800
    }

    # 3. Submit quiz
    submit_resp = client.post("/api/quizzes/submit", json=payload)
    assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
    
    data = submit_resp.json()
    assert data["quiz_title"] == payload["quiz_title"]
    assert data["score"] > 0
    assert data["percentage"] > 0
    assert data["time_spent_secs"] == 1800
    assert isinstance(data["responses"], dict)
