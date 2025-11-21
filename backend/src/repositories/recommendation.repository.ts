import { query } from '../config/database';
import { ContentType } from './interaction.repository';

export enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  NOT_INTERESTED = 'not_interested'
}

export interface Recommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  score: number;
  reasoning: string;
  generatedAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  recommendationId: string;
  feedbackType: FeedbackType;
  timestamp: Date;
}

export interface RecommendationRepository {
  getRecommendations(userId: string, limit?: number): Promise<Recommendation[]>;
  createRecommendation(
    userId: string,
    contentId: string,
    contentType: ContentType,
    score: number,
    reasoning: string
  ): Promise<Recommendation>;
  recordFeedback(
    userId: string,
    recommendationId: string,
    feedbackType: FeedbackType
  ): Promise<Feedback>;
}

class RecommendationRepositoryImpl implements RecommendationRepository {
  /**
   * Get recommendations with user filtering
   */
  async getRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    const result = await query<any>(
      `SELECT id, user_id as "userId", content_id as "contentId",
              content_type as "contentType", score, reasoning,
              generated_at as "generatedAt"
       FROM recommendations
       WHERE user_id = $1
       ORDER BY generated_at DESC, score DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Create a new recommendation
   */
  async createRecommendation(
    userId: string,
    contentId: string,
    contentType: ContentType,
    score: number,
    reasoning: string
  ): Promise<Recommendation> {
    const result = await query<any>(
      `INSERT INTO recommendations (user_id, content_id, content_type, score, reasoning)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", content_id as "contentId",
                 content_type as "contentType", score, reasoning,
                 generated_at as "generatedAt"`,
      [userId, contentId, contentType, score, reasoning]
    );

    return result.rows[0];
  }

  /**
   * Record feedback for a recommendation
   */
  async recordFeedback(
    userId: string,
    recommendationId: string,
    feedbackType: FeedbackType
  ): Promise<Feedback> {
    const result = await query<any>(
      `INSERT INTO recommendation_feedback (user_id, recommendation_id, feedback_type)
       VALUES ($1, $2, $3)
       RETURNING id, user_id as "userId", recommendation_id as "recommendationId",
                 feedback_type as "feedbackType", timestamp`,
      [userId, recommendationId, feedbackType]
    );

    return result.rows[0];
  }
}

export const recommendationRepository = new RecommendationRepositoryImpl();
