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
import { aiServiceClient, AIServiceUnavailableError } from './ai-client.service';

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
    } catch (error) {
      // Fallback to database recommendations if AI service fails
      if (error instanceof AIServiceUnavailableError) {
        console.warn('AI service unavailable, falling back to database recommendations');
        const recommendations = await recommendationRepository.getRecommendations(userId, limit);
        
        // Cache fallback recommendations with shorter TTL
        if (recommendations.length > 0) {
          await cacheSet(cacheKey, recommendations, 300); // 5 minutes
        }
        
        return recommendations;
      }
      throw error;
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
    // Record the interaction in the database
    const interaction = await interactionRepository.recordInteraction(
      userId,
      contentId,
      contentType,
      interactionType
    );

    // Invalidate recommendations cache since new interaction data is available
    // This will trigger recommendation model updates on next request
    await cacheDelete(CacheKeys.recommendations(userId));

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
    // Record the feedback in the database
    await recommendationRepository.recordFeedback(userId, recommendationId, feedbackType);

    // Invalidate recommendations cache to trigger model update
    await cacheDelete(CacheKeys.recommendations(userId));
  }
}

export const recommendationService = new RecommendationServiceImpl();
