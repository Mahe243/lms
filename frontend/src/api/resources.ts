import { apiRequest } from './client';

export interface ResourceResponse {
  id: string;
  course_id?: string;
  topic_id?: string;
  title: string;
  type: string;
  url?: string;
  file_path?: string;
  file_url?: string;
  description: string;
  author?: string;
  tags: string[];
  estimated_duration_mins: number;
  status: string;
  personal_rating: number;
  is_favorite: boolean;
  last_opened_at?: string;
  open_count: number;
  is_indexed: boolean;
  indexing_status: string;
  resume_position_secs: number;
  metadata_info: Record<string, any>;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export const resourcesApi = {
  listResources: async (params?: {
    course_id?: string;
    topic_id?: string;
    res_type?: string;
    status?: string;
    is_favorite?: boolean;
  }): Promise<ResourceResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.course_id) searchParams.append('course_id', params.course_id);
    if (params?.topic_id) searchParams.append('topic_id', params.topic_id);
    if (params?.res_type) searchParams.append('res_type', params.res_type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.is_favorite !== undefined) searchParams.append('is_favorite', String(params.is_favorite));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<ResourceResponse[]>(`/api/resources${qs}`);
  },

  uploadResource: async (formData: FormData): Promise<ResourceResponse> => {
    const token = localStorage.getItem('learnova_auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/resources/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload failed (${res.status}): ${errText}`);
    }
    return res.json();
  },

  deleteResource: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  },
};
