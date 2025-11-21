# Design Document

## Overview

Ghostypedia Backend is a RESTful API service built with a modern microservices-inspired architecture. The system consists of two primary layers:

1. **Backend API Layer**: Express.js server (TypeScript) handling business logic, authentication, and data management
2. **AI Service Layer**: Python-based service integrating Google Gemini for the digital twin and recommendation engine

The architecture emphasizes separation of concerns, scalability, and maintainability. API clients interact with the Express.js backend through RESTful endpoints. The backend manages data persistence through PostgreSQL, uses Redis for caching and session management, and communicates with the Python AI service for intelligent features.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      API Clients                             │
│         (Web Apps, Mobile Apps, Third-party Services)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend API                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Layer (TypeScript)                │    │
│  │  - Authentication Middleware                        │    │
│  │  - Route Controllers                                │    │
│  │  - Request Validation                               │    │
│  │  - Error Handling                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Business Logic Layer                     │    │
│  │  - Authentication Service                           │    │
│  │  - User Service                                     │    │
│  │  - Ghost Entity Service                             │    │
│  │  - Story Service                                    │    │
│  │  - Recommendation Service                           │    │
│  │  - Bookmark Service                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Data Access Layer                        │    │
│  │  - Database Repositories                            │    │
│  │  - Cache Management                                 │    │
│  │  - Query Builders                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐            │
│         ▼                  ▼                  ▼            │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │PostgreSQL│      │  Redis   │      │   AI     │        │
│  │          │      │          │      │ Service  │        │
│  │ (Primary │      │(Sessions,│      │ (Python) │        │
│  │   Data)  │      │ Cache,   │      │          │        │
│  │          │      │  Rate    │      │          │        │
│  │          │      │ Limiting)│      │          │        │
│  └──────────┘      └──────────┘      └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Google Gemini   │
                                    │      API         │
                                    └──────────────────┘
```

### Technology Stack Rationale

- **Express.js**: Lightweight, flexible API server with extensive middleware ecosystem and strong TypeScript support
- **TypeScript**: Ensures type safety across the backend, reducing runtime errors and improving maintainability
- **PostgreSQL**: Robust relational database for structured data with ACID compliance, perfect for complex relationships between entities
- **Redis**: High-performance in-memory data store for caching, session management, and rate limiting
- **Python + Google Gemini**: Leverages advanced LLM capabilities for personalized AI interactions and recommendations
- **Nodemailer**: Reliable email delivery for authentication flows (password reset, verification)
- **bcrypt**: Industry-standard password hashing library for secure credential storage

## Components and Interfaces

### Backend Services

#### 1. Authentication Service
```typescript
interface AuthenticationService {
  register(email: string, password: string, username: string): Promise<User>
  login(email: string, password: string): Promise<SessionToken>
  logout(sessionToken: string): Promise<void>
  resetPassword(email: string): Promise<void>
  validateSession(sessionToken: string): Promise<User | null>
}
```

#### 2. User Service
```typescript
interface UserService {
  getUserById(userId: string): Promise<User>
  updateUserPreferences(userId: string, preferences: PreferenceProfile): Promise<void>
  getUserPreferences(userId: string): Promise<PreferenceProfile>
  deleteUser(userId: string): Promise<void>
}
```

#### 3. Ghost Entity Service
```typescript
interface GhostEntityService {
  searchGhosts(query: string, filters: SearchFilters): Promise<GhostEntity[]>
  getGhostById(ghostId: string): Promise<GhostEntity>
  getGhostsByCategory(category: string, pagination: PaginationParams): Promise<PaginatedResult<GhostEntity>>
  getRelatedGhosts(ghostId: string): Promise<GhostEntity[]>
}
```

#### 4. Story Service
```typescript
interface StoryService {
  getStoriesByGhostId(ghostId: string): Promise<Story[]>
  getStoryById(storyId: string): Promise<Story>
  updateReadingProgress(userId: string, storyId: string, progress: number): Promise<void>
  getReadingProgress(userId: string, storyId: string): Promise<number>
  markStoryAsRead(userId: string, storyId: string): Promise<void>
}
```

#### 5. Recommendation Service
```typescript
interface RecommendationService {
  getPersonalizedRecommendations(userId: string, limit: number): Promise<Recommendation[]>
  recordInteraction(userId: string, contentId: string, interactionType: InteractionType): Promise<void>
  submitFeedback(userId: string, recommendationId: string, feedback: FeedbackType): Promise<void>
}
```

#### 6. Bookmark Service
```typescript
interface BookmarkService {
  addBookmark(userId: string, contentId: string, contentType: ContentType): Promise<void>
  removeBookmark(userId: string, bookmarkId: string): Promise<void>
  getUserBookmarks(userId: string): Promise<Bookmark[]>
  organizeBookmark(userId: string, bookmarkId: string, tags: string[]): Promise<void>
}
```

### AI Service Layer (Python)

#### 1. Digital Twin Service
```python
class DigitalTwinService:
    def generate_response(self, user_id: str, message: str, context: ConversationContext) -> str
    def get_conversation_history(self, user_id: str, limit: int) -> List[Message]
    def update_user_model(self, user_id: str, interaction_data: InteractionData) -> None
