import { apiClient } from './client';

export interface ResourceItem {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  type: string;
  url?: string;
  file_path?: string;
  description?: string;
  author?: string;
  tags?: string;
  estimated_duration_mins?: number;
  status?: string;
  personal_rating?: number;
  is_favorite?: boolean;
  resume_position_secs?: number;
  metadata_info?: string;
  created_at?: string;
  updated_at?: string;
}

export const resourcesApi = {
  async getResources(params?: { course_id?: string; type?: string; search?: string }): Promise<ResourceItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.course_id) searchParams.append('course_id', params.course_id);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<ResourceItem[]>(`/api/resources${query}`);
  },

  async createResource(data: {
    title: string;
    type: string;
    url?: string;
    course_id?: string;
    topic_id?: string;
    description?: string;
    author?: string;
    tags?: string[];
  }): Promise<ResourceItem> {
    return apiClient<ResourceItem>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadFile(formData: FormData): Promise<ResourceItem> {
    return apiClient<ResourceItem>('/api/resources/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async toggleFavorite(resourceId: string, isFavorite: boolean): Promise<ResourceItem> {
    return apiClient<ResourceItem>(`/api/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_favorite: isFavorite }),
    });
  },

  async deleteResource(resourceId: string): Promise<void> {
    return apiClient<void>(`/api/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },
};
