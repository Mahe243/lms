from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models import Course, Module, Topic, Note
from backend.services.demo_data import seed_demo_data, clean_demo_data

def get_test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    return TestingSession()

def test_seed_and_clean_demo_data():
    db = get_test_db()
    
    # 1. Seed demo data
    seeded = seed_demo_data(db)
    assert seeded is True

    # Check demo courses and notes were added
    demo_courses = db.query(Course).filter(Course.is_demo == True).count()
    assert demo_courses >= 1

    demo_notes = db.query(Note).filter(Note.is_demo == True).count()
    assert demo_notes >= 1

    # 2. Add user personal non-demo note and course
    user_course = Course(name="My Personal Math Course", is_demo=False)
    db.add(user_course)
    db.flush()
    user_note = Note(course_id=user_course.id, title="My Secret Research", is_demo=False)
    db.add(user_note)
    db.commit()

    # 3. Clean demo data
    clean_counts = clean_demo_data(db)
    assert clean_counts["courses"] >= 1
    assert clean_counts["notes"] >= 1

    # 4. Verify user personal data remains untouched!
    remaining_courses = db.query(Course).all()
    assert len(remaining_courses) == 1
    assert remaining_courses[0].name == "My Personal Math Course"

    remaining_notes = db.query(Note).all()
    assert len(remaining_notes) == 1
    assert remaining_notes[0].title == "My Secret Research"
