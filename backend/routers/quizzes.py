import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import QuestionBank, Question, QuizAttempt
from backend.schemas import (
    QuestionBankCreate, QuestionBankOut,
    QuestionCreate, QuestionOut,
    QuizSubmitRequest, QuizAttemptOut
)

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes & Practice"])

def question_to_dict(q: Question) -> dict:
    return {
        "id": q.id,
        "bank_id": q.bank_id,
        "course_id": q.course_id,
        "topic_id": q.topic_id,
        "question_type": q.question_type,
        "question_text": q.question_text,
        "options": json.loads(q.options) if q.options else [],
        "correct_answer": json.loads(q.correct_answer) if q.correct_answer and (q.correct_answer.startswith("[") or q.correct_answer.startswith("{") or q.correct_answer.startswith('"')) else q.correct_answer,
        "numerical_tolerance": q.numerical_tolerance,
        "numerical_unit": q.numerical_unit,
        "matching_pairs": json.loads(q.matching_pairs) if q.matching_pairs else [],
        "order_items": json.loads(q.order_items) if q.order_items else [],
        "explanation": q.explanation,
        "source_ref": q.source_ref,
        "difficulty": q.difficulty,
        "tags": json.loads(q.tags) if q.tags else [],
        "personal_notes": q.personal_notes,
        "is_draft": q.is_draft,
        "is_demo": q.is_demo,
        "created_at": q.created_at,
        "updated_at": q.updated_at
    }

