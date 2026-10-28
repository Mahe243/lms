import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, default="Learner")
    email = Column(String, default="learner@personal.lms")
    avatar_url = Column(String, nullable=True)
    preferences = Column(Text, default="{}") # JSON: theme, limits, quiet_hours, etc.
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, default="General")
    instructor = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    target_completion_date = Column(String, nullable=True)
    exam_date = Column(String, nullable=True)
    priority = Column(String, default="medium") # low, medium, high
    cover_color = Column(String, default="#4f46e5")
    tags = Column(Text, default="[]") # JSON list
    syllabus = Column(Text, default="")
    learning_goals = Column(Text, default="[]") # JSON list
    status = Column(String, default="active") # planned, active, paused, completed, archived
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_index")
    topics = relationship("Topic", back_populates="course", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="course", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="course", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="course", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", back_populates="modules")
    topics = relationship("Topic", back_populates="module", cascade="all, delete-orphan", order_by="Topic.order_index")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(String, primary_key=True, default=generate_uuid)
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    learning_objectives = Column(Text, default="[]") # JSON list
    estimated_minutes = Column(Integer, default=30)
    status = Column(String, default="not_started") # not_started, in_progress, completed, needs_revision
    understanding_level = Column(String, default="unfamiliar") # unfamiliar, basic, comfortable, confident
    is_optional = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    personal_questions = Column(Text, default="[]") # JSON list
    last_studied_at = Column(DateTime, nullable=True)
    next_revision_at = Column(DateTime, nullable=True)
    revision_interval_days = Column(Integer, default=1)
    revision_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", back_populates="topics")
    module = relationship("Module", back_populates="topics")
    subtopics = relationship("Subtopic", back_populates="topic", cascade="all, delete-orphan", order_by="Subtopic.order_index")
    notes = relationship("Note", back_populates="topic", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="topic", cascade="all, delete-orphan")

class Subtopic(Base):
    __tablename__ = "subtopics"
    id = Column(String, primary_key=True, default=generate_uuid)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    order_index = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    topic = relationship("Topic", back_populates="subtopics")

class Note(Base):
    __tablename__ = "notes"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    summary = Column(Text, default="")
    tags = Column(Text, default="[]") # JSON list
    is_pinned = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    needs_revision = Column(Boolean, default=False)
    template_type = Column(String, default="general") # general, lecture, video, reading, case_analysis, formula_sheet, exam_revision, questions_doubts, weekly_review
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", back_populates="notes")
    topic = relationship("Topic", back_populates="notes")
    versions = relationship("NoteVersion", back_populates="note", cascade="all, delete-orphan", order_by="NoteVersion.version_number.desc()")

class NoteVersion(Base):
    __tablename__ = "note_versions"
    id = Column(String, primary_key=True, default=generate_uuid)
    note_id = Column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    note = relationship("Note", back_populates="versions")

class NoteLink(Base):
    __tablename__ = "note_links"
    id = Column(String, primary_key=True, default=generate_uuid)
    source_note_id = Column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    target_note_id = Column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utc_now)

class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # video, pdf, article, doc, presentation, image, audio, book, external_course, practice
    url = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    description = Column(Text, default="")
    author = Column(String, nullable=True)
    tags = Column(Text, default="[]")
    estimated_duration_mins = Column(Integer, default=15)
    status = Column(String, default="saved") # saved, in_progress, completed, revisit
    personal_rating = Column(Integer, default=0) # 0 to 5
    is_favorite = Column(Boolean, default=False)
    last_opened_at = Column(DateTime, nullable=True)
    open_count = Column(Integer, default=0)
    is_indexed = Column(Boolean, default=False)
    indexing_status = Column(String, default="unprocessed") # unprocessed, indexing, indexed, ocr_required, unsupported, failed
    extracted_text = Column(Text, default="")
    metadata_info = Column(Text, default="{}") # JSON
    resume_position_secs = Column(Float, default=0.0)
    is_deleted = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", back_populates="resources")
    topic = relationship("Topic", back_populates="resources")
    chunks = relationship("ResourceChunk", back_populates="resource", cascade="all, delete-orphan")

