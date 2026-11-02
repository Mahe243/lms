import { apiRequest } from './client';
import type { GameWalletState } from '../context/AppContext';

export interface DailyMissionResponse {
  id: string;
  mission_date: string;
  mission_type: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  reward_coins: number;
  reward_xp: number;
  is_completed: boolean;
  is_claimed: boolean;
}

export interface AchievementResponse {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  badge_icon: string;
  reward_coins: number;
  reward_xp: number;
  unlocked_at: string;
}

export interface CosmeticItemResponse {
  item_id: string;
  name: string;
  description: string;
  item_type: string;
  price_coins: number;
  is_unlocked: boolean;
  is_equipped: boolean;
  preview_accent: string;
}

export interface GameProfileResponse {
  wallet: GameWalletState;
  stats: {
    citadel_level: number;
    citadel_tier: number;
    total_xp: number;
    completed_lessons: number;
    reviewed_cards: number;
    completed_quizzes: number;
    focus_minutes: number;
    completed_projects: number;
    ai_interactions: number;
    earned_achievements: number;
  };
  missions: DailyMissionResponse[];
  achievements: AchievementResponse[];
  equipped_cosmetics: string[];
}

export const gameApi = {
  getProfile: () => apiRequest<GameProfileResponse>('/api/game/profile'),
  getWallet: () => apiRequest<GameWalletState>('/api/game/wallet'),
  getKingdom: () => apiRequest<any>('/api/game/kingdom'),
  getTodayMissions: (today?: string) =>
    apiRequest<DailyMissionResponse[]>(
      today ? `/api/game/missions/today?today=${today}` : '/api/game/missions/today'
    ),
  claimMission: (missionId: string) =>
    apiRequest<{
      message: string;
      mission_id: string;
      awarded_coins: number;
      awarded_xp: number;
      wallet: { coin_balance: number; total_xp: number; level: number };
    }>(`/api/game/missions/${missionId}/claim`, { method: 'POST' }),
  getAchievements: () => apiRequest<AchievementResponse[]>('/api/game/achievements'),
  getShopItems: () => apiRequest<CosmeticItemResponse[]>('/api/game/shop'),
  getUnlocks: () => apiRequest<any[]>('/api/game/unlocks'),
  purchaseCosmetic: (itemId: string) =>
    apiRequest<{
      message: string;
      item_id: string;
      wallet: { coin_balance: number; total_xp: number };
    }>('/api/game/shop/purchase', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }),
  equipCosmetic: (itemId: string) =>
    apiRequest<{ message: string; item_id: string }>('/api/game/equip', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }),
  resetGameProgress: () =>
    apiRequest<{ success: boolean; message: string; wallet: any }>('/api/game/reset', {
      method: 'POST',
    }),
  recordProjectMilestone: (data: {
    project_key: string;
    milestone_key: string;
    title: string;
    summary?: string;
  }) =>
    apiRequest<{
      status: string;
      project_key: string;
      milestone_key: string;
      reward: any;
      forge_building: any;
    }>('/api/game/projects/milestone', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProjectMilestones: () =>
    apiRequest<Array<{
      id: string;
      project_key: string;
      milestone_key: string;
      title: string;
      completed: boolean;
      result_summary: string;
      completed_at: string;
    }>>('/api/game/projects'),
};
