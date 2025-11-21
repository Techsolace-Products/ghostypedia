import axios from 'axios';
import { config } from '../config/env';

// Type definitions for axios
type AxiosInstance = any;

/**
 * AI Service Client for communicating with Python AI service
 * Implements retry logic, timeout handling, and fallback mechanisms
 */

export interface AIRecommendationRequest {
  user_id: string;
  preference_profile: {
    favorite_ghost_types: string[];
    preferred_content_types: string[];
    cultural_interests: string[];
    spookiness_level: number;
  };
  interaction_history: Array<{
    content_id: string;
    content_type: string;
    interaction_type: string;
    timestamp: string;
  }>;
  limit?: number;
}

export interface AIRecommendationResponse {
  user_id: string;
  recommendations: Array<{
    content_id: string;
    content_type: string;
    score: number;
    reasoning: string;
  }>;
  count: number;
}

export interface AIDigitalTwinRequest {
  user_id: string;
  message: string;
  context: {
    user_preferences: {
      favorite_ghost_types: string[];
      cultural_interests: string[];
      spookiness_level: number;
    };
    recent_messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
    }>;
    recent_interactions: Array<{
      content_type: string;
      interaction_type: string;
    }>;
  };
}

export interface AIDigitalTwinResponse {
  user_id: string;
  response: string;
  content_references: Array<{
    content_type: string;
    content_id: string;
  }>;
  response_time: number;
  error?: string;
}

export interface AIServiceClient {
  generateRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse>;
  sendDigitalTwinMessage(request: AIDigitalTwinRequest): Promise<AIDigitalTwinResponse>;
  healthCheck(): Promise<boolean>;
}

class AIServiceClientImpl implements AIServiceClient {
  private client: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.client = axios.create({
      baseURL: config.aiService.url,
      timeout: config.aiService.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate recommendations from AI service with retry logic
   */
  async generateRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    return this.retryRequest(async () => {
      try {
        const response = await this.client.post(
          '/ai/recommendations',
          request
        );
        return response.data as AIRecommendationResponse;
      } catch (error) {
        if (this.isServiceUnavailable(error)) {
          throw new AIServiceUnavailableError('AI recommendation service is unavailable');
        }
        throw this.handleError(error, 'Failed to generate recommendations');
      }
    });
  }

  /**
   * Send message to digital twin with retry logic
   */
  async sendDigitalTwinMessage(request: AIDigitalTwinRequest): Promise<AIDigitalTwinResponse> {
    return this.retryRequest(async () => {
      try {
        const response = await this.client.post(
          '/ai/twin/message',
          request
        );
        return response.data as AIDigitalTwinResponse;
      } catch (error) {
        if (this.isServiceUnavailable(error)) {
          throw new AIServiceUnavailableError('AI digital twin service is unavailable');
        }
        throw this.handleError(error, 'Failed to generate digital twin response');
      }
    });
  }

  /**
   * Check if AI service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Don't retry if service is unavailable or max retries reached
      if (error instanceof AIServiceUnavailableError || attempt >= this.maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await this.sleep(delay);

      return this.retryRequest(operation, attempt + 1);
    }
  }

  /**
   * Check if error indicates service unavailability
   */
  private isServiceUnavailable(error: any): boolean {
    if (error.isAxiosError || error.response || error.code) {
      // Network errors, timeouts, or 503 Service Unavailable
      return (
        !error.response ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status === 503
      );
    }
    return false;
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.isAxiosError || error.response) {
      if (error.response?.data) {
        const errorData = error.response.data as any;
        return new Error(errorData.error || defaultMessage);
      }
      return new Error(error.message || defaultMessage);
    }
    return error instanceof Error ? error : new Error(defaultMessage);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Custom error for AI service unavailability
 */
export class AIServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceUnavailableError';
  }
}

export const aiServiceClient = new AIServiceClientImpl();
