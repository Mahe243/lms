import pytest
from backend.routers.quizzes import grade_response

def test_grade_mcq():
    assert grade_response("mcq", "Paris", "Paris") is True
    assert grade_response("mcq", "paris ", "Paris") is True
    assert grade_response("mcq", "London", "Paris") is False

def test_grade_true_false():
    assert grade_response("true_false", "true", "True") is True
    assert grade_response("true_false", "false", "True") is False

def test_grade_multi_select():
    assert grade_response("multi_select", ["a", "b"], ["b", "a"]) is True
    assert grade_response("multi_select", ["a"], ["a", "b"]) is False

def test_grade_numerical():
    # Strict match
    assert grade_response("numerical", "42", "42", tolerance=0.0) is True
    # Tolerance match
    assert grade_response("numerical", "3.14", "3.14159", tolerance=0.01) is True
    # Outside tolerance
    assert grade_response("numerical", "3.10", "3.14159", tolerance=0.01) is False

def test_grade_ordering():
    assert grade_response("ordering", ["A", "B", "C"], ["A", "B", "C"]) is True
    assert grade_response("ordering", ["B", "A", "C"], ["A", "B", "C"]) is False