@router.get("/banks", response_model=List[QuestionBankOut])
def list_banks(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(QuestionBank)
    if course_id:
        query = query.filter(QuestionBank.course_id == course_id)
    banks = query.all()
    results = []
    for b in banks:
        q_count = db.query(Question).filter(Question.bank_id == b.id, Question.is_draft == False).count()
        results.append({
            "id": b.id,
            "course_id": b.course_id,
            "topic_id": b.topic_id,
            "name": b.name,
            "description": b.description,
            "question_count": q_count,
            "is_demo": b.is_demo,
            "created_at": b.created_at
        })
    return results

@router.post("/banks", response_model=QuestionBankOut)
def create_bank(data: QuestionBankCreate, db: Session = Depends(get_db)):
    b = QuestionBank(
        course_id=data.course_id,
        topic_id=data.topic_id,
        name=data.name,
        description=data.description or ""
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return {
        "id": b.id,
        "course_id": b.course_id,
        "topic_id": b.topic_id,
        "name": b.name,
        "description": b.description,
        "question_count": 0,
        "is_demo": b.is_demo,
        "created_at": b.created_at
    }

@router.get("/questions", response_model=List[QuestionOut])
def list_questions(
    bank_id: Optional[str] = None,
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    drafts_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if bank_id: query = query.filter(Question.bank_id == bank_id)
    if course_id: query = query.filter(Question.course_id == course_id)
    if topic_id: query = query.filter(Question.topic_id == topic_id)
    if difficulty: query = query.filter(Question.difficulty == difficulty)
    query = query.filter(Question.is_draft == drafts_only)
    questions = query.all()
    return [question_to_dict(q) for q in questions]

@router.post("/questions", response_model=QuestionOut)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    ans_serialized = json.dumps(data.correct_answer) if not isinstance(data.correct_answer, str) else data.correct_answer
    q = Question(
        bank_id=data.bank_id,
        course_id=data.course_id,
        topic_id=data.topic_id,
        question_type=data.question_type or "mcq",
        question_text=data.question_text,
        options=json.dumps(data.options or []),
        correct_answer=ans_serialized,
        numerical_tolerance=data.numerical_tolerance or 0.0,
        numerical_unit=data.numerical_unit,
        matching_pairs=json.dumps(data.matching_pairs or []),
        order_items=json.dumps(data.order_items or []),
        explanation=data.explanation or "",
        source_ref=data.source_ref,
        difficulty=data.difficulty or "medium",
        tags=json.dumps(data.tags or []),
        personal_notes=data.personal_notes or "",
        is_draft=data.is_draft or False
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return question_to_dict(q)

@router.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted successfully"}

def grade_response(q_type: str, user_ans: Any, correct_ans: Any, tolerance: float = 0.0) -> bool:
    """Rigorous objective grading logic."""
    if user_ans is None:
        return False

    if q_type in ["mcq", "true_false"]:
        return str(user_ans).strip().lower() == str(correct_ans).strip().lower()

    elif q_type == "multi_select":
        u_set = set(str(x).strip().lower() for x in (user_ans if isinstance(user_ans, list) else [user_ans]))
        c_set = set(str(x).strip().lower() for x in (correct_ans if isinstance(correct_ans, list) else [correct_ans]))
        return u_set == c_set

    elif q_type == "short_answer":
        return str(user_ans).strip().lower() == str(correct_ans).strip().lower()

    elif q_type == "numerical":
        try:
            u_num = float(user_ans)
            c_num = float(correct_ans)
            return abs(u_num - c_num) <= tolerance
        except (ValueError, TypeError):
            return False

    elif q_type == "ordering":
        if isinstance(user_ans, list) and isinstance(correct_ans, list):
            return user_ans == correct_ans
        return False

    elif q_type == "matching":
        if isinstance(user_ans, list) and isinstance(correct_ans, list):
            # check all pairs match
            return sorted(str(p) for p in user_ans) == sorted(str(p) for p in correct_ans)
        return False

    elif q_type == "long_answer":
        # Handled via user self-assessment score passed in payload
        return bool(user_ans.get("self_assessed_correct", True)) if isinstance(user_ans, dict) else True

    return False

@router.post("/submit", response_model=QuizAttemptOut)
def submit_quiz_attempt(data: QuizSubmitRequest, db: Session = Depends(get_db)):
    # Fetch questions
    q_ids = list(data.responses.keys())
    questions = db.query(Question).filter(Question.id.in_(q_ids)).all() if q_ids else []

    score = 0.0
    max_score = float(len(questions)) if questions else 1.0
    graded_responses = {}
    snapshot = []

    for q in questions:
        q_dict = question_to_dict(q)
        snapshot.append(q_dict)

        user_input = data.responses.get(q.id)
        is_corr = grade_response(q.question_type, user_input, q_dict["correct_answer"], q.numerical_tolerance)
        if is_corr:
            score += 1.0

        graded_responses[q.id] = {
            "user_answer": user_input,
            "correct_answer": q_dict["correct_answer"],
            "is_correct": is_corr,
            "explanation": q.explanation,
            "question_text": q.question_text
        }

    pct = round((score / max_score * 100.0), 1) if max_score > 0 else 0.0

    attempt = QuizAttempt(
        bank_id=data.bank_id,
        course_id=data.course_id,
        topic_id=data.topic_id,
        quiz_title=data.quiz_title,
        mode=data.mode,
        score=score,
        max_score=max_score,
        percentage=pct,
        time_spent_secs=data.time_spent_secs,
        questions_snapshot=json.dumps(snapshot),
        responses=json.dumps(graded_responses),
        completed_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "id": attempt.id,
        "bank_id": attempt.bank_id,
        "course_id": attempt.course_id,
        "topic_id": attempt.topic_id,
        "quiz_title": attempt.quiz_title,
        "mode": attempt.mode,
        "score": attempt.score,
        "max_score": attempt.max_score,
        "percentage": attempt.percentage,
        "time_spent_secs": attempt.time_spent_secs,
        "questions_snapshot": snapshot,
        "responses": graded_responses,
        "completed_at": attempt.completed_at,
        "is_demo": attempt.is_demo,
        "created_at": attempt.created_at
    }

@router.get("/attempts", response_model=List[QuizAttemptOut])
def list_attempts(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(QuizAttempt)
    if course_id:
        query = query.filter(QuizAttempt.course_id == course_id)
    attempts = query.order_by(QuizAttempt.completed_at.desc()).all()
    results = []
    for a in attempts:
        results.append({
            "id": a.id,
            "bank_id": a.bank_id,
            "course_id": a.course_id,
            "topic_id": a.topic_id,
            "quiz_title": a.quiz_title,
            "mode": a.mode,
            "score": a.score,
            "max_score": a.max_score,
            "percentage": a.percentage,
            "time_spent_secs": a.time_spent_secs,
            "questions_snapshot": json.loads(a.questions_snapshot) if a.questions_snapshot else [],
            "responses": json.loads(a.responses) if a.responses else {},
            "completed_at": a.completed_at,
            "is_demo": a.is_demo,
            "created_at": a.created_at
        })
    return results

@router.get("/mistake-log")
def get_mistake_log(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns unique questions the user has answered incorrectly in past quiz attempts.
    """
    query = db.query(QuizAttempt)
    if course_id:
        query = query.filter(QuizAttempt.course_id == course_id)
    attempts = query.order_by(QuizAttempt.completed_at.desc()).limit(20).all()

    mistakes = []
    seen_q_ids = set()

    for a in attempts:
        if not a.responses:
            continue
        resp_dict = json.loads(a.responses)
        for q_id, r in resp_dict.items():
            if not r.get("is_correct") and q_id not in seen_q_ids:
                seen_q_ids.add(q_id)
                mistakes.append({
                    "question_id": q_id,
                    "quiz_title": a.quiz_title,
                    "question_text": r.get("question_text", ""),
                    "user_answer": r.get("user_answer"),
                    "correct_answer": r.get("correct_answer"),
                    "explanation": r.get("explanation"),
                    "attempt_date": a.completed_at
                })
    return mistakes
