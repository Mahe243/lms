from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

# User
class UserPreferences(BaseModel):
    dark_mode: bool = False
    ai_provider: str = "gemini"
    ai_model: str = "gemini-1.5-flash"
    ai_api_key: str = ""
    preferred_explanation_language: str = "English"
    preferred_depth: str = "balanced" # concise, balanced, detailed
    streak_min_minutes: int = 15
    idle_timeout_minutes: int = 30
    daily_card_limit: int = 20
    daily_review_limit: int = 50
    timezone: str = "UTC"
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "07:00"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str]
    preferences: Dict[str, Any]
    created_at: datetime
    class Config:
        from_attributes = True

# Courses & Topics
class SubtopicCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    order_index: Optional[int] = 0

class SubtopicOut(BaseModel):
    id: str
    topic_id: str
    title: str
    description: str
    order_index: int
    is_completed: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    module_id: str
    title: str
    description: Optional[str] = ""
    learning_objectives: Optional[List[str]] = []
    estimated_minutes: Optional[int] = 30
    status: Optional[str] = "not_started"
    understanding_level: Optional[str] = "unfamiliar"
    is_optional: Optional[bool] = False
    order_index: Optional[int] = 0
    personal_questions: Optional[List[str]] = []

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    estimated_minutes: Optional[int] = None
    status: Optional[str] = None
    understanding_level: Optional[str] = None
    is_optional: Optional[bool] = None
    order_index: Optional[int] = None
    personal_questions: Optional[List[str]] = None
    next_revision_at: Optional[datetime] = None
    last_studied_at: Optional[datetime] = None

class TopicOut(BaseModel):
    id: str
    module_id: str
    course_id: str
    title: str
    description: str
    learning_objectives: List[str]
    estimated_minutes: int
    status: str
    understanding_level: str
    is_optional: bool
    order_index: int
    personal_questions: List[str]
    last_studied_at: Optional[datetime]
    next_revision_at: Optional[datetime]
    revision_interval_days: int
    revision_count: int
    subtopics: List[SubtopicOut] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    order_index: Optional[int] = 0

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class ModuleOut(BaseModel):
    id: str
    course_id: str
    title: str
    description: str
    order_index: int
    topics: List[TopicOut] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    instructor: Optional[str] = None
    start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    exam_date: Optional[str] = None
    priority: Optional[str] = "medium"
    cover_color: Optional[str] = "#4f46e5"
    tags: Optional[List[str]] = []
    syllabus: Optional[str] = ""
    learning_goals: Optional[List[str]] = []
    status: Optional[str] = "active"

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    instructor: Optional[str] = None
    start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    exam_date: Optional[str] = None
    priority: Optional[str] = None
    cover_color: Optional[str] = None
    tags: Optional[List[str]] = None
    syllabus: Optional[str] = None
    learning_goals: Optional[List[str]] = None
    status: Optional[str] = None

class CourseProgress(BaseModel):
    completed_topics: int
    total_topics: int
    completion_percentage: float
    optional_topics_count: int
    completed_optional_topics: int
    resource_count: int
    completed_resources: int
    resource_completion_percentage: float
    quiz_average_percentage: float
    revision_readiness_score: float

class CourseOut(BaseModel):
    id: str
    name: str
    description: str
    category: str
    instructor: Optional[str]
    start_date: Optional[str]
    target_completion_date: Optional[str]
    exam_date: Optional[str]
    priority: str
    cover_color: str
    tags: List[str]
    syllabus: str
    learning_goals: List[str]
    status: str
    modules: List[ModuleOut] = []
    progress: Optional[CourseProgress] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Notes
class NoteCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    content: Optional[str] = ""
    summary: Optional[str] = ""
    tags: Optional[List[str]] = []
    is_pinned: Optional[bool] = False
    is_favorite: Optional[bool] = False
    needs_revision: Optional[bool] = False
    template_type: Optional[str] = "general"

class NoteUpdate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    needs_revision: Optional[bool] = None
    template_type: Optional[str] = None

class NoteVersionOut(BaseModel):
    id: str
    note_id: str
    version_number: int
    title: str
    content: str
    summary: str
    created_at: datetime
    class Config:
        from_attributes = True

class NoteOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    title: str
    content: str
    summary: str
    tags: List[str]
    is_pinned: bool
    is_favorite: bool
    needs_revision: bool
    template_type: str
    is_deleted: bool
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    backlinks: List[str] = []
    is_demo: bool = False
    class Config:
        from_attributes = True

# Resources
class ResourceCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    type: str # video, pdf, article, doc, presentation, image, audio, book, external_course, practice
    url: Optional[str] = None
    description: Optional[str] = ""
    author: Optional[str] = None
    tags: Optional[List[str]] = []
    estimated_duration_mins: Optional[int] = 15
    status: Optional[str] = "saved"
    personal_rating: Optional[int] = 0
    is_favorite: Optional[bool] = False
    metadata_info: Optional[Dict[str, Any]] = {}

class ResourceUpdate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_duration_mins: Optional[int] = None
    status: Optional[str] = None
    personal_rating: Optional[int] = None
    is_favorite: Optional[bool] = None
    resume_position_secs: Optional[float] = None
    metadata_info: Optional[Dict[str, Any]] = None

class ResourceOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    title: str
    type: str
    url: Optional[str]
    file_path: Optional[str]
    description: str
    author: Optional[str]
    tags: List[str]
    estimated_duration_mins: int
    status: str
    personal_rating: int
    is_favorite: bool
    last_opened_at: Optional[datetime]
    open_count: int
    is_indexed: bool
    indexing_status: str
    resume_position_secs: float
    metadata_info: Dict[str, Any]
    is_deleted: bool
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Comments & Doubts
class CommentCreate(BaseModel):
    target_type: str # course, topic, note, resource, video, question, task
    target_id: str
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    text: str
    comment_type: Optional[str] = "observation" # observation, doubt, reminder, insight
    priority: Optional[str] = "medium"
    timestamp_secs: Optional[float] = None
    page_number: Optional[int] = None

class CommentUpdate(BaseModel):
    text: Optional[str] = None
    comment_type: Optional[str] = None
    is_resolved: Optional[bool] = None
    resolution_notes: Optional[str] = None
    is_pinned: Optional[bool] = None
    priority: Optional[str] = None
    timestamp_secs: Optional[float] = None
    page_number: Optional[int] = None

class CommentOut(BaseModel):
    id: str
    target_type: str
    target_id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    text: str
    comment_type: str
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolution_notes: str
    is_pinned: bool
    priority: str
    timestamp_secs: Optional[float]
    page_number: Optional[int]
    related_ai_conversation_id: Optional[str]
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# AI Tutor
class AIChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    resource_id: Optional[str] = None
    doubt_id: Optional[str] = None
    selected_passage: Optional[str] = None
    context_mode: Optional[str] = "my_materials_plus_general" # my_materials, my_materials_plus_general, passage_only, general
    prompt_type: Optional[str] = "standard" # explain_simply, example, step_by_step, hint, quiz_me, shorter, detailed, teach_back_eval

class AIMessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    source_citations: List[Dict[str, Any]]
    helpfulness_rating: int
    prompt_type: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class AIConversationOut(BaseModel):
    id: str
    title: str
    course_id: Optional[str]
    topic_id: Optional[str]
    resource_id: Optional[str]
    doubt_id: Optional[str]
    context_mode: str
    selected_passage: Optional[str]
    source_references: List[str]
    is_archived: bool
    messages: List[AIMessageOut] = []
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Flashcards
class FlashcardCreate(BaseModel):
    deck_id: str
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    card_type: Optional[str] = "basic" # basic, reversed, cloze, image
    front: str
    back: str
    cloze_text: Optional[str] = None
    explanation: Optional[str] = ""
    source_ref: Optional[str] = None
    tags: Optional[List[str]] = []
    image_url: Optional[str] = None
    is_draft: Optional[bool] = False

class FlashcardUpdate(BaseModel):
    front: Optional[str] = None
    back: Optional[str] = None
    cloze_text: Optional[str] = None
    explanation: Optional[str] = None
    source_ref: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_suspended: Optional[bool] = None
    is_draft: Optional[bool] = None
    draft_reviewed: Optional[bool] = None

