import { apiRequest } from './client';

export interface StudySessionOut {
  id: string;
  course_id?: string;
  topic_id?: string;
  goal: string;
  session_type: string;
  planned_duration_mins: number;
  actual_duration_secs: number;
  break_duration_secs: number;
  start_time: string;
  end_time?: string;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
  reflection_completed?: string;
  reflection_unclear?: string;
  reflection_confidence?: number;
  reflection_next?: string;
  session_notes?: string;
  created_at: string;
  updated_at: string;
}

export const studySessionsApi = {
  getActiveSession: async (): Promise<StudySessionOut | null> => {
    return apiRequest<StudySessionOut | null>('/api/study-sessions/active');
  },

  startSession: async (data: {
    course_id?: string;
    topic_id?: string;
    goal?: string;
    session_type?: string;
    planned_duration_mins?: number;
  }): Promise<StudySessionOut> => {
    return apiRequest<StudySessionOut>('/api/study-sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSession: async (
    sessionId: string,
    data: {
      status?: 'running' | 'paused' | 'completed' | 'abandoned';
      actual_duration_secs?: number;
      break_duration_secs?: number;
      reflection_completed?: string;
      reflection_unclear?: string;
      reflection_confidence?: number;
      reflection_next?: string;
      session_notes?: string;
    }
  ): Promise<StudySessionOut> => {
    return apiRequest<StudySessionOut>(`/api/study-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (limit: number = 10): Promise<StudySessionOut[]> => {
    return apiRequest<StudySessionOut[]>(`/api/study-sessions/history?limit=${limit}`);
  },
};
