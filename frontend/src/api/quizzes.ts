import { apiRequest } from './client';

export interface QuestionBankResponse {
  id: string;
  course_id?: string;
  topic_id?: string;
  name: string;
  description: string;
  question_count: number;
  is_demo: boolean;
  created_at: string;
}

export interface QuestionResponse {
  id: string;
  bank_id: string;
  course_id?: string;
  topic_id?: string;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer?: any;
  numerical_tolerance: number;
  numerical_unit?: string;
  explanation?: string;
  difficulty: string;
  tags: string[];
}

export interface QuizAttemptResponse {
  id: string;
  bank_id?: string;
  course_id?: string;
  topic_id?: string;
  quiz_title: string;
  mode: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent_secs: number;
  questions_snapshot: any[];
  responses: Record<string, any>;
  completed_at: string;
}

export const quizzesApi = {
  listBanks: (courseId?: string) =>
    apiRequest<QuestionBankResponse[]>(
      courseId ? `/api/quizzes/banks?course_id=${courseId}` : '/api/quizzes/banks'
    ),
  listQuestions: (bankId?: string, courseId?: string, topicId?: string) => {
    const params = new URLSearchParams();
    if (bankId) params.append('bank_id', bankId);
    if (courseId) params.append('course_id', courseId);
    if (topicId) params.append('topic_id', topicId);
    const qs = params.toString();
    return apiRequest<QuestionResponse[]>(qs ? `/api/quizzes/questions?${qs}` : '/api/quizzes/questions');
  },
  checkSingleAnswer: (questionId: string, selectedOption: any) =>
    apiRequest<{ is_correct: boolean; explanation: string }>('/api/quizzes/check-single', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
    }),
  getSocraticHint: (questionId: string) =>
    apiRequest<{ hint: string; cost_coins: number; remaining_coins: number }>('/api/quizzes/hint', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId }),
    }),
  submitAttempt: (payload: {
    bank_id?: string;
    course_id?: string;
    topic_id?: string;
    quiz_title: string;
    mode: string;
    responses: Record<string, any>;
    time_spent_secs: number;
  }) =>
    apiRequest<QuizAttemptResponse>('/api/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listAttempts: (courseId?: string) =>
    apiRequest<QuizAttemptResponse[]>(
      courseId ? `/api/quizzes/attempts?course_id=${courseId}` : '/api/quizzes/attempts'
    ),
  getMistakeLog: (courseId?: string) =>
    apiRequest<any[]>(
      courseId ? `/api/quizzes/mistake-log?course_id=${courseId}` : '/api/quizzes/mistake-log'
    ),
};
