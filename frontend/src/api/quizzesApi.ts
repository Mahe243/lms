import { apiClient } from './client';

export interface QuestionItem {
  id: string;
  bank_id?: string;
  course_id?: string;
  topic_id?: string;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer: any;
  explanation?: string;
  difficulty?: string;
  tags?: string[];
}

export interface QuestionBankItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  name: string;
  description?: string;
  question_count: number;
}

export interface QuizSubmitPayload {
  quiz_title: string;
  responses: Record<string, any>;
  course_id?: string;
  bank_id?: string;
  topic_id?: string;
  mode?: string;
  time_spent_secs?: number;
}

export interface QuizAttemptResult {
  id: string;
  score_percentage: number;
  total_questions: number;
  correct_count: number;
  duration_seconds: number;
  graded_results: Record<string, { correct: boolean; user_answer: any; explanation?: string }>;
  created_at: string;
}

export const quizzesApi = {
  async getBanks(courseId?: string): Promise<QuestionBankItem[]> {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return apiClient<QuestionBankItem[]>(`/api/quizzes/banks${query}`);
  },

  async getQuestions(bankId?: string, courseId?: string): Promise<QuestionItem[]> {
    const params = new URLSearchParams();
    if (bankId) params.append('bank_id', bankId);
    if (courseId) params.append('course_id', courseId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<QuestionItem[]>(`/api/quizzes/questions${query}`);
  },

  async submitQuiz(payload: QuizSubmitPayload): Promise<QuizAttemptResult> {
    return apiClient<QuizAttemptResult>('/api/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMistakeLog(): Promise<any[]> {
    return apiClient<any[]>('/api/quizzes/mistake-log');
  },
};
