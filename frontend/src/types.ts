export interface UserPreferences {
  dark_mode: boolean;
  ai_provider: string;
  ai_model: string;
  ai_api_key: string;
  preferred_explanation_language: string;
  preferred_depth: string;
  streak_min_minutes: number;
  idle_timeout_minutes: number;
  daily_card_limit: number;
  daily_review_limit: number;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferences: UserPreferences;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: boolean;
}

export interface Topic {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  estimated_minutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
  understanding_level: 'unfamiliar' | 'basic' | 'comfortable' | 'confident';
  is_optional: boolean;
  order_index: number;
  personal_questions: string[];
  last_studied_at?: string;
  next_revision_at?: string;
  revision_interval_days: number;
  revision_count: number;
  subtopics: Subtopic[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  topics: Topic[];
}

export interface CourseProgress {
  completed_topics: number;
  total_topics: number;
  completion_percentage: number;
  optional_topics_count: number;
  completed_optional_topics: number;
  resource_count: number;
  completed_resources: number;
  resource_completion_percentage: number;
  quiz_average_percentage: number;
  revision_readiness_score: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  instructor?: string;
  start_date?: string;
  target_completion_date?: string;
  exam_date?: string;
  priority: 'low' | 'medium' | 'high';
  cover_color: string;
  tags: string[];
  syllabus: string;
  learning_goals: string[];
  status: 'planned' | 'active' | 'paused' | 'completed' | 'archived';
  modules: Module[];
  progress?: CourseProgress;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  needs_revision: boolean;
  template_type: string;
  is_deleted: boolean;
  deleted_at?: string;
  backlinks?: string[];
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

export interface Resource {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  type: 'video' | 'pdf' | 'article' | 'doc' | 'presentation' | 'image' | 'audio' | 'book' | 'external_course' | 'practice';
  url?: string;
  file_path?: string;
  description: string;
  author?: string;
  tags: string[];
  estimated_duration_mins: number;
  status: 'saved' | 'in_progress' | 'completed' | 'revisit';
  personal_rating: number;
  is_favorite: boolean;
  last_opened_at?: string;
  open_count: number;
  is_indexed: boolean;
  indexing_status: 'unprocessed' | 'indexing' | 'indexed' | 'ocr_required' | 'unsupported' | 'failed';
  resume_position_secs: number;
  extracted_text?: string;
  metadata_info?: Record<string, any>;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  target_type: string;
  target_id: string;
  course_id?: string;
  topic_id?: string;
  text: string;
  comment_type: 'observation' | 'doubt' | 'reminder' | 'insight';
  is_resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  is_pinned: boolean;
  priority: 'low' | 'medium' | 'high';
  timestamp_secs?: number;
  page_number?: number;
  related_ai_conversation_id?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AICitation {
  source_id: string;
  title: string;
  type: string;
  page_number?: number;
  timestamp_secs?: number;
  quote: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source_citations: AICitation[];
  helpfulness_rating: number;
  prompt_type?: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  title: string;
  course_id?: string;
  topic_id?: string;
  resource_id?: string;
  doubt_id?: string;
  context_mode: string;
  selected_passage?: string;
  source_references: string[];
  is_archived: boolean;
  messages: AIMessage[];
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashcardDeck {
  id: string;
  course_id?: string;
  topic_id?: string;
  name: string;
  description: string;
  tags: string[];
  card_count: number;
  due_count: number;
  new_count: number;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  course_id?: string;
  topic_id?: string;
  card_type: 'basic' | 'reversed' | 'cloze' | 'image';
  front: string;
  back: string;
  cloze_text?: string;
  explanation: string;
  source_ref?: string;
  tags: string[];
  image_url?: string;
  is_suspended: boolean;
  is_draft: boolean;
  draft_reviewed: boolean;
  reps: number;
  lapses: number;
  stability: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  interval_days: number;
  last_review_at?: string;
  next_review_at?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  bank_id: string;
  course_id?: string;
  topic_id?: string;
  question_type: 'mcq' | 'multi_select' | 'true_false' | 'short_answer' | 'numerical' | 'matching' | 'ordering' | 'long_answer';
  question_text: string;
  options: string[];
  correct_answer: any;
  numerical_tolerance: number;
  numerical_unit?: string;
  matching_pairs: { left: string; right: string }[];
  order_items: string[];
  explanation: string;
  source_ref?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  personal_notes: string;
  is_draft: boolean;
  is_demo?: boolean;
}

export interface QuestionBank {
  id: string;
  course_id?: string;
  topic_id?: string;
  name: string;
  description: string;
  question_count: number;
  is_demo?: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  bank_id?: string;
  course_id?: string;
  topic_id?: string;
  quiz_title: string;
  mode: 'practice' | 'exam';
  score: number;
  max_score: number;
  percentage: number;
  time_spent_secs: number;
  questions_snapshot: any[];
  responses: Record<string, any>;
  completed_at: string;
  created_at: string;
}

export interface ActiveLearningItem {
  id: string;
  item_type: 'teach_back' | 'formula' | 'concept_comparison' | 'glossary' | 'mistake';
  course_id?: string;
  topic_id?: string;
  title: string;
  content: any;
  reflection_notes: string;
  mastery_level: 'learning' | 'mastered' | 'needs_review';
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  course_id?: string;
  topic_id?: string;
  goal: string;
  session_type: 'focus' | 'pomodoro' | 'manual';
  planned_duration_mins: number;
  actual_duration_secs: number;
  break_duration_secs: number;
  start_time: string;
  end_time?: string;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
  reflection_completed: string;
  reflection_unclear: string;
  reflection_confidence: string;
  reflection_next: string;
  session_notes: string;
  is_demo?: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  description: string;
  task_type: 'study' | 'assignment' | 'exam_prep' | 'revision';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  estimated_minutes: number;
  actual_minutes: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  instructions: string;
  submission_link?: string;
  submission_text?: string;
  marks?: string;
  feedback?: string;
  reflection?: string;
  completed_at?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  event_type: 'session' | 'revision' | 'flashcard' | 'assignment' | 'exam' | 'quiz' | 'reading' | 'goal';
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: string;
  reminder_mins_before: number;
  is_completed: boolean;
  related_task_id?: string;
  is_demo?: boolean;
}

export interface TopicRevisionQueueItem {
  id: string;
  topic_id: string;
  course_id: string;
  topic_title: string;
  course_name: string;
  scheduled_date: string;
  completed_date?: string;
  recall_rating?: string;
  interval_days: number;
  revision_number: number;
  notes: string;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  period: string;
  deadline?: string;
  course_id?: string;
  topic_id?: string;
  is_completed: boolean;
  progress_percentage: number;
  is_demo?: boolean;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  entry_type: string;
  course_id?: string;
  topic_id?: string;
  learned_text: string;
  difficult_text: string;
  unclear_text: string;
  helped_text: string;
  next_text: string;
  mood_rating: number;
  is_demo?: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  scheduled_for: string;
  created_at: string;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  snippet: string;
  url: string;
}

export interface AnalyticsData {
  study_time_today_minutes: number;
  study_time_week_hours: number;
  total_visits: number;
  today_visits: number;
  streak_days: number;
  total_active_days: number;
  heatmap: { date: string; minutes: number; count: number }[];
  course_times: { course_id: string; course_name: string; color: string; minutes: number }[];
  quiz_trend: { quiz_title: string; percentage: number; date: string }[];
}
