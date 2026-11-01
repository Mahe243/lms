import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_endpoints_work_without_lifespan():
    """
    Simulates serverless invocation where ASGI lifespan events are not executed.
    Endpoints must lazily initialize the database and tables, returning 200 OK.
    """
    # Plain TestClient without context manager ('with TestClient...') avoids running lifespan
    client = TestClient(app)
    
    # 1. Health endpoint returns 200 with persistence metadata
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["status"] == "healthy"
    assert "persistence" in health_data
    
    # 2. Courses endpoint returns 200 with courses (verifying tables are created and seeded)
    courses_resp = client.get("/api/courses")
    assert courses_resp.status_code == 200
    courses = courses_resp.json()
    assert isinstance(courses, list)
    assert len(courses) > 0
    
    # 3. Quizzes endpoint works
    quizzes_resp = client.get("/api/quizzes/banks")
    assert quizzes_resp.status_code == 200
