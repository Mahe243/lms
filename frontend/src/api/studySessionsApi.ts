import { apiClient } from './client';

export interface StudySessionItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  goal?: string;
  session_type?: string;
  planned_duration_mins: number;
  actual_duration_secs: number;
  break_duration_secs: number;
  start_time: string;
  end_time?: string;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
}

export const studySessionsApi = {
  async getActiveSession(): Promise<StudySessionItem | null> {
    return apiClient<StudySessionItem | null>('/api/study-sessions/active');
  },

  async startSession(payload: {
    course_id?: string;
    topic_id?: string;
    goal?: string;
    session_type?: string;
    planned_duration_mins?: number;
  }): Promise<StudySessionItem> {
    return apiClient<StudySessionItem>('/api/study-sessions/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSession(
    sessionId: string,
    payload: {
      actual_duration_secs?: number;
      break_duration_secs?: number;
      status?: 'running' | 'paused' | 'completed' | 'abandoned';
      session_notes?: string;
    }
  ): Promise<StudySessionItem> {
    return apiClient<StudySessionItem>(`/api/study-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getHistory(): Promise<StudySessionItem[]> {
    return apiClient<StudySessionItem[]>('/api/study-sessions/history');
  },
};
