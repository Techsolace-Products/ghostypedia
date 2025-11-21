import { query } from '../config/database';

export interface PreferenceProfile {
  id: string;
  userId: string;
  favoriteGhostTypes: string[];
  preferredContentTypes: string[];
  culturalInterests: string[];
  spookinessLevel: number;
  emailNotifications: boolean;
  recommendationAlerts: boolean;
  updatedAt: Date;
}

export interface PreferenceProfileUpdate {
  favoriteGhostTypes?: string[];
  preferredContentTypes?: string[];
  culturalInterests?: string[];
  spookinessLevel?: number;
  emailNotifications?: boolean;
  recommendationAlerts?: boolean;
}

export interface PreferencesRepository {
  findByUserId(userId: string): Promise<PreferenceProfile | null>;
  create(userId: string): Promise<PreferenceProfile>;
  update(userId: string, updates: PreferenceProfileUpdate): Promise<PreferenceProfile>;
}

class PreferencesRepositoryImpl implements PreferencesRepository {
  /**
   * Find preference profile by user ID
   */
  async findByUserId(userId: string): Promise<PreferenceProfile | null> {
    const result = await query<any>(
      `SELECT id, user_id as "userId", 
              favorite_ghost_types as "favoriteGhostTypes",
              preferred_content_types as "preferredContentTypes",
              cultural_interests as "culturalInterests",
              spookiness_level as "spookinessLevel",
              email_notifications as "emailNotifications",
              recommendation_alerts as "recommendationAlerts",
              updated_at as "updatedAt"
       FROM preference_profiles
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create default preference profile for new user
   */
  async create(userId: string): Promise<PreferenceProfile> {
    const result = await query<any>(
      `INSERT INTO preference_profiles (user_id)
       VALUES ($1)
       RETURNING id, user_id as "userId",
                 favorite_ghost_types as "favoriteGhostTypes",
                 preferred_content_types as "preferredContentTypes",
                 cultural_interests as "culturalInterests",
                 spookiness_level as "spookinessLevel",
                 email_notifications as "emailNotifications",
                 recommendation_alerts as "recommendationAlerts",
                 updated_at as "updatedAt"`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Update preference profile
   */
  async update(userId: string, updates: PreferenceProfileUpdate): Promise<PreferenceProfile> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.favoriteGhostTypes !== undefined) {
      updateFields.push(`favorite_ghost_types = $${paramIndex}`);
      values.push(updates.favoriteGhostTypes);
      paramIndex++;
    }
    if (updates.preferredContentTypes !== undefined) {
      updateFields.push(`preferred_content_types = $${paramIndex}`);
      values.push(updates.preferredContentTypes);
      paramIndex++;
    }
    if (updates.culturalInterests !== undefined) {
      updateFields.push(`cultural_interests = $${paramIndex}`);
      values.push(updates.culturalInterests);
      paramIndex++;
    }
    if (updates.spookinessLevel !== undefined) {
      updateFields.push(`spookiness_level = $${paramIndex}`);
      values.push(updates.spookinessLevel);
      paramIndex++;
    }
    if (updates.emailNotifications !== undefined) {
      updateFields.push(`email_notifications = $${paramIndex}`);
      values.push(updates.emailNotifications);
      paramIndex++;
    }
    if (updates.recommendationAlerts !== undefined) {
      updateFields.push(`recommendation_alerts = $${paramIndex}`);
      values.push(updates.recommendationAlerts);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const result = await query<any>(
      `UPDATE preference_profiles
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $${paramIndex}
       RETURNING id, user_id as "userId",
                 favorite_ghost_types as "favoriteGhostTypes",
                 preferred_content_types as "preferredContentTypes",
                 cultural_interests as "culturalInterests",
                 spookiness_level as "spookinessLevel",
                 email_notifications as "emailNotifications",
                 recommendation_alerts as "recommendationAlerts",
                 updated_at as "updatedAt"`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Preference profile not found');
    }

    return result.rows[0];
  }
}

export const preferencesRepository = new PreferencesRepositoryImpl();