class ResourceChunk(Base):
    __tablename__ = "resource_chunks"
    id = Column(String, primary_key=True, default=generate_uuid)
    resource_id = Column(String, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    timestamp_secs = Column(Float, nullable=True)
    text_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    resource = relationship("Resource", back_populates="chunks")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(String, primary_key=True, default=generate_uuid)
    target_type = Column(String, nullable=False) # course, topic, note, resource, video, question, task
    target_id = Column(String, nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    text = Column(Text, nullable=False)
    comment_type = Column(String, default="observation") # observation, doubt, reminder, insight
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, default="")
    is_pinned = Column(Boolean, default=False)
    priority = Column(String, default="medium") # low, medium, high
    timestamp_secs = Column(Float, nullable=True)
    page_number = Column(Integer, nullable=True)
    related_ai_conversation_id = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, default="New Conversation")
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    resource_id = Column(String, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    doubt_id = Column(String, ForeignKey("comments.id", ondelete="SET NULL"), nullable=True)
    context_mode = Column(String, default="my_materials_plus_general") # my_materials, my_materials_plus_general, passage_only, general
    selected_passage = Column(Text, nullable=True)
    source_references = Column(Text, default="[]") # JSON list of used resources
    is_archived = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(Base):
    __tablename__ = "ai_messages"
    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    source_citations = Column(Text, default="[]") # JSON list of {source_id, title, page, timestamp, quote}
    helpfulness_rating = Column(Integer, default=0) # 1, -1, 0
    prompt_type = Column(String, nullable=True) # explain_simply, example, step_by_step, hint, quiz_me, etc.
    created_at = Column(DateTime, default=utc_now)

    conversation = relationship("AIConversation", back_populates="messages")

class FlashcardDeck(Base):
    __tablename__ = "flashcard_decks"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    tags = Column(Text, default="[]")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    cards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")

class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(String, primary_key=True, default=generate_uuid)
    deck_id = Column(String, ForeignKey("flashcard_decks.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    card_type = Column(String, default="basic") # basic, reversed, cloze, image
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    cloze_text = Column(Text, nullable=True)
    explanation = Column(Text, default="")
    source_ref = Column(String, nullable=True)
    tags = Column(Text, default="[]")
    image_url = Column(String, nullable=True)
    is_suspended = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    draft_reviewed = Column(Boolean, default=True)
    
    # Spaced repetition scheduling state (FSRS / SM-2)
    reps = Column(Integer, default=0)
    lapses = Column(Integer, default=0)
    stability = Column(Float, default=2.5) # ease factor
    state = Column(String, default="new") # new, learning, review, relearning
    interval_days = Column(Integer, default=0)
    last_review_at = Column(DateTime, nullable=True)
    next_review_at = Column(DateTime, nullable=True)
    
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    deck = relationship("FlashcardDeck", back_populates="cards")
    reviews = relationship("FlashcardReview", back_populates="card", cascade="all, delete-orphan")

class FlashcardReview(Base):
    __tablename__ = "flashcard_reviews"
    id = Column(String, primary_key=True, default=generate_uuid)
    card_id = Column(String, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    rating = Column(String, nullable=False) # again, hard, good, easy
    review_time_ms = Column(Integer, default=0)
    scheduled_days = Column(Integer, default=1)
    elapsed_days = Column(Integer, default=0)
    reviewed_at = Column(DateTime, default=utc_now)

    card = relationship("Flashcard", back_populates="reviews")

class QuestionBank(Base):
    __tablename__ = "question_banks"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    questions = relationship("Question", back_populates="bank", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, default=generate_uuid)
    bank_id = Column(String, ForeignKey("question_banks.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    question_type = Column(String, default="mcq") # mcq, multi_select, true_false, short_answer, numerical, matching, ordering, long_answer
    question_text = Column(Text, nullable=False)
    options = Column(Text, default="[]") # JSON list of choices
    correct_answer = Column(Text, default="") # JSON: string, list of indices, number, etc.
    numerical_tolerance = Column(Float, default=0.0)
    numerical_unit = Column(String, nullable=True)
    matching_pairs = Column(Text, default="[]") # JSON list of {left: "", right: ""}
    order_items = Column(Text, default="[]") # JSON list of strings in correct order
    explanation = Column(Text, default="")
    source_ref = Column(String, nullable=True)
    difficulty = Column(String, default="medium") # easy, medium, hard
    tags = Column(Text, default="[]")
    personal_notes = Column(Text, default="")
    is_draft = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    bank = relationship("QuestionBank", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(String, primary_key=True, default=generate_uuid)
    bank_id = Column(String, ForeignKey("question_banks.id", ondelete="SET NULL"), nullable=True)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    quiz_title = Column(String, nullable=False)
    mode = Column(String, default="practice") # practice, exam
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    time_spent_secs = Column(Integer, default=0)
    questions_snapshot = Column(Text, default="[]") # JSON snapshot of questions at attempt time
    responses = Column(Text, default="{}") # JSON user answers + grading results
    is_demo = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

class ActiveLearningItem(Base):
    __tablename__ = "active_learning_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    item_type = Column(String, nullable=False) # teach_back, formula, concept_comparison, glossary, mistake
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, default="{}") # JSON depending on item_type
    reflection_notes = Column(Text, default="")
    mastery_level = Column(String, default="learning") # learning, mastered, needs_review
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    goal = Column(String, default="")
    session_type = Column(String, default="focus") # focus, pomodoro, manual
    planned_duration_mins = Column(Integer, default=25)
    actual_duration_secs = Column(Integer, default=0)
    break_duration_secs = Column(Integer, default=0)
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)
    status = Column(String, default="completed") # running, paused, completed, abandoned
    reflection_completed = Column(Text, default="")
    reflection_unclear = Column(Text, default="")
    reflection_confidence = Column(String, default="medium") # low, medium, high
    reflection_next = Column(Text, default="")
    session_notes = Column(Text, default="")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class ActivityEvent(Base):
    __tablename__ = "activity_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    event_type = Column(String, nullable=False) # platform_visit, course_visit, topic_visit, resource_open, note_edit, task_complete, flashcard_review, quiz_attempt, heartbeat_active
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    course_id = Column(String, nullable=True)
    duration_secs = Column(Integer, default=0)
    session_visit_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    task_type = Column(String, default="study") # study, assignment, exam_prep, revision
    due_date = Column(DateTime, nullable=True)
    priority = Column(String, default="medium") # low, medium, high
    status = Column(String, default="todo") # todo, in_progress, completed
    estimated_minutes = Column(Integer, default=30)
    actual_minutes = Column(Integer, default=0)
    subtasks = Column(Text, default="[]") # JSON list of {id, title, completed}
    
    # Assignment specific fields
    instructions = Column(Text, default="")
    submission_link = Column(String, nullable=True)
    submission_text = Column(Text, default="")
    marks = Column(String, nullable=True)
    feedback = Column(Text, default="")
    reflection = Column(Text, default="")
    
    completed_at = Column(DateTime, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", back_populates="tasks")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    event_type = Column(String, default="session") # session, revision, flashcard, assignment, exam, quiz, reading, goal
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_all_day = Column(Boolean, default=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String, nullable=True) # daily, weekly, etc.
    reminder_mins_before = Column(Integer, default=15)
    is_completed = Column(Boolean, default=False)
    related_task_id = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class TopicRevision(Base):
    __tablename__ = "topic_revisions"
    id = Column(String, primary_key=True, default=generate_uuid)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime, nullable=True)
    recall_rating = Column(String, nullable=True) # forgot, difficult, good, easy
    interval_days = Column(Integer, default=1)
    revision_number = Column(Integer, default=1)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

class Goal(Base):
    __tablename__ = "goals"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    goal_type = Column(String, default="hours") # hours, course_completion, topic_completion, revision, flashcards, quizzes, reading, streak, custom
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String, default="hours")
    period = Column(String, default="weekly") # daily, weekly, monthly, one_off
    deadline = Column(DateTime, nullable=True)
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    is_completed = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(String, primary_key=True, default=generate_uuid)
    entry_date = Column(String, nullable=False) # YYYY-MM-DD
    entry_type = Column(String, default="daily") # daily, weekly
    course_id = Column(String, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    learned_text = Column(Text, default="")
    difficult_text = Column(Text, default="")
    unclear_text = Column(Text, default="")
    helped_text = Column(Text, default="")
    next_text = Column(Text, default="")
    mood_rating = Column(Integer, default=3) # 1 to 5
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=generate_uuid)
    notification_type = Column(String, default="revision") # deadline, session, revision, flashcard, task_overdue, reflection, streak
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    link_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    scheduled_for = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)
