import { conversationRepository, ConversationMessage, MessageRole } from '../repositories/conversation.repository';
import { preferencesRepository } from '../repositories/preferences.repository';
import { interactionRepository } from '../repositories/interaction.repository';
import { aiServiceClient, AIServiceUnavailableError } from './ai-client.service';

export interface DigitalTwinService {
  sendMessage(userId: string, message: string): Promise<DigitalTwinResponse>;
  getConversationHistory(userId: string, limit?: number): Promise<ConversationMessage[]>;
}

export interface DigitalTwinResponse {
  response: string;
  contentReferences: Array<{
    contentType: string;
    contentId: string;
  }>;
  responseTime: number;
}

class DigitalTwinServiceImpl implements DigitalTwinService {
  /**
   * Send a message to the digital twin and get a response
   */
  async sendMessage(userId: string, message: string): Promise<DigitalTwinResponse> {
    // Store user message
    await conversationRepository.createMessage(userId, MessageRole.USER, message);

    try {
      // Build context for AI service
      const context = await this.buildContext(userId);

      // Send message to AI service
      const aiResponse = await aiServiceClient.sendDigitalTwinMessage({
        user_id: userId,
        message,
        context,
      });

      // Store assistant response
      await conversationRepository.createMessage(
        userId,
        MessageRole.ASSISTANT,
        aiResponse.response
      );

      return {
        response: aiResponse.response,
        contentReferences: aiResponse.content_references.map(ref => ({
          contentType: ref.content_type,
          contentId: ref.content_id,
        })),
        responseTime: aiResponse.response_time,
      };
    } catch (error) {
      // Handle AI service unavailability with fallback response
      if (error instanceof AIServiceUnavailableError) {
        const fallbackResponse = "I'm having trouble connecting right now. Please try again in a moment.";
        
        // Store fallback response
        await conversationRepository.createMessage(
          userId,
          MessageRole.ASSISTANT,
          fallbackResponse
        );

        return {
          response: fallbackResponse,
          contentReferences: [],
          responseTime: 0,
        };
      }
      throw error;
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: string, limit: number = 20): Promise<ConversationMessage[]> {
    return conversationRepository.getConversationHistory(userId, limit);
  }

  /**
   * Build context for AI service from user data
   */
  private async buildContext(userId: string) {
    // Get user preferences
    const preferences = await preferencesRepository.findByUserId(userId);

    // Get recent conversation messages
    const recentMessages = await conversationRepository.getConversationHistory(userId, 10);

    // Get recent interactions
    const recentInteractions = await interactionRepository.getUserInteractions(userId, { limit: 10 });

    return {
      user_preferences: {
        favorite_ghost_types: preferences?.favoriteGhostTypes || [],
        cultural_interests: preferences?.culturalInterests || [],
        spookiness_level: preferences?.spookinessLevel || 3,
      },
      recent_messages: recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      recent_interactions: recentInteractions.map(interaction => ({
        content_type: interaction.contentType,
        interaction_type: interaction.interactionType,
      })),
    };
  }
}

export const digitalTwinService = new DigitalTwinServiceImpl();
