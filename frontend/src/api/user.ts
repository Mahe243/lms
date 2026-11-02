import { apiRequest } from './client';

export interface UserPreferences {
  dark_mode?: boolean;
  ai_provider?: string;
  ai_model?: string;
  ai_api_key?: string;
  preferred_explanation_language?: string;
  preferred_depth?: string;
  streak_min_minutes?: number;
  idle_timeout_minutes?: number;
  daily_card_limit?: number;
  daily_review_limit?: number;
  timezone?: string;
  program?: string;
  target_hours?: number;
  theme?: string;
  sound_enabled?: boolean;
  calm_mode?: boolean;
  [key: string]: any;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferences: UserPreferences;
  created_at: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    return apiRequest<UserProfileResponse>('/api/user/me');
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    avatar_url?: string;
    preferences?: UserPreferences;
  }): Promise<UserProfileResponse> => {
    return apiRequest<UserProfileResponse>('/api/user/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getToken: async (): Promise<{
    access_token: string;
    token_type: string;
    user_id: string;
    name: string;
  }> => {
    return apiRequest<{
      access_token: string;
      token_type: string;
      user_id: string;
      name: string;
    }>('/api/user/token', {
      method: 'POST',
    });
  },
};
