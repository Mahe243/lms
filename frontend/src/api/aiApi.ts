import { apiClient } from './client';

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  source_citations?: Array<{ source_title: string; text_snippet: string; score?: number }>;
  citations?: Array<{ source_title: string; text_snippet: string; score?: number }>;
  created_at?: string;
}

export interface AIConversationItem {
  id: string;
  title: string;
  course_id?: string;
  topic_id?: string;
  messages: AIChatMessage[];
  updated_at?: string;
}

export interface AIChatRequest {
  conversation_id?: string;
  message: string;
  course_id?: string;
  topic_id?: string;
  resource_id?: string;
  selected_passage?: string;
  context_mode?: 'course_only' | 'current_topic' | 'global' | 'selected_text';
  prompt_type?: 'teach_concept' | 'socratic' | 'simple_explanation' | 'worked_example' | 'quick_quiz' | 'standard';
}

export interface AIChatResponse {
  conversation_id: string;
  message_id: string;
  role: 'assistant';
  content: string;
  citations: Array<{ source_title: string; text_snippet: string; score?: number }>;
  configured: boolean;
  prompt_type?: string;
}

export const aiApi = {
  async chatWithTutor(data: AIChatRequest): Promise<AIChatResponse> {
    return apiClient<AIChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: 30000, // Allow 30s for LLM generation
    });
  },

  async getConversations(courseId?: string): Promise<AIConversationItem[]> {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return apiClient<AIConversationItem[]>(`/api/ai/conversations${query}`);
  },

  async getConversation(conversationId: string): Promise<AIConversationItem> {
    return apiClient<AIConversationItem>(`/api/ai/conversations/${conversationId}`);
  },

  async deleteConversation(conversationId: string): Promise<void> {
    return apiClient<void>(`/api/ai/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  async rateMessage(messageId: string, rating: number): Promise<{ status: string; rating: number }> {
    return apiClient<{ status: string; rating: number }>(`/api/ai/rate-message?message_id=${messageId}&rating=${rating}`, {
      method: 'POST',
    });
  },
};
