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

export const coursesApi = {
  listCourses: () => apiRequest<CourseDetailResponse[]>('/api/courses'),
  getCourse: (courseId: string) => apiRequest<CourseDetailResponse>(`/api/courses/${courseId}`),
  updateTopicStatus: (topicId: string, status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision') =>
    apiRequest<TopicResponse>(`/api/courses/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