class FlashcardReviewSubmit(BaseModel):
    card_id: str
    rating: str # again, hard, good, easy
    review_time_ms: Optional[int] = 0

class FlashcardOut(BaseModel):
    id: str
    deck_id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    card_type: str
    front: str
    back: str
    cloze_text: Optional[str]
    explanation: str
    source_ref: Optional[str]
    tags: List[str]
    image_url: Optional[str]
    is_suspended: bool
    is_draft: bool
    draft_reviewed: bool
    reps: int
    lapses: int
    stability: float
    state: str
    interval_days: int
    last_review_at: Optional[datetime]
    next_review_at: Optional[datetime]
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class FlashcardDeckCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []

class FlashcardDeckOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    name: str
    description: str
    tags: List[str]
    card_count: int = 0
    due_count: int = 0
    new_count: int = 0
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Practice & Quizzes
class QuestionCreate(BaseModel):
    bank_id: str
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    question_type: Optional[str] = "mcq" # mcq, multi_select, true_false, short_answer, numerical, matching, ordering, long_answer
    question_text: str
    options: Optional[List[str]] = []
    correct_answer: Any # string or list or number
    numerical_tolerance: Optional[float] = 0.0
    numerical_unit: Optional[str] = None
    matching_pairs: Optional[List[Dict[str, str]]] = []
    order_items: Optional[List[str]] = []
    explanation: Optional[str] = ""
    source_ref: Optional[str] = None
    difficulty: Optional[str] = "medium"
    tags: Optional[List[str]] = []
    personal_notes: Optional[str] = ""
    is_draft: Optional[bool] = False

class QuestionOut(BaseModel):
    id: str
    bank_id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    question_type: str
    question_text: str
    options: List[str]
    correct_answer: Any
    numerical_tolerance: float
    numerical_unit: Optional[str]
    matching_pairs: List[Dict[str, str]]
    order_items: List[str]
    explanation: str
    source_ref: Optional[str]
    difficulty: str
    tags: List[str]
    personal_notes: str
    is_draft: bool
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class QuestionBankCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    name: str
    description: Optional[str] = ""

class QuestionBankOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    name: str
    description: str
    question_count: int = 0
    is_demo: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

class QuizSubmitRequest(BaseModel):
    bank_id: Optional[str] = None
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    quiz_title: str
    mode: str = "practice" # practice or exam
    time_spent_secs: int = 0
    responses: Dict[str, Any] # question_id -> user answer

class QuizAttemptOut(BaseModel):
    id: str
    bank_id: Optional[str]
    course_id: Optional[str]
    topic_id: Optional[str]
    quiz_title: str
    mode: str
    score: float
    max_score: float
    percentage: float
    time_spent_secs: int
    questions_snapshot: List[Dict[str, Any]]
    responses: Dict[str, Any]
    completed_at: datetime
    is_demo: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

# Active Learning Items
class ActiveLearningCreate(BaseModel):
    item_type: str # teach_back, formula, concept_comparison, glossary, mistake
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    content: Dict[str, Any]
    reflection_notes: Optional[str] = ""
    mastery_level: Optional[str] = "learning"

class ActiveLearningUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    reflection_notes: Optional[str] = None
    mastery_level: Optional[str] = None

