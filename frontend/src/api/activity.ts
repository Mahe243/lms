import { apiRequest } from './client';

export interface HeatmapDay {
  date: string;
  minutes: number;
  count: number;
}

export interface AnalyticsResponse {
  study_time_today_minutes: number;
  study_time_week_hours: number;
  total_visits: number;
  today_visits: number;
  streak_days: number;
  total_active_days: number;
  heatmap: HeatmapDay[];
  course_times: {
    course_id: string;
    course_name: string;
    color: string;
    minutes: number;
  }[];
  quiz_trend: {
    quiz_title: string;
    percentage: number;
    date: string;
  }[];
}

export const activityApi = {
  getAnalytics: () => apiRequest<AnalyticsResponse>('/api/activity/analytics'),
  sendHeartbeat: (durationSecs: number, courseId?: string) =>
    apiRequest<any>('/api/activity/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ duration_secs: durationSecs, course_id: courseId }),
    }),
};
