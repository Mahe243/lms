import { apiClient } from './client';

export interface FlashcardItem {
  id: string;
  deck_id: string;
  course_id?: string;
  topic_id?: string;
  card_type: string;
  front: string;
  back: string;
  explanation?: string;
  stability: number;
  state: string;
  interval_days: number;
  reps: number;
  lapses: number;
  last_review_at?: string;
  next_review_at?: string;
}

export interface FlashcardDeckItem {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  card_count: number;
  due_count: number;
}

export const flashcardsApi = {
  async getDecks(courseId?: string): Promise<FlashcardDeckItem[]> {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return apiClient<FlashcardDeckItem[]>(`/api/flashcards/decks${query}`);
  },

  async getCards(deckId?: string, dueOnly: boolean = false): Promise<FlashcardItem[]> {
    const params = new URLSearchParams();
    if (deckId) params.append('deck_id', deckId);
    if (dueOnly) params.append('due_only', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<FlashcardItem[]>(`/api/flashcards${query}`);
  },

  async reviewCard(cardId: string, rating: 1 | 2 | 3 | 4, reviewTimeMs: number = 2500): Promise<FlashcardItem> {
    return apiClient<FlashcardItem>('/api/flashcards/review', {
      method: 'POST',
      body: JSON.stringify({
        card_id: cardId,
        rating,
        review_time_ms: reviewTimeMs,
      }),
    });
  },

  async undoReview(cardId: string): Promise<FlashcardItem> {
    return apiClient<FlashcardItem>(`/api/flashcards/undo-review/${cardId}`, {
      method: 'POST',
    });
  },
};
