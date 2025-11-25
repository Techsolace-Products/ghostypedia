import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  favoriteGhostTypes: string[];
  preferredContentTypes: string[];
  culturalInterests: string[];
  spookinessLevel: number;
  emailNotifications: boolean;
  recommendationAlerts: boolean;
  updatedAt: string;
}

export const userApi = {
  async getProfile(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  async getPreferences(userId: string): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>(`/users/${userId}/preferences`);
    return response.data;
  },

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>(`/users/${userId}/preferences`, preferences);
    return response.data;
  },

  async deleteAccount(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },
};
