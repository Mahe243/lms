import { apiClient } from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferences: {
    dark_mode?: boolean;
    ai_provider?: string;
    ai_model?: string;
    preferred_explanation_language?: string;
    preferred_depth?: string;
    streak_min_minutes?: number;
    idle_timeout_minutes?: number;
    daily_card_limit?: number;
    daily_review_limit?: number;
    timezone?: string;
  };
}

export const userApi = {
  async getCurrentUser(): Promise<UserProfile> {
    return apiClient<UserProfile>('/api/user/me');
  },

  async updateUserPreferences(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient<UserProfile>('/api/user/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
