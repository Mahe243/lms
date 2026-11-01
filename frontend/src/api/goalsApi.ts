import { apiClient } from './client';

export interface GoalItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  period: string;
  deadline?: string;
  is_completed: boolean;
  progress_percentage: number;
}

export const goalsApi = {
  async getGoals(): Promise<GoalItem[]> {
    return apiClient<GoalItem[]>('/api/goals');
  },

  async createGoal(data: Partial<GoalItem>): Promise<GoalItem> {
    return apiClient<GoalItem>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(goalId: string, data: Partial<GoalItem>): Promise<GoalItem> {
    return apiClient<GoalItem>(`/api/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    return apiClient<void>(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};
