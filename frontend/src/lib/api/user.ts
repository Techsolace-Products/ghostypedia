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
  userId: string;
  favoriteGhostTypes: string[];
  preferredContentTypes: string[];
  culturalInterests: string[];
  spookinessLevel: number;
  notificationSettings: {
    emailNotifications: boolean;
    recommendationAlerts: boolean;
  };
  updatedAt: string;
}

// Flattened version for easier form handling
export interface UserPreferencesFlat {
  userId: string;
  favoriteGhostTypes: string[];
  preferredContentTypes: string[];
  culturalInterests: string[];
  spookinessLevel: number;
  emailNotifications: boolean;
  recommendationAlerts: boolean;
  updatedAt: string;
}

// Helper to flatten preferences from API response
const flattenPreferences = (prefs: UserPreferences): UserPreferencesFlat => ({
  userId: prefs.userId,
  favoriteGhostTypes: prefs.favoriteGhostTypes || [],
  preferredContentTypes: prefs.preferredContentTypes || [],
  culturalInterests: prefs.culturalInterests || [],
  spookinessLevel: prefs.spookinessLevel || 3,
  emailNotifications: prefs.notificationSettings?.emailNotifications ?? false,
  recommendationAlerts: prefs.notificationSettings?.recommendationAlerts ?? false,
  updatedAt: prefs.updatedAt,
});

// Helper to nest preferences for API request
const nestPreferences = (prefs: Partial<UserPreferencesFlat>): Partial<UserPreferences> => {
  const result: Partial<UserPreferences> = {};
  
  if (prefs.favoriteGhostTypes !== undefined) result.favoriteGhostTypes = prefs.favoriteGhostTypes;
  if (prefs.preferredContentTypes !== undefined) result.preferredContentTypes = prefs.preferredContentTypes;
  if (prefs.culturalInterests !== undefined) result.culturalInterests = prefs.culturalInterests;
  if (prefs.spookinessLevel !== undefined) result.spookinessLevel = prefs.spookinessLevel;
  
  if (prefs.emailNotifications !== undefined || prefs.recommendationAlerts !== undefined) {
    result.notificationSettings = {
      emailNotifications: prefs.emailNotifications ?? false,
      recommendationAlerts: prefs.recommendationAlerts ?? false,
    };
  }
  
  return result;
};

export const userApi = {
  async getProfile(userId: string): Promise<User> {
    const response = await apiClient.get<{ data: User }>(`/users/${userId}`);
    return response.data.data;
  },

  async getPreferences(userId: string): Promise<UserPreferencesFlat> {
    const response = await apiClient.get<{ data: UserPreferences }>(`/users/${userId}/preferences`);
    return flattenPreferences(response.data.data);
  },

  async updatePreferences(userId: string, preferences: Partial<UserPreferencesFlat>): Promise<UserPreferencesFlat> {
    const nestedPrefs = nestPreferences(preferences);
    const response = await apiClient.put<{ data: UserPreferences }>(`/users/${userId}/preferences`, nestedPrefs);
    return flattenPreferences(response.data.data);
  },

  async deleteAccount(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },
};
