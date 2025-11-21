import { query } from '../config/database';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface ConversationMessage {
  id: string;
  userId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ConversationRepository {
  createMessage(
    userId: string,
    role: MessageRole,
    content: string
  ): Promise<ConversationMessage>;
  getConversationHistory(userId: string, limit?: number): Promise<ConversationMessage[]>;
}

class ConversationRepositoryImpl implements ConversationRepository {
  /**
   * Create a new conversation message
   */
  async createMessage(
    userId: string,
    role: MessageRole,
    content: string
  ): Promise<ConversationMessage> {
    const result = await query<any>(
      `INSERT INTO conversation_messages (user_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id as "userId", role, content, timestamp`,
      [userId, role, content]
    );

    return result.rows[0];
  }

  /**
   * Get conversation history ordered by timestamp
   */
  async getConversationHistory(userId: string, limit: number = 20): Promise<ConversationMessage[]> {
    const result = await query<any>(
      `SELECT id, user_id as "userId", role, content, timestamp
       FROM conversation_messages
       WHERE user_id = $1
       ORDER BY timestamp ASC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}

export const conversationRepository = new ConversationRepositoryImpl();
