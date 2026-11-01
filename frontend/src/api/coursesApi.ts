import { apiClient } from './client';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
  is_completed: boolean;
  video_url: string;
  videoUrl?: string;
  markdown_content?: string;
  key_takeaways: string[];
  quiz_data: QuizQuestion[];
  order_index: number;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  order_index: number;
  topics: TopicItem[];
}

export interface CourseItem {
  id: string;
  title: string;
  name?: string;
  code: string;
  category: string;
  track?: string;
  instructor: string;
  description: string;
  credits: number;
  semester: string;
  accentColor: string;
  color?: string;
  progress_percentage: number;
  progress?: number;
  is_enrolled?: boolean;
  modules: ModuleItem[];
}

export const coursesApi = {
  async getCourses(): Promise<CourseItem[]> {
    return apiClient<CourseItem[]>('/api/courses');
  },

  async getCourse(courseId: string): Promise<CourseItem> {
    return apiClient<CourseItem>(`/api/courses/${courseId}`);
  },

  async createCourse(data: Partial<CourseItem>): Promise<CourseItem> {
    return apiClient<CourseItem>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(courseId: string, data: Partial<CourseItem>): Promise<CourseItem> {
    return apiClient<CourseItem>(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateTopic(topicId: string, data: Partial<TopicItem>): Promise<TopicItem> {
    return apiClient<TopicItem>(`/api/courses/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async markLessonComplete(topicId: string): Promise<TopicItem> {
    return apiClient<TopicItem>(`/api/courses/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'completed',
        is_completed: true,
      }),
    });
  },
};
