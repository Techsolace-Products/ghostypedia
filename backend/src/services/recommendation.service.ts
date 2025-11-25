import { 
  recommendationRepository, 
  Recommendation, 
  FeedbackType 
} from '../repositories/recommendation.repository';
import { 
  interactionRepository, 
  InteractionType, 
  ContentType, 
  Interaction 
} from '../repositories/interaction.repository';
import { preferencesRepository } from '../repositories/preferences.repository';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';
import { aiServiceClient } from './ai-client.service';

export interface RecommendationService {
  getPersonalizedRecommendations(userId: string, limit?: number): Promise<Recommendation[]>;
  recordInteraction(
    userId: string,
    contentId: string,
    contentType: ContentType,
    interactionType: InteractionType
  ): Promise<Interaction>;
  submitFeedback(
    userId: string,
    recommendationId: string,
    feedbackType: FeedbackType
  ): Promise<void>;
}

class RecommendationServiceImpl implements RecommendationService {
  /**
   * Get personalized recommendations with AI integration
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    // Try to get from cache first
    const cacheKey = CacheKeys.recommendations(userId);
    const cachedRecommendations = await cacheGet<Recommendation[]>(cacheKey);

    if (cachedRecommendations) {
      return cachedRecommendations.slice(0, limit);
    }

    try {
      // First, try to get existing recommendations from database
      const existingRecommendations = await recommendationRepository.getRecommendations(userId, limit);
      
      // If we have recent recommendations (less than 1 hour old), return them
      if (existingRecommendations.length > 0) {
        const latestRec = existingRecommendations[0];
        const recAge = Date.now() - new Date(latestRec.generatedAt).getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (recAge < oneHour) {
          await cacheSet(cacheKey, existingRecommendations, CacheTTL.recommendations);
          return existingRecommendations;
        }
      }

      // Try to generate new recommendations using AI service
      try {
        // Get user preferences
        const preferences = await preferencesRepository.findByUserId(userId);
        
        // Get user interaction history
        const interactions = await interactionRepository.getUserInteractions(userId, { limit: 50 });

        // Generate recommendations using AI service
        const aiResponse = await aiServiceClient.generateRecommendations({
          user_id: userId,
          preference_profile: {
            favorite_ghost_types: preferences?.favoriteGhostTypes || [],
            preferred_content_types: preferences?.preferredContentTypes || [],
            cultural_interests: preferences?.culturalInterests || [],
            spookiness_level: preferences?.spookinessLevel || 3,
          },
          interaction_history: interactions.map(i => ({
            content_id: i.contentId,
            content_type: i.contentType,
            interaction_type: i.interactionType,
            timestamp: i.timestamp.toISOString(),
          })),
          limit,
        });

        // Store AI-generated recommendations in database
        const recommendations: Recommendation[] = [];
        for (const aiRec of aiResponse.recommendations) {
          const rec = await recommendationRepository.createRecommendation(
            userId,
            aiRec.content_id,
            aiRec.content_type as ContentType,
            aiRec.score,
            aiRec.reasoning
          );
          recommendations.push(rec);
        }

        // Store in cache
        if (recommendations.length > 0) {
          await cacheSet(cacheKey, recommendations, CacheTTL.recommendations);
        }

        return recommendations;
      } catch (aiError) {
        // AI service failed, use fallback
        console.warn('AI service error, using fallback recommendations:', aiError);
        
        // Return existing recommendations if available
        if (existingRecommendations.length > 0) {
          await cacheSet(cacheKey, existingRecommendations, 300); // 5 minutes
          return existingRecommendations;
        }
        
        // If no existing recommendations, return empty array
        // Frontend should handle this gracefully
        return [];
      }
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      
      // Final fallback: try to get any recommendations from database
      try {
        const fallbackRecommendations = await recommendationRepository.getRecommendations(userId, limit);
        return fallbackRecommendations;
      } catch (dbError) {
        console.error('Database fallback also failed:', dbError);
        // Return empty array rather than throwing
        return [];
      }
    }
  }

  /**
   * Record user interaction with content
   */
  async recordInteraction(
    userId: string,
    contentId: string,
    contentType: ContentType,
    interactionType: InteractionType
  ): Promise<Interaction> {
    const startTime = Date.now();

    // Record the interaction in the database
    const interaction = await interactionRepository.recordInteraction(
      userId,
      contentId,
      contentType,
      interactionType
    );

    // Invalidate recommendations cache since new interaction data is available
    // This will trigger recommendation model updates on next request
    // Must complete within 1 second (requirement 7.4)
    await this.invalidateRecommendationCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`Recommendation cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }

    return interaction;
  }

  /**
   * Submit feedback on a recommendation
   */
  async submitFeedback(
    userId: string,
    recommendationId: string,
    feedbackType: FeedbackType
  ): Promise<void> {
    const startTime = Date.now();

    // Record the feedback in the database
    await recommendationRepository.recordFeedback(userId, recommendationId, feedbackType);

    // Invalidate recommendations cache to trigger model update
    // Must complete within 1 second (requirement 7.4)
    await this.invalidateRecommendationCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`Recommendation cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }
  }

  /**
   * Invalidate all recommendation-related caches for a user
   * Must complete within 1 second (requirement 7.4)
   */
  private async invalidateRecommendationCaches(userId: string): Promise<void> {
    const { CacheInvalidation } = await import('../middleware/cache.middleware');
    
    // Run invalidations in parallel for speed
    await Promise.all([
      // Invalidate recommendation data cache
      cacheDelete(CacheKeys.recommendations(userId)),
      
      // Invalidate cached API responses for recommendations
      CacheInvalidation.invalidateRecommendationCaches(userId),
    ]);
  }
}

export const recommendationService = new RecommendationServiceImpl();
