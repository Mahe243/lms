import {
  User, Course, Note, Resource, Comment, AIConversation,
  FlashcardDeck, Flashcard, Question, QuestionBank, QuizAttempt,
  ActiveLearningItem, StudySession, Task, CalendarEvent,
  TopicRevisionQueueItem, Goal, JournalEntry, Notification,
  SearchResult, AnalyticsData
} from './types';

const BASE_URL = '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const err = await res.json();
      if (err.detail) errMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // User & Settings
  getUser: () => request<User>('/api/user/me'),
  updateUser: (data: Partial<User>) => request<User>('/api/user/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Courses
  getCourses: () => request<Course[]>('/api/courses'),
  getCourse: (id: string) => request<Course>(`/api/courses/${id}`),
  createCourse: (data: Partial<Course>) => request<Course>('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: Partial<Course>) => request<Course>(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: string) => request<{ message: string }>(`/api/courses/${id}`, { method: 'DELETE' }),

  createModule: (courseId: string, title: string, description?: string) =>
    request<any>(`/api/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify({ title, description }) }),
  updateModule: (moduleId: string, data: any) =>
    request<any>(`/api/courses/modules/${moduleId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteModule: (moduleId: string) =>
    request<any>(`/api/courses/modules/${moduleId}`, { method: 'DELETE' }),

  createTopic: (moduleId: string, data: any) =>
    request<any>(`/api/courses/modules/${moduleId}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (topicId: string, data: any) =>
    request<any>(`/api/courses/topics/${topicId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTopic: (topicId: string) =>
    request<any>(`/api/courses/topics/${topicId}`, { method: 'DELETE' }),

  createSubtopic: (topicId: string, title: string) =>
    request<any>(`/api/courses/topics/${topicId}/subtopics`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateSubtopic: (subtopicId: string, is_completed: boolean) =>
    request<any>(`/api/courses/subtopics/${subtopicId}?is_completed=${is_completed}`, { method: 'PUT' }),

  // Notes
  getNotes: (params?: { course_id?: string; topic_id?: string; is_pinned?: boolean; in_trash?: boolean }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Note[]>(`/api/notes?${q}`);
  },
  getNote: (id: string) => request<Note>(`/api/notes/${id}`),
  getNoteTemplates: () => request<any[]>('/api/notes/templates'),
  createNote: (data: Partial<Note>) => request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: Partial<Note>) => request<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string, permanent: boolean = false) =>
    request<{ message: string }>(`/api/notes/${id}?permanent=${permanent}`, { method: 'DELETE' }),
  restoreNote: (id: string) => request<Note>(`/api/notes/${id}/restore`, { method: 'POST' }),
  getNoteVersions: (id: string) => request<any[]>(`/api/notes/${id}/versions`),

  // Resources
  getResources: (params?: { course_id?: string; topic_id?: string; res_type?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Resource[]>(`/api/resources?${q}`);
  },
  getResource: (id: string) => request<Resource>(`/api/resources/${id}`),
  checkDuplicateUrl: (url: string) =>
    request<{ exists: boolean; resource?: Resource }>(`/api/resources/check-duplicate-url?url=${encodeURIComponent(url)}`, { method: 'POST' }),
  createResource: (data: Partial<Resource>) => request<Resource>('/api/resources', { method: 'POST', body: JSON.stringify(data) }),
  updateResource: (id: string, data: Partial<Resource>) => request<Resource>(`/api/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResource: (id: string) => request<{ message: string }>(`/api/resources/${id}`, { method: 'DELETE' }),
  saveTranscript: (id: string, text: string) => {
    const form = new FormData();
    form.append('transcript_text', text);
    return fetch(`/api/resources/${id}/transcript`, { method: 'POST', body: form }).then(r => r.json());
  },

  // Comments & Doubts
  getComments: (params?: {
    target_type?: string;
    target_id?: string;
    course_id?: string;
    topic_id?: string;
    comment_type?: string;
    is_resolved?: boolean;
    doubts_only?: boolean;
  }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Comment[]>(`/api/comments?${q}`);
  },
  createComment: (data: Partial<Comment>) => request<Comment>('/api/comments', { method: 'POST', body: JSON.stringify(data) }),
  updateComment: (id: string, data: Partial<Comment>) => request<Comment>(`/api/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteComment: (id: string) => request<{ message: string }>(`/api/comments/${id}`, { method: 'DELETE' }),

  // AI Tutor
  chatWithTutor: (data: {
    conversation_id?: string;
    message: string;
    course_id?: string;
    topic_id?: string;
    resource_id?: string;
    doubt_id?: string;
    selected_passage?: string;
    context_mode?: string;
    prompt_type?: string;
  }) => request<any>('/api/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
  getAIConversations: (courseId?: string) => request<AIConversation[]>(`/api/ai/conversations${courseId ? `?course_id=${courseId}` : ''}`),
  rateAIMessage: (messageId: string, rating: number) =>
    request<any>(`/api/ai/rate-message?message_id=${messageId}&rating=${rating}`, { method: 'POST' }),
  generateDrafts: (text: string, draftType: 'flashcards' | 'quiz') =>
    request<any>(`/api/ai/generate-drafts?draft_type=${draftType}`, { method: 'POST', body: text }),

  // Flashcards
  getDecks: (courseId?: string) => request<FlashcardDeck[]>(`/api/flashcards/decks${courseId ? `?course_id=${courseId}` : ''}`),
  createDeck: (data: { name: string; description?: string; course_id?: string }) =>
    request<FlashcardDeck>('/api/flashcards/decks', { method: 'POST', body: JSON.stringify(data) }),
  deleteDeck: (id: string) => request<any>(`/api/flashcards/decks/${id}`, { method: 'DELETE' }),
  getCards: (params?: { deck_id?: string; course_id?: string; mode?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Flashcard[]>(`/api/flashcards?${q}`);
  },
  createCard: (data: Partial<Flashcard>) => request<Flashcard>('/api/flashcards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: Partial<Flashcard>) => request<Flashcard>(`/api/flashcards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (id: string) => request<any>(`/api/flashcards/${id}`, { method: 'DELETE' }),
  submitReview: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy', reviewTimeMs?: number) =>
    request<any>('/api/flashcards/review', { method: 'POST', body: JSON.stringify({ card_id: cardId, rating, review_time_ms: reviewTimeMs }) }),
  undoReview: (cardId: string) => request<any>(`/api/flashcards/undo-review/${cardId}`, { method: 'POST' }),

  // Practice & Quizzes
  getQuestionBanks: (courseId?: string) => request<QuestionBank[]>(`/api/quizzes/banks${courseId ? `?course_id=${courseId}` : ''}`),
  createQuestionBank: (data: { name: string; description?: string; course_id?: string }) =>
    request<QuestionBank>('/api/quizzes/banks', { method: 'POST', body: JSON.stringify(data) }),
  getQuestions: (params?: { bank_id?: string; course_id?: string; drafts_only?: boolean }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Question[]>(`/api/quizzes/questions?${q}`);
  },
  createQuestion: (data: Partial<Question>) => request<Question>('/api/quizzes/questions', { method: 'POST', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => request<any>(`/api/quizzes/questions/${id}`, { method: 'DELETE' }),
  submitQuiz: (data: {
    bank_id?: string;
    course_id?: string;
    topic_id?: string;
    quiz_title: string;
    mode: 'practice' | 'exam';
    time_spent_secs: number;
    responses: Record<string, any>;
  }) => request<QuizAttempt>('/api/quizzes/submit', { method: 'POST', body: JSON.stringify(data) }),
  getQuizAttempts: (courseId?: string) => request<QuizAttempt[]>(`/api/quizzes/attempts${courseId ? `?course_id=${courseId}` : ''}`),
  getMistakeLog: (courseId?: string) => request<any[]>(`/api/quizzes/mistake-log${courseId ? `?course_id=${courseId}` : ''}`),

  // Active Learning Items
  getActiveLearningItems: (itemType?: string, courseId?: string) => {
    const q = new URLSearchParams({ ...(itemType ? { item_type: itemType } : {}), ...(courseId ? { course_id: courseId } : {}) }).toString();
    return request<ActiveLearningItem[]>(`/api/active-learning?${q}`);
  },
  createActiveLearningItem: (data: Partial<ActiveLearningItem>) =>
    request<ActiveLearningItem>('/api/active-learning', { method: 'POST', body: JSON.stringify(data) }),
  updateActiveLearningItem: (id: string, data: Partial<ActiveLearningItem>) =>
    request<ActiveLearningItem>(`/api/active-learning/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActiveLearningItem: (id: string) => request<any>(`/api/active-learning/${id}`, { method: 'DELETE' }),

  // Study Sessions
  getActiveSession: () => request<StudySession | null>('/api/study-sessions/active'),
  startSession: (data: { course_id?: string; topic_id?: string; goal?: string; session_type?: string; planned_duration_mins?: number }) =>
    request<StudySession>('/api/study-sessions/start', { method: 'POST', body: JSON.stringify(data) }),
  updateSession: (id: string, data: Partial<StudySession>) =>
    request<StudySession>(`/api/study-sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getSessionHistory: () => request<StudySession[]>('/api/study-sessions/history'),

  // Activity Tracking
  recordPlatformVisit: (sessionVisitId: string) =>
    request<any>('/api/activity/platform-visit', { method: 'POST', body: JSON.stringify({ session_visit_id: sessionVisitId }) }),
  recordDeliberateVisit: (eventType: string, targetType: string, targetId: string, courseId?: string) =>
    request<any>('/api/activity/deliberate-visit', { method: 'POST', body: JSON.stringify({ event_type: eventType, target_type: targetType, target_id: targetId, course_id: courseId }) }),
  recordHeartbeat: (durationSecs: number, courseId?: string, sessionVisitId?: string) =>
    request<any>('/api/activity/heartbeat', { method: 'POST', body: JSON.stringify({ duration_secs: durationSecs, course_id: courseId, session_visit_id: sessionVisitId }) }),
  getAnalytics: () => request<AnalyticsData>('/api/activity/analytics'),

  // Tasks & Assignments
  getTasks: (params?: { course_id?: string; status?: string; task_type?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<Task[]>(`/api/tasks?${q}`);
  },
  createTask: (data: Partial<Task>) => request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) => request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<any>(`/api/tasks/${id}`, { method: 'DELETE' }),

  // Planner
  getCalendarEvents: () => request<CalendarEvent[]>('/api/planner/events'),
  createCalendarEvent: (data: Partial<CalendarEvent>) => request<CalendarEvent>('/api/planner/events', { method: 'POST', body: JSON.stringify(data) }),
  deleteCalendarEvent: (id: string) => request<any>(`/api/planner/events/${id}`, { method: 'DELETE' }),

  // Revision
  getRevisionQueue: (dueOnly: boolean = false) => request<TopicRevisionQueueItem[]>(`/api/revision/queue?due_only=${dueOnly}`),
  submitRevision: (topicId: string, rating: 'forgot' | 'difficult' | 'good' | 'easy', notes?: string) =>
    request<any>('/api/revision/submit', { method: 'POST', body: JSON.stringify({ topic_id: topicId, recall_rating: rating, notes }) }),

  // Goals
  getGoals: () => request<Goal[]>('/api/goals'),
  createGoal: (data: Partial<Goal>) => request<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: Partial<Goal>) => request<Goal>(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request<any>(`/api/goals/${id}`, { method: 'DELETE' }),

  // Journal
  getJournalEntries: () => request<JournalEntry[]>('/api/journal'),
  createJournalEntry: (data: Partial<JournalEntry>) => request<JournalEntry>('/api/journal', { method: 'POST', body: JSON.stringify(data) }),
  deleteJournalEntry: (id: string) => request<any>(`/api/journal/${id}`, { method: 'DELETE' }),

  // Search & Quick Capture
  search: (q: string, filterType?: string) =>
    request<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}${filterType ? `&filter_type=${filterType}` : ''}`),
  quickCapture: (data: { capture_type: string; title: string; content?: string; url?: string; course_id?: string }) =>
    request<any>('/api/search/quick-capture', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: (unreadOnly: boolean = false) => request<Notification[]>(`/api/notifications?unread_only=${unreadOnly}`),
  markNotificationRead: (id: string) => request<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/api/notifications/mark-all-read', { method: 'PUT' }),

  // Backup & Demo Data
  exportBackup: () => request<any>('/api/backup/export'),
  restoreBackup: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return fetch('/api/backup/restore', { method: 'POST', body: form }).then(r => r.json());
  },
  seedDemo: () => request<any>('/api/backup/seed-demo', { method: 'POST' }),
  cleanDemo: () => request<any>('/api/backup/clean-demo', { method: 'POST' }),
};
