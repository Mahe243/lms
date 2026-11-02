import { apiRequest } from './client';

export interface TopicResponse {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  estimated_minutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
  understanding_level: string;
  is_optional: boolean;
  order_index: number;
  personal_questions: string[];
}

export interface ModuleResponse {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  topics: TopicResponse[];
}

export interface CourseProgressResponse {
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

export interface CourseDetailResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  instructor?: string;
  priority: string;
  cover_color: string;
  tags: string[];
  status: string;
  modules: ModuleResponse[];
  progress?: CourseProgressResponse;
}

export interface WatchProgressResponse {
  status: string;
  topic_id: string;
  position_secs: number;
  topic_status: string;
  resource_status?: string;
  reward?: any;
}

export interface WatchStateResponse {
  topic_id: string;
  topic_status: string;
  resource_id?: string;
  video_url?: string;
  file_path?: string;
  resume_position_secs: number;
  completed: boolean;
}

export const coursesApi = {
  listCourses: () => apiRequest<CourseDetailResponse[]>('/api/courses'),
  getCourse: (courseId: string) => apiRequest<CourseDetailResponse>(`/api/courses/${courseId}`),
  updateTopicStatus: (topicId: string, status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision') =>
    apiRequest<TopicResponse>(`/api/courses/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  recordWatchProgress: (
    topicId: string,
    data: { position_secs: number; duration_secs?: number; resource_id?: string; completed?: boolean }
  ) =>
    apiRequest<WatchProgressResponse>(`/api/courses/topics/${topicId}/watch-progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getWatchProgress: (topicId: string) =>
    apiRequest<WatchStateResponse>(`/api/courses/topics/${topicId}/watch-progress`),
};
