import { apiRequest } from './client';

export interface BackendFlashcard {
  id: string;
  deck_id: string;
  course_id?: string;
  topic_id?: string;
  card_type: string;
  front: string;
  back: string;
  cloze_text?: string;
  explanation?: string;
  source_ref?: string;
  tags: string[];
  image_url?: string;
  is_suspended: boolean;
  is_draft: boolean;
  draft_reviewed: boolean;
  reps: number;
  lapses: number;
  stability: number;
  state: string;
  interval_days: number;
  last_review_at?: string;
  next_review_at?: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashcardDeckOut {
  id: string;
  course_id?: string;
  topic_id?: string;
  name: string;
  description: string;
  tags: string[];
  card_count: number;
  due_count: number;
  new_count: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  status: string;
  card: BackendFlashcard;
  scheduled_days: number;
  next_review_at: string;
}

export const flashcardsApi = {
  getDecks: async (courseId?: string): Promise<FlashcardDeckOut[]> => {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return apiRequest<FlashcardDeckOut[]>(`/api/flashcards/decks${query}`);
  },

  getCards: async (params?: { deck_id?: string; course_id?: string; mode?: string }): Promise<BackendFlashcard[]> => {
    const searchParams = new URLSearchParams();
    if (params?.deck_id) searchParams.append('deck_id', params.deck_id);
    if (params?.course_id) searchParams.append('course_id', params.course_id);
    if (params?.mode) searchParams.append('mode', params.mode);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<BackendFlashcard[]>(`/api/flashcards${qs}`);
  },

  reviewCard: async (cardId: string, rating: 1 | 2 | 3 | 4, reviewTimeMs: number = 0): Promise<ReviewResponse> => {
    return apiRequest<ReviewResponse>('/api/flashcards/review', {
      method: 'POST',
      body: JSON.stringify({
        card_id: cardId,
        rating,
        review_time_ms: reviewTimeMs,
      }),
    });
  },

  undoReview: async (cardId: string): Promise<{ message: string; card: BackendFlashcard }> => {
    return apiRequest<{ message: string; card: BackendFlashcard }>(`/api/flashcards/undo-review/${cardId}`, {
      method: 'POST',
    });
  },
};
