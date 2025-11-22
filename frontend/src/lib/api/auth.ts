import { apiClient } from './client';
import { tokenStorage } from '../storage/token';
import type { AuthResponse, LoginData, RegisterData, User } from '@/types/auth';

export const authApi = {
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    tokenStorage.setToken(response.data.token, response.data.expiresAt);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStorage.removeToken();
    }
  },

  async validateSession(): Promise<User> {
    const response = await apiClient.get<User>('/auth/validate');
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  }
};