```

#### 2. Recommendation Engine
```python
class RecommendationEngine:
    def generate_recommendations(self, user_id: str, preference_profile: PreferenceProfile, 
                                 interaction_history: List[Interaction]) -> List[Recommendation]
    def update_model(self, user_id: str, feedback: Feedback) -> None
    def get_popular_content(self, category: str, limit: int) -> List[Content]
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `POST /api/auth/reset-password` - Initiate password reset
- `GET /api/auth/validate` - Validate session token

#### User Endpoints
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/preferences` - Update user preferences
- `GET /api/users/:userId/preferences` - Get user preferences
- `DELETE /api/users/:userId` - Delete user account

#### Ghost Entity Endpoints
- `GET /api/ghosts` - Search and browse ghost entities
- `GET /api/ghosts/:ghostId` - Get specific ghost entity
- `GET /api/ghosts/category/:category` - Get ghosts by category
- `GET /api/ghosts/:ghostId/related` - Get related ghost entities

#### Story Endpoints
- `GET /api/stories/ghost/:ghostId` - Get stories for a ghost entity
- `GET /api/stories/:storyId` - Get specific story
- `PUT /api/stories/:storyId/progress` - Update reading progress
- `GET /api/stories/:storyId/progress` - Get reading progress
- `POST /api/stories/:storyId/mark-read` - Mark story as read

#### Recommendation Endpoints
- `GET /api/recommendations` - Get personalized recommendations
- `POST /api/recommendations/interaction` - Record user interaction
- `POST /api/recommendations/feedback` - Submit recommendation feedback

#### Bookmark Endpoints
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:bookmarkId` - Remove bookmark
- `GET /api/bookmarks` - Get user bookmarks
- `PUT /api/bookmarks/:bookmarkId/organize` - Organize bookmark with tags

#### Digital Twin Endpoints
- `POST /api/twin/message` - Send message to digital twin
- `GET /api/twin/history` - Get conversation history

## Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}
```

### Preference Profile Model
```typescript
interface PreferenceProfile {
  userId: string
  favoriteGhostTypes: string[]
  preferredContentTypes: ContentType[]
  culturalInterests: string[]
  spookinessLevel: number // 1-5 scale
  notificationSettings: NotificationSettings
  updatedAt: Date
}

interface NotificationSettings {
  emailNotifications: boolean
  recommendationAlerts: boolean
}

enum ContentType {
  GHOST_ENTITY = 'ghost_entity',
  STORY = 'story',
  MOVIE = 'movie',
  MYTH = 'myth'
}
```

### Ghost Entity Model
```typescript
interface GhostEntity {
  id: string
  name: string
  type: string
  origin: string
  culturalContext: string
  description: string
  characteristics: string[]
  dangerLevel: number // 1-5 scale
  imageUrl: string
  relatedEntityIds: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Story Model
```typescript
interface Story {
  id: string
  title: string
  content: string
  ghostEntityIds: string[]
  origin: string
  culturalContext: string
  estimatedReadingTime: number // in minutes
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Reading Progress Model
```typescript
interface ReadingProgress {
  id: string
  userId: string
  storyId: string
  progressPercentage: number
  lastReadPosition: number // character position
  isCompleted: boolean
  lastReadAt: Date
}
```

### Recommendation Model
```typescript
interface Recommendation {
  id: string
  userId: string
  contentId: string
  contentType: ContentType
  score: number
  reasoning: string
  generatedAt: Date
}

interface Interaction {
  id: string
  userId: string
  contentId: string
  contentType: ContentType
  interactionType: InteractionType
  timestamp: Date
}

enum InteractionType {
  VIEW = 'view',
  CLICK = 'click',
  BOOKMARK = 'bookmark',
  READ = 'read',
  SHARE = 'share'
}

interface Feedback {
  id: string
  userId: string
  recommendationId: string
  feedbackType: FeedbackType
  timestamp: Date
}

enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  NOT_INTERESTED = 'not_interested'
}
```

### Bookmark Model
```typescript
interface Bookmark {
  id: string
  userId: string
  contentId: string
  contentType: ContentType
  tags: string[]
  notes: string
  createdAt: Date
}
```

### Digital Twin Conversation Model
```typescript
interface ConversationMessage {
  id: string
  userId: string
  role: MessageRole
  content: string
  timestamp: Date
}

enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

interface ConversationContext {
  userId: string
  recentMessages: ConversationMessage[]
  userPreferences: PreferenceProfile
  recentInteractions: Interaction[]
}
```

### Session Model
```typescript
interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastActivityAt: Date
}
```

### Database Schema Relationships

```
Users (1) ──── (1) PreferenceProfiles
  │
  ├──── (many) Sessions
  ├──── (many) ReadingProgress
  ├──── (many) Bookmarks
  ├──── (many) Interactions
  ├──── (many) Recommendations
  └──── (many) ConversationMessages

GhostEntities (many) ──── (many) Stories
  │
  └──── (many) Bookmarks

Stories (1) ──── (many) ReadingProgress
  │
  └──── (many) Bookmarks

Recommendations (1) ──── (many) Feedback
```



## Error Handling

### Error Response Format

All API errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId: string
  }
}
```

### Error Categories

#### 1. Authentication Errors (401)
- Invalid credentials
- Expired session token
- Missing authentication token
- Invalid password reset token

#### 2. Authorization Errors (403)
- Insufficient permissions
- Resource access denied
- Account suspended

#### 3. Validation Errors (400)
- Invalid request payload
- Missing required fields
- Invalid data format
- Constraint violations

#### 4. Not Found Errors (404)
- Resource does not exist
- Endpoint not found

#### 5. Conflict Errors (409)
- Duplicate email during registration
- Concurrent modification conflict

#### 6. Rate Limiting Errors (429)
- Too many requests
- API quota exceeded

#### 7. Server Errors (500)
- Database connection failure
- Unexpected system error
- AI service unavailable (503)

### Error Handling Strategy

1. **Logging**: All errors are logged with context including user ID, request ID, timestamp, and stack trace
2. **Transaction Rollback**: Database errors trigger automatic transaction rollback
3. **Graceful Degradation**: AI service failures return cached or default responses when possible
4. **Client Communication**: Error messages are user-friendly while detailed logs are kept server-side
5. **Monitoring**: Critical errors trigger alerts for immediate investigation

### Database Transaction Management

```typescript
async function executeInTransaction<T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await operation(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
```

## Testing Strategy

### Overview

The Ghostypedia Backend employs a comprehensive testing strategy combining unit tests and property-based tests to ensure correctness and reliability.

### Property-Based Testing

Property-based testing will be implemented using **fast-check** for TypeScript/JavaScript code. Each property-based test will:

- Run a minimum of 100 iterations with randomly generated inputs
- Be tagged with a comment referencing the specific correctness property from this design document
- Use the format: `// Feature: ghostypedia-core, Property {number}: {property_text}`
- Verify universal properties that should hold across all valid inputs

### Unit Testing

Unit tests will be implemented using **Jest** as the testing framework. Unit tests will:

- Verify specific examples and edge cases
- Test integration points between services
- Validate error handling and boundary conditions
- Mock external dependencies (database, AI service, email service)

### Test Organization

```
src/
├── services/
│   ├── auth.service.ts
│   ├── auth.service.test.ts          # Unit tests
│   ├── auth.service.property.test.ts # Property-based tests
│   ├── user.service.ts
│   ├── user.service.test.ts
│   └── ...
├── repositories/
│   ├── user.repository.ts
│   ├── user.repository.test.ts
│   └── ...
└── utils/
    ├── validation.ts
    ├── validation.test.ts
    └── ...
```

### Testing Scope

#### Services to Test
- Authentication Service (password hashing, session management)
- User Service (CRUD operations, preference management)
- Ghost Entity Service (search, filtering, pagination)
- Story Service (retrieval, progress tracking)
- Recommendation Service (interaction recording, feedback processing)
- Bookmark Service (CRUD operations, tagging)

#### Integration Points to Test
- Database transactions and rollback behavior
- Redis caching and invalidation
- AI service communication and fallback handling
- Email delivery for password reset

#### Edge Cases to Cover
- Empty search queries
- Invalid pagination parameters
- Concurrent user modifications
- Session expiration scenarios
- AI service timeout/unavailability

### Test Data Management

- Use in-memory PostgreSQL or test database for integration tests
- Use Redis mock for cache testing
- Generate realistic test data using factories
- Clean up test data after each test suite

### Continuous Integration

