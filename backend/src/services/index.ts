export { authService, AuthenticationService } from './auth.service';
export type { User, SessionToken, RegisterData, LoginData } from './auth.service';
export { emailService, EmailService } from './email.service';
export type { EmailOptions } from './email.service';
export { userService, UserService } from './user.service';
export { preferencesService, PreferencesService } from './preferences.service';
export { ghostService, GhostService, GhostSearchOptions } from './ghost.service';
export { storyService, StoryService } from './story.service';
export { bookmarkService, BookmarkService } from './bookmark.service';
export { recommendationService, RecommendationService } from './recommendation.service';
export { digitalTwinService, DigitalTwinService, DigitalTwinResponse } from './digital-twin.service';
export { aiServiceClient, AIServiceClient, AIServiceUnavailableError } from './ai-client.service';
export type { 
  AIRecommendationRequest, 
  AIRecommendationResponse, 
  AIDigitalTwinRequest, 
  AIDigitalTwinResponse 
} from './ai-client.service';
export type { ReadingProgress } from '../repositories/reading-progress.repository';
export type { Story } from '../repositories/story.repository';
export type { Bookmark, BookmarkWithMetadata, ContentType } from '../repositories/bookmark.repository';
export type { Recommendation, Feedback, FeedbackType } from '../repositories/recommendation.repository';
export type { Interaction, InteractionType, InteractionFilters } from '../repositories/interaction.repository';
export type { ConversationMessage, MessageRole } from '../repositories/conversation.repository';
