import { apiClient } from './client';

export interface Story {
  id: string;
  title: string;
  content: string;
  ghostEntityIds: string[];
  origin: string;
  culturalContext: string;
  estimatedReadingTime: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  storyId: string;
  progressPercentage: number;
  lastReadPosition: number;
  isCompleted: boolean;
  lastReadAt: string;
}

export const storiesApi = {
  async getByGhost(ghostId: string): Promise<Story[]> {
    const response = await apiClient.get<Story[]>(`/stories/ghost/${ghostId}`);
    return response.data;
  },

  async getById(storyId: string): Promise<Story> {
    const response = await apiClient.get<Story>(`/stories/${storyId}`);
    return response.data;
  },

  async updateProgress(storyId: string, progress: { progressPercentage: number; lastReadPosition: number }): Promise<ReadingProgress> {
    const response = await apiClient.put<ReadingProgress>(`/stories/${storyId}/progress`, progress);
    return response.data;
  },

  async getProgress(storyId: string): Promise<ReadingProgress> {
    const response = await apiClient.get<ReadingProgress>(`/stories/${storyId}/progress`);
    return response.data;
  },

  async markAsRead(storyId: string): Promise<ReadingProgress> {
    const response = await apiClient.post<ReadingProgress>(`/stories/${storyId}/mark-read`);
    return response.data;
  },
};
