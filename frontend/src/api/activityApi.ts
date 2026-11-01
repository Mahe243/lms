import { apiClient } from './client';

export interface AnalyticsMetrics {
  study_time_today_minutes: number;
  study_time_week_hours: number;
  total_visits: number;
  today_visits: number;
  streak_days: number;
  total_active_days: number;
  heatmap: Array<{ date: string; minutes: number; count: number }>;
  course_times: Array<{ course_id: string; course_name: string; color?: string; minutes: number }>;
  quiz_trend: Array<{ quiz_title: string; percentage: number; date: string }>;
}

export interface StreakInfo {
  streak_days: number;
  longest_streak: number;
  total_active_days: number;
  is_active_today: boolean;
}

export const activityApi = {
  async getAnalytics(): Promise<AnalyticsMetrics> {
    return apiClient<AnalyticsMetrics>('/api/activity/analytics');
  },

  async getStreak(minMinutes?: number): Promise<StreakInfo> {
    const query = minMinutes ? `?min_minutes=${minMinutes}` : '';
    return apiClient<StreakInfo>(`/api/activity/streak${query}`);
  },

  async sendHeartbeat(data: { duration_secs: number; course_id?: string; session_visit_id?: string }): Promise<void> {
    return apiClient<void>('/api/activity/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async recordVisit(sessionVisitId: string): Promise<{ new_visit_recorded: boolean }> {
    return apiClient<{ new_visit_recorded: boolean }>('/api/activity/platform-visit', {
      method: 'POST',
      body: JSON.stringify({ session_visit_id: sessionVisitId }),
    });
  },
};
