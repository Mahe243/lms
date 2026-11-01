import { apiClient } from './client';

export interface TaskItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  description?: string;
  task_type?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  estimated_minutes?: number;
  actual_minutes?: number;
}

export const tasksApi = {
  async getTasks(courseId?: string): Promise<TaskItem[]> {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return apiClient<TaskItem[]>(`/api/tasks${query}`);
  },

  async createTask(data: Partial<TaskItem>): Promise<TaskItem> {
    return apiClient<TaskItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(taskId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    return apiClient<TaskItem>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    return apiClient<void>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};
