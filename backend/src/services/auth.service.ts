import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, executeInTransaction } from '../config/database';
import { config } from '../config/env';
import { PoolClient } from 'pg';
import { emailService } from './email.service';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface SessionToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthenticationService {
  private readonly saltRounds: number;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly sessionTimeout: number;

  constructor() {
    this.saltRounds = config.auth.bcryptSaltRounds;
    this.jwtSecret = config.auth.jwtSecret;
    this.jwtExpiresIn = config.auth.jwtExpiresIn;
    this.sessionTimeout = config.auth.sessionTimeout;
  }

  /**
   * Register a new user with hashed password
   */
  async register(data: RegisterData): Promise<User> {
    const { email, password, username } = data;

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Insert user into database
    const result = await query<User>(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, password_hash as "passwordHash", 
                 created_at as "createdAt", updated_at as "updatedAt", 
                 last_login_at as "lastLoginAt"`,
      [email, username, passwordHash]
    );

    return result.rows[0];
  }

  /**
   * Login user with credential validation and session token generation
   */
  async login(data: LoginData): Promise<SessionToken> {
    const { email, password } = data;

    // Find user by email
    const userResult = await query<User>(
      `SELECT id, email, username, password_hash as "passwordHash",
              created_at as "createdAt", updated_at as "updatedAt",
              last_login_at as "lastLoginAt"
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    // Store session in database
    await executeInTransaction(async (client: PoolClient) => {
      // Update last login time
      await client.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Create session record
      await client.query(
        `INSERT INTO sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );
    });

    return {
      token,
      userId: user.id,
      expiresAt,
    };
  }

  /**
   * Validate session token and return user if valid
   */
  async validateSession(token: string): Promise<User | null> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; email: string };

      // Check if session exists and is not expired
      const sessionResult = await query(
        `SELECT s.id, s.user_id, s.expires_at
         FROM sessions s
         WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
        [token]
      );

      if (sessionResult.rows.length === 0) {
        return null;
      }

      // Update last activity time
      await query(
        'UPDATE sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE token = $1',
        [token]
      );

      // Fetch and return user
      const userResult = await query<User>(
        `SELECT id, email, username, password_hash as "passwordHash",
                created_at as "createdAt", updated_at as "updatedAt",
                last_login_at as "lastLoginAt"
         FROM users
         WHERE id = $1`,
        [decoded.userId]
      );

      return userResult.rows.length > 0 ? userResult.rows[0] : null;
    } catch (error) {
      // Token verification failed or other error
      return null;
    }
  }

  /**
   * Logout user by removing session
   */
  async logout(token: string): Promise<void> {
    await query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  /**
   * Generate password reset token and send email
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    // Find user by email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userId = userResult.rows[0].id;

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token in database with expiration (1 hour)
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Create a password_reset_tokens table entry (we'll need to add this to schema)
    // For now, we'll use sessions table with a special marker
    await query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, `reset:${hashedToken}`, expiresAt]
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error - token is still valid even if email fails
    }

    return resetToken;
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find valid reset token
    const sessionResult = await query(
      `SELECT user_id, expires_at
       FROM sessions
       WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [`reset:${hashedToken}`]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const userId = sessionResult.rows[0].user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

    await executeInTransaction(async (client: PoolClient) => {
      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, userId]
      );

      // Delete reset token
      await client.query(
        'DELETE FROM sessions WHERE token = $1',
        [`reset:${hashedToken}`]
      );

      // Delete all other sessions for this user (force re-login)
      await client.query(
        'DELETE FROM sessions WHERE user_id = $1',
        [userId]
      );
    });
  }
}

export const authService = new AuthenticationService();
