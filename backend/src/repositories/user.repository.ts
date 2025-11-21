import { query } from '../config/database';
import { User } from '../services/auth.service';

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  update(userId: string, updates: Partial<User>): Promise<User>;
  delete(userId: string): Promise<void>;
}

class UserRepositoryImpl implements UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, username, password_hash as "passwordHash",
              created_at as "createdAt", updated_at as "updatedAt",
              last_login_at as "lastLoginAt"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update user information
   */
  async update(userId: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['email', 'username', 'password_hash'];
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = key === 'passwordHash' ? 'password_hash' : key;
      if (allowedFields.includes(dbKey) && value !== undefined) {
        updateFields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const result = await query<User>(
      `UPDATE users
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING id, email, username, password_hash as "passwordHash",
                 created_at as "createdAt", updated_at as "updatedAt",
                 last_login_at as "lastLoginAt"`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Delete user and cascade delete all associated data
   */
  async delete(userId: string): Promise<void> {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
  }
}

export const userRepository = new UserRepositoryImpl();
