import { apiClient } from './client';
import type { ContentType } from './bookmarks';

export interface Recommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  score: number;
  reasoning: string;
  generatedAt: string;
}

export type InteractionType = 'view' | 'click' | 'bookmark' | 'read' | 'share';
export type FeedbackType = 'like' | 'dislike' | 'not_interested';

export interface Interaction {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  interactionType: InteractionType;
  timestamp: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
  message?: string;
}

export const recommendationsApi = {
  async get(limit = 10): Promise<RecommendationsResponse> {
    const response = await apiClient.get<{ data: Recommendation[]; count: number; message?: string }>(
      `/recommendations?limit=${limit}`
    );
    return {
      recommendations: response.data.data || [],
      count: response.data.count || 0,
      message: response.data.message,
    };
  },

  async recordInteraction(data: {
    contentId: string;
    contentType: ContentType;
    interactionType: InteractionType;
  }): Promise<Interaction> {
    const response = await apiClient.post<Interaction>('/recommendations/interaction', data);
    return response.data;
  },

  async submitFeedback(recommendationId: string, feedbackType: FeedbackType): Promise<void> {
    await apiClient.post('/recommendations/feedback', {
      recommendationId,
      feedbackType,
    });
  },
};
