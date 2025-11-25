import { apiClient } from './client';

export type ContentType = 'ghost_entity' | 'story' | 'movie' | 'myth';

export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface CreateBookmarkData {
  contentId: string;
  contentType: ContentType;
  tags?: string[];
  notes?: string;
}

export const bookmarksApi = {
  async getAll(): Promise<Bookmark[]> {
    const response = await apiClient.get<Bookmark[]>('/bookmarks');
    return response.data;
  },

  async create(data: CreateBookmarkData): Promise<Bookmark> {
    const response = await apiClient.post<Bookmark>('/bookmarks', data);
    return response.data;
  },

  async delete(bookmarkId: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${bookmarkId}`);
  },

  async updateTags(bookmarkId: string, tags: string[]): Promise<Bookmark> {
    const response = await apiClient.put<Bookmark>(`/bookmarks/${bookmarkId}/organize`, { tags });
    return response.data;
  },
};
