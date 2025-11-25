import { apiClient } from './client';

export interface ContentReference {
  type: 'ghost_entity' | 'story';
  id: string;
  name?: string;
  title?: string;
}

export interface TwinResponse {
  response: string;
  contentReferences: ContentReference[];
  responseTime: number;
}

export interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const digitalTwinApi = {
  async sendMessage(message: string): Promise<TwinResponse> {
    const response = await apiClient.post<TwinResponse>('/twin/message', { message });
    return response.data;
  },

  async getHistory(limit = 20): Promise<ConversationMessage[]> {
    const response = await apiClient.get<{ data: ConversationMessage[]; count: number }>(
      `/twin/history?limit=${limit}`
    );
    return response.data.data;
  },
};