class ActiveLearningOut(BaseModel):
    id: str
    item_type: str
    course_id: Optional[str]
    topic_id: Optional[str]
    title: str
    content: Dict[str, Any]
    reflection_notes: str
    mastery_level: str
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Study Sessions
class StudySessionStart(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    goal: Optional[str] = ""
    session_type: Optional[str] = "focus"
    planned_duration_mins: Optional[int] = 25

class StudySessionUpdate(BaseModel):
    actual_duration_secs: Optional[int] = None
    break_duration_secs: Optional[int] = None
    status: Optional[str] = None
    reflection_completed: Optional[str] = None
    reflection_unclear: Optional[str] = None
    reflection_confidence: Optional[str] = None
    reflection_next: Optional[str] = None
    session_notes: Optional[str] = None

class StudySessionOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    goal: str
    session_type: str
    planned_duration_mins: int
    actual_duration_secs: int
    break_duration_secs: int
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    reflection_completed: str
    reflection_unclear: str
    reflection_confidence: str
    reflection_next: str
    session_notes: str
    is_demo: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

# Tasks & Assignments
class TaskCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    task_type: Optional[str] = "study" # study, assignment, exam_prep, revision
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "todo"
    estimated_minutes: Optional[int] = 30
    subtasks: Optional[List[Dict[str, Any]]] = []
    instructions: Optional[str] = ""
    submission_link: Optional[str] = None
    submission_text: Optional[str] = ""

class TaskUpdate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    subtasks: Optional[List[Dict[str, Any]]] = None
    instructions: Optional[str] = None
    submission_link: Optional[str] = None
    submission_text: Optional[str] = None
    marks: Optional[str] = None
    feedback: Optional[str] = None
    reflection: Optional[str] = None
    completed_at: Optional[datetime] = None

class TaskOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    title: str
    description: str
    task_type: str
    due_date: Optional[datetime]
    priority: str
    status: str
    estimated_minutes: int
    actual_minutes: int
    subtasks: List[Dict[str, Any]]
    instructions: str
    submission_link: Optional[str]
    submission_text: str
    marks: Optional[str]
    feedback: str
    reflection: str
    completed_at: Optional[datetime]
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Calendar & Planner
class CalendarEventCreate(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    title: str
    event_type: Optional[str] = "session"
    start_time: datetime
    end_time: datetime
    is_all_day: Optional[bool] = False
    is_recurring: Optional[bool] = False
    recurrence_rule: Optional[str] = None
    reminder_mins_before: Optional[int] = 15
    related_task_id: Optional[str] = None

class CalendarEventOut(BaseModel):
    id: str
    course_id: Optional[str]
    topic_id: Optional[str]
    title: str
    event_type: str
    start_time: datetime
    end_time: datetime
    is_all_day: bool
    is_recurring: bool
    recurrence_rule: Optional[str]
    reminder_mins_before: int
    is_completed: bool
    related_task_id: Optional[str]
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Revision
class TopicRevisionSubmit(BaseModel):
    topic_id: str
    recall_rating: str # forgot, difficult, good, easy
    notes: Optional[str] = ""

class TopicRevisionOut(BaseModel):
    id: str
    topic_id: str
    course_id: str
    topic_title: str
    course_name: str
    scheduled_date: datetime
    completed_date: Optional[datetime]
    recall_rating: Optional[str]
    interval_days: int
    revision_number: int
    notes: str
    created_at: datetime

# Goals
class GoalCreate(BaseModel):
    title: str
    goal_type: Optional[str] = "hours"
    target_value: float
    current_value: Optional[float] = 0.0
    unit: Optional[str] = "hours"
    period: Optional[str] = "weekly"
    deadline: Optional[datetime] = None
    course_id: Optional[str] = None
    topic_id: Optional[str] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    period: Optional[str] = None
    deadline: Optional[datetime] = None
    is_completed: Optional[bool] = None

class GoalOut(BaseModel):
    id: str
    title: str
    goal_type: str
    target_value: float
    current_value: float
    unit: str
    period: str
    deadline: Optional[datetime]
    course_id: Optional[str]
    topic_id: Optional[str]
    is_completed: bool
    progress_percentage: float
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Journal
class JournalEntryCreate(BaseModel):
    entry_date: str
    entry_type: Optional[str] = "daily"
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    learned_text: Optional[str] = ""
    difficult_text: Optional[str] = ""
    unclear_text: Optional[str] = ""
    helped_text: Optional[str] = ""
    next_text: Optional[str] = ""
    mood_rating: Optional[int] = 3

class JournalEntryOut(BaseModel):
    id: str
    entry_date: str
    entry_type: str
    course_id: Optional[str]
    topic_id: Optional[str]
    learned_text: str
    difficult_text: str
    unclear_text: str
    helped_text: str
    next_text: str
    mood_rating: int
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Notifications
class NotificationOut(BaseModel):
    id: str
    notification_type: str
    title: str
    message: str
    link_url: Optional[str]
    is_read: bool
    scheduled_for: datetime
    created_at: datetime
    class Config:
        from_attributes = True
