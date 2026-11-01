import { apiClient } from './client';

export interface NoteItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  needs_revision?: boolean;
  template_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const notesApi = {
  async getNotes(params?: { course_id?: string; topic_id?: string; search?: string }): Promise<NoteItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.course_id) searchParams.append('course_id', params.course_id);
    if (params?.topic_id) searchParams.append('topic_id', params.topic_id);
    if (params?.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<NoteItem[]>(`/api/notes${query}`);
  },

  async getNote(noteId: string): Promise<NoteItem> {
    return apiClient<NoteItem>(`/api/notes/${noteId}`);
  },

  async getTemplates(): Promise<NoteTemplate[]> {
    return apiClient<NoteTemplate[]>('/api/notes/templates');
  },

  async createNote(data: Partial<NoteItem>): Promise<NoteItem> {
    return apiClient<NoteItem>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(noteId: string, data: Partial<NoteItem>): Promise<NoteItem> {
    return apiClient<NoteItem>(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteNote(noteId: string): Promise<void> {
    return apiClient<void>(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};
