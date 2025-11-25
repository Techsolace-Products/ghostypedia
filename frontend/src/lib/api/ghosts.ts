import { apiClient } from './client';

export interface GhostEntity {
  id: string;
  name: string;
  type: string;
  origin: string;
  culturalContext: string;
  description: string;
  characteristics: string[];
  dangerLevel: number;
  imageUrl?: string;
  relatedEntityIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GhostSearchParams {
  query?: string;
  categories?: string | string[];
  dangerLevel?: number;
  culturalContext?: string;
  tags?: string | string[];
  sortBy?: 'name' | 'type' | 'dangerLevel' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateGhostData {
  name: string;
  type: string;
  origin?: string;
  culturalContext?: string;
  description: string;
  characteristics?: string[];
  dangerLevel?: number;
  imageUrl?: string;
  tags?: string[];
}

export const ghostsApi = {
  async search(params: GhostSearchParams): Promise<PaginatedResponse<GhostEntity>> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await apiClient.get<PaginatedResponse<GhostEntity>>(`/ghosts?${queryString}`);
    return response.data;
  },

  async getById(ghostId: string): Promise<GhostEntity> {
    const response = await apiClient.get<GhostEntity>(`/ghosts/${ghostId}`);
    return response.data;
  },

  async getByCategory(category: string, page = 1, limit = 50): Promise<PaginatedResponse<GhostEntity>> {
    const response = await apiClient.get<PaginatedResponse<GhostEntity>>(
      `/ghosts/category/${category}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getRelated(ghostId: string): Promise<GhostEntity[]> {
    const response = await apiClient.get<GhostEntity[]>(`/ghosts/${ghostId}/related`);
    return response.data;
  },

  async create(data: CreateGhostData): Promise<{ ghost: GhostEntity; message?: string }> {
    const response = await apiClient.post<{ data: GhostEntity; message?: string }>('/ghosts', data);
    return {
      ghost: response.data.data,
      message: response.data.message,
    };
  },
};