- All tests must pass before merging code
- Maintain minimum 80% code coverage
- Run property-based tests with increased iterations in CI (500+)
- Performance benchmarks for critical endpoints



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication & Authorization Properties

**Property 1: User registration creates valid accounts**
*For any* valid registration data (email, password, username), when submitted to the registration endpoint, the system should create a user account with properly hashed credentials and return a success response.
**Validates: Requirements 1.1**

**Property 2: Valid credentials produce session tokens**
*For any* existing user with valid credentials, when those credentials are submitted to the login endpoint, the system should return a valid session token that can be used for subsequent authenticated requests.
**Validates: Requirements 1.2**

**Property 3: Protected endpoints reject unauthenticated requests**
*For any* protected API endpoint, when a request is made without a valid session token, the system should return a 401 Unauthorized response.
**Validates: Requirements 1.3**

**Property 4: Valid session tokens grant access**
*For any* protected API endpoint and valid session token, when a request includes the valid token, the system should allow access to the protected resource.
**Validates: Requirements 1.4**

**Property 5: Password reset generates secure tokens**
*For any* registered user email, when a password reset is requested, the system should generate a secure reset token and trigger an email with a reset link.
**Validates: Requirements 1.5**

**Property 6: Sessions expire after timeout period**
*For any* user session, when created, the system should set an expiration time of 24 hours from the last activity.
**Validates: Requirements 9.2**

**Property 7: Passwords are hashed with bcrypt**
*For any* password submitted during registration, the system should store it hashed using bcrypt with at least 10 salt rounds, never storing the plaintext password.
**Validates: Requirements 9.3**

### User Preferences Properties

**Property 8: Preference updates persist correctly**
*For any* user and valid preference data, when preferences are updated, the system should persist the changes to the database and return the updated profile matching the submitted data.
**Validates: Requirements 2.1, 2.2**

**Property 9: Preference updates invalidate recommendation cache**
*For any* user with cached recommendations, when their preferences are updated, the system should invalidate the cached recommendations for that user.
**Validates: Requirements 2.3**

**Property 10: Preference retrieval round-trip**
*For any* user with stored preferences, when those preferences are retrieved, the system should return data that matches what was previously stored.
**Validates: Requirements 2.4**

### Ghost Entity Search & Retrieval Properties

**Property 11: Search returns matching entities**
*For any* search query and collection of ghost entities, when the search is executed, all returned entities should contain the query terms in their searchable fields (name, description, type, origin).
**Validates: Requirements 3.1**

**Property 12: Category filters are respected**
*For any* category filter and collection of ghost entities, when the filter is applied, all returned entities should belong to the selected categories.
**Validates: Requirements 3.2**

**Property 13: Sorting produces ordered results**
*For any* sort parameter (name, type, popularity) and collection of ghost entities, when results are requested with that sort parameter, the returned entities should be ordered according to the specified criteria.
**Validates: Requirements 3.3**

**Property 14: Ghost entity retrieval round-trip**
*For any* ghost entity stored in the database, when retrieved by ID, the system should return all fields including description, origin, characteristics, and related entity IDs matching the stored data.
**Validates: Requirements 3.4**

**Property 15: Large result sets are paginated**
*For any* search or browse request that would return more than 50 entities, the system should return paginated results with metadata including total count, current page, and total pages.
**Validates: Requirements 3.5, 7.5**

### Story & Reading Progress Properties

**Property 16: Ghost entity stories are retrievable**
*For any* ghost entity with associated stories, when stories are requested for that entity ID, the system should return all associated story content.
**Validates: Requirements 4.1**

**Property 17: Reading progress persists correctly**
*For any* user, story, and progress data (percentage, position), when progress is updated, the system should persist both the percentage and last read position to the database.
**Validates: Requirements 4.2**

**Property 18: Story completion updates status**
*For any* user and story, when the story is marked as completed, the system should update the reading progress record with completion status set to true.
**Validates: Requirements 4.3**

**Property 19: Story retrieval round-trip**
*For any* story stored in the database, when retrieved by ID, the system should return complete data including metadata, origin, cultural context, and related entity IDs.
**Validates: Requirements 4.4**

**Property 20: Reading progress round-trip**
*For any* user and story with stored reading progress, when that progress is retrieved, the system should return the current progress percentage and last read position matching what was stored.
**Validates: Requirements 4.5**

### Recommendation Properties

**Property 21: Recommendations align with user preferences**
*For any* user with a defined preference profile, when recommendations are requested, the returned suggestions should include content types and categories that match the user's stated preferences.
**Validates: Requirements 5.1**

