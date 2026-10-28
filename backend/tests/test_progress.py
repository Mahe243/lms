from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models import Course, Module, Topic, Resource
from backend.routers.courses import calculate_course_progress

def get_test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    return TestingSession()

def test_course_progress_non_optional_only():
    db = get_test_db()
    c = Course(name="Test Course")
    db.add(c)
    db.flush()

    m = Module(course_id=c.id, title="Module 1")
    db.add(m)
    db.flush()

    # 2 non-optional topics (1 completed, 1 in progress)
    t1 = Topic(module_id=m.id, course_id=c.id, title="Topic 1", status="completed", is_optional=False)
    t2 = Topic(module_id=m.id, course_id=c.id, title="Topic 2", status="in_progress", is_optional=False)
    # 1 optional topic (completed)
    t3 = Topic(module_id=m.id, course_id=c.id, title="Topic 3 (Bonus)", status="completed", is_optional=True)

    db.add_all([t1, t2, t3])
    db.commit()

    prog = calculate_course_progress(db, c.id)
    # Completion must be 1 / 2 = 50.0% (optional topic does not skew total denominator)
    assert prog.total_topics == 2
    assert prog.completed_topics == 1
    assert prog.completion_percentage == 50.0
    assert prog.optional_topics_count == 1
    assert prog.completed_optional_topics == 1