**Property 22: Interactions are recorded**
*For any* user interaction with content (view, click, bookmark, read), when the interaction is submitted, the system should persist the interaction record with user ID, content ID, type, and timestamp.
**Validates: Requirements 5.2**

**Property 23: Recommendation feedback persists**
*For any* recommendation and user feedback (like, dislike, not interested), when feedback is submitted, the system should persist the feedback with the recommendation ID and user ID.
**Validates: Requirements 5.3**

**Property 24: Recommendations include diverse content types**
*For any* recommendation request, when recommendations are generated, the results should include multiple content types (ghost entities, stories, movies, myths) when available.
**Validates: Requirements 5.4**

### Digital Twin Properties

**Property 25: Digital twin responds within time limit**
*For any* user message sent to the digital twin endpoint, the system should generate and return a response within 3 seconds.
**Validates: Requirements 6.1**

**Property 26: Digital twin receives user context**
*For any* digital twin request, when calling the AI service, the system should include the user's preference profile and recent interaction history in the request context.
**Validates: Requirements 6.2**

**Property 27: Conversation history is ordered**
*For any* user with conversation history, when that history is retrieved, the messages should be ordered by timestamp in chronological order.
**Validates: Requirements 6.3**

**Property 28: Conversation messages persist**
*For any* message sent to or received from the digital twin, the system should store the message in the database with user ID, role, content, and timestamp.
**Validates: Requirements 6.4**

### Caching & Performance Properties

**Property 29: Repeated requests use cache**
*For any* cacheable endpoint and identical request parameters, when the same request is made multiple times without data changes, subsequent requests should be served from Redis cache rather than querying the database.
**Validates: Requirements 7.2, 7.3**

**Property 30: Cache invalidation is timely**
*For any* cached data that is invalidated due to updates, the cache entry should be removed or updated within 1 second of the invalidation trigger.
**Validates: Requirements 7.4**

**Property 31: API responses include proper status codes**
*For any* API request (successful or failed), the system should return an appropriate HTTP status code (200, 400, 401, 404, 429, 500, etc.) matching the outcome.
**Validates: Requirements 7.1**

### Error Handling & Reliability Properties

**Property 32: Errors are logged with context**
*For any* system error that occurs, the system should log the error with timestamp, stack trace, user ID (if available), and request ID, and return a structured error response to the client.
**Validates: Requirements 8.1**

**Property 33: Failed transactions rollback**
*For any* database transaction that encounters an error, the system should rollback all changes made within that transaction to maintain data consistency.
**Validates: Requirements 8.2**

**Property 34: Concurrent modifications preserve integrity**
*For any* two concurrent requests attempting to modify the same data, the system should use database transactions and locking to ensure both modifications are applied correctly without data corruption.
**Validates: Requirements 8.4**

**Property 35: Rate limiting enforces thresholds**
*For any* API endpoint with rate limiting, when request rates exceed the defined threshold, the system should return 429 status codes and prevent further requests until the rate limit window resets.
**Validates: Requirements 8.5**

### Security Properties

**Property 36: User deletion cascades**
*For any* user with associated data (preferences, bookmarks, sessions, reading progress, interactions), when the user is deleted, the system should cascade delete all associated records from the database.
**Validates: Requirements 9.4**

**Property 37: Malicious inputs are rejected**
*For any* API endpoint receiving user input, when malicious payloads (SQL injection attempts, XSS scripts) are submitted, the system should validate and sanitize the input, rejecting or neutralizing the malicious content.
**Validates: Requirements 9.5**

### Bookmark Properties

**Property 38: Bookmarks persist correctly**
*For any* user and content (ghost entity or story), when a bookmark is created, the system should persist the bookmark with user ID, content ID, content type, and timestamp.
**Validates: Requirements 10.1**

**Property 39: Bookmark retrieval round-trip**
*For any* user with stored bookmarks, when those bookmarks are retrieved, the system should return all bookmarked content with associated metadata matching what was stored.
**Validates: Requirements 10.2**

**Property 40: Bookmark deletion removes records**
*For any* existing bookmark, when deleted, the system should immediately remove the bookmark record from the database such that subsequent retrieval attempts return not found.
**Validates: Requirements 10.3**

**Property 41: Bookmarks create interaction events**
*For any* bookmark creation, the system should also record an interaction event of type "bookmark" for the recommendation engine to use in future suggestions.
**Validates: Requirements 10.4**

**Property 42: Bookmark tag updates persist**
*For any* existing bookmark and new tag data, when tags are updated, the system should persist the tag changes such that subsequent retrieval returns the updated tags.
**Validates: Requirements 10.5**

