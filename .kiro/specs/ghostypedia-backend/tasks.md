# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js project with TypeScript configuration
  - Install core dependencies: Express, TypeScript, PostgreSQL client (pg), Redis client, bcrypt, jsonwebtoken
  - Install dev dependencies: Jest, fast-check, ts-node, nodemon, @types packages
  - Configure TypeScript with strict mode and proper module resolution
  - Set up directory structure: src/{routes,services,repositories,models,middleware,utils,config}
  - Create environment configuration file structure (.env.example)
  - _Requirements: All_

- [x] 2. Configure database and caching infrastructure
  - [x] 2.1 Set up PostgreSQL connection pool
    - Create database configuration module with connection pooling
    - Implement connection health check utility
    - Add transaction helper functions
    - _Requirements: 8.2_
  
  - [x] 2.2 Create database schema and migrations
    - Define Users table with email, username, password_hash, timestamps
    - Define PreferenceProfiles table with user_id foreign key
    - Define GhostEntities table with searchable fields
    - Define Stories table with ghost entity relationships (many-to-many)
    - Define ReadingProgress table with user_id and story_id
    - Define Bookmarks table with polymorphic content references
    - Define Interactions table for recommendation tracking
    - Define Recommendations table with feedback relationship
    - Define ConversationMessages table for digital twin history
    - Define Sessions table with expiration tracking
    - Add appropriate indexes for search and foreign keys
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.2, 6.4, 9.2, 10.1_
  
  - [x] 2.3 Set up Redis client and caching utilities
    - Create Redis connection module with error handling
    - Implement cache get/set/delete helper functions
    - Create cache key generation utilities
    - Add cache TTL configuration
    - _Requirements: 7.2, 7.3, 8.5_

- [x] 3. Implement authentication system
  - [x] 3.1 Create authentication service
    - Implement user registration with bcrypt password hashing (10+ salt rounds)
    - Implement login with credential validation and session token generation
    - Implement session validation middleware
    - Implement password reset token generation
    - Implement logout with session cleanup
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 9.3_
  
  - [ ]* 3.2 Write property test for user registration
    - **Property 1: User registration creates valid accounts**
    - **Validates: Requirements 1.1**
  
  - [ ]* 3.3 Write property test for login authentication
    - **Property 2: Valid credentials produce session tokens**
    - **Validates: Requirements 1.2**
  
  - [ ]* 3.4 Write property test for protected endpoint authorization
    - **Property 3: Protected endpoints reject unauthenticated requests**
    - **Property 4: Valid session tokens grant access**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ]* 3.5 Write property test for password hashing
    - **Property 7: Passwords are hashed with bcrypt**
    - **Validates: Requirements 9.3**
  
  - [x] 3.6 Create authentication routes
    - POST /api/auth/register endpoint
    - POST /api/auth/login endpoint
    - POST /api/auth/logout endpoint
    - POST /api/auth/reset-password endpoint
    - GET /api/auth/validate endpoint
    - Add input validation middleware
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 3.7 Implement email service for password reset
    - Configure Nodemailer with SMTP settings
    - Create email template for password reset
    - Implement send email function with error handling
    - _Requirements: 1.5_

- [x] 4. Implement user and preferences management
  - [x] 4.1 Create user service and repository
    - Implement getUserById with caching
    - Implement updateUser with cache invalidation
    - Implement deleteUser with cascade deletion
    - Create user repository with database queries
    - _Requirements: 9.4_
  
  - [x] 4.2 Create preferences service
    - Implement getPreferences with default values for new users
    - Implement updatePreferences with validation
    - Implement cache invalidation on preference updates
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 4.3 Write property test for preference persistence
    - **Property 8: Preference updates persist correctly**
    - **Property 10: Preference retrieval round-trip**
    - **Validates: Requirements 2.1, 2.2, 2.4**
  
  - [ ]* 4.4 Write property test for cache invalidation
    - **Property 9: Preference updates invalidate recommendation cache**
    - **Validates: Requirements 2.3**
  
  - [ ]* 4.5 Write property test for user deletion cascade
    - **Property 36: User deletion cascades**
    - **Validates: Requirements 9.4**
  
  - [x] 4.6 Create user and preferences routes
    - GET /api/users/:userId endpoint
    - PUT /api/users/:userId/preferences endpoint
    - GET /api/users/:userId/preferences endpoint
    - DELETE /api/users/:userId endpoint
    - Add authentication middleware to all routes
    - _Requirements: 2.1, 2.4, 9.4_

- [-] 5. Implement ghost entity system
  - [x] 5.1 Create ghost entity repository
    - Implement searchGhosts with full-text search
    - Implement getGhostById with caching
    - Implement getGhostsByCategory with pagination
    - Implement getRelatedGhosts
    - Add query builder for complex filters
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 5.2 Create ghost entity service
    - Implement search with query parsing and filtering
    - Implement category filtering logic
    - Implement sorting by multiple criteria
    - Implement pagination with metadata generation
    - Add cache management for ghost entities
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [ ]* 5.3 Write property test for search functionality
    - **Property 11: Search returns matching entities**
    - **Validates: Requirements 3.1**
  
  - [ ]* 5.4 Write property test for category filtering
    - **Property 12: Category filters are respected**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.5 Write property test for sorting
    - **Property 13: Sorting produces ordered results**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.6 Write property test for pagination
    - **Property 15: Large result sets are paginated**
    - **Validates: Requirements 3.5, 7.5**
  
  - [ ]* 5.7 Write property test for ghost entity retrieval
    - **Property 14: Ghost entity retrieval round-trip**
    - **Validates: Requirements 3.4**
  
  - [x] 5.8 Create ghost entity routes
    - GET /api/ghosts endpoint with search and filter query params
    - GET /api/ghosts/:ghostId endpoint
    - GET /api/ghosts/category/:category endpoint
    - GET /api/ghosts/:ghostId/related endpoint
    - Add response caching middleware
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement story and reading progress system
  - [x] 7.1 Create story repository
    - Implement getStoriesByGhostId with relationship queries
    - Implement getStoryById with caching
    - Create many-to-many relationship queries for ghost entities
    - _Requirements: 4.1, 4.4_
  
  - [x] 7.2 Create reading progress repository
    - Implement getReadingProgress
    - Implement updateReadingProgress with upsert logic
    - Implement markAsCompleted
    - _Requirements: 4.2, 4.3, 4.5_
  
  - [x] 7.3 Create story service
    - Implement story retrieval with metadata
    - Implement progress tracking logic
    - Add cache management for stories
    - _Requirements: 4.1, 4.4_
  
  - [ ]* 7.4 Write property test for story retrieval
    - **Property 16: Ghost entity stories are retrievable**
    - **Property 19: Story retrieval round-trip**
    - **Validates: Requirements 4.1, 4.4**
  
  - [ ]* 7.5 Write property test for reading progress
    - **Property 17: Reading progress persists correctly**
    - **Property 20: Reading progress round-trip**
    - **Validates: Requirements 4.2, 4.5**
  
  - [ ]* 7.6 Write property test for story completion
    - **Property 18: Story completion updates status**
    - **Validates: Requirements 4.3**
  
  - [x] 7.7 Create story routes
    - GET /api/stories/ghost/:ghostId endpoint
    - GET /api/stories/:storyId endpoint
    - PUT /api/stories/:storyId/progress endpoint (authenticated)
    - GET /api/stories/:storyId/progress endpoint (authenticated)
    - POST /api/stories/:storyId/mark-read endpoint (authenticated)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 8. Implement bookmark system
  - [x] 8.1 Create bookmark repository
    - Implement createBookmark with polymorphic content references
    - Implement getUserBookmarks with content metadata joins
    - Implement deleteBookmark
    - Implement updateBookmarkTags
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [x] 8.2 Create bookmark service
    - Implement bookmark creation with interaction event recording
    - Implement bookmark retrieval with content details
    - Implement tag management
    - _Requirements: 10.1, 10.2, 10.4, 10.5_
  
  - [ ]* 8.3 Write property test for bookmark persistence
    - **Property 38: Bookmarks persist correctly**
    - **Property 39: Bookmark retrieval round-trip**
    - **Validates: Requirements 10.1, 10.2**
  
  - [ ]* 8.4 Write property test for bookmark deletion
    - **Property 40: Bookmark deletion removes records**
    - **Validates: Requirements 10.3**
  
  - [ ]* 8.5 Write property test for bookmark interactions
    - **Property 41: Bookmarks create interaction events**
    - **Validates: Requirements 10.4**
  
  - [ ]* 8.6 Write property test for bookmark tag updates
    - **Property 42: Bookmark tag updates persist**
    - **Validates: Requirements 10.5**
  
  - [x] 8.7 Create bookmark routes
    - POST /api/bookmarks endpoint (authenticated)
    - GET /api/bookmarks endpoint (authenticated)
    - DELETE /api/bookmarks/:bookmarkId endpoint (authenticated)
    - PUT /api/bookmarks/:bookmarkId/organize endpoint (authenticated)
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x] 9. Implement recommendation system
  - [x] 9.1 Create interaction repository
    - Implement recordInteraction with timestamp
    - Implement getUserInteractions with filtering
    - Create interaction type enum
    - _Requirements: 5.2_
  
  - [x] 9.2 Create recommendation repository
    - Implement getRecommendations with user filtering
    - Implement createRecommendation
    - Implement recordFeedback
    - _Requirements: 5.1, 5.3_
  
  - [x] 9.3 Create recommendation service
    - Implement interaction recording logic
    - Implement feedback submission
    - Implement recommendation retrieval with caching
    - Add cache invalidation on preference updates
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 9.4 Write property test for interaction recording
    - **Property 22: Interactions are recorded**
    - **Validates: Requirements 5.2**
  
  - [ ]* 9.5 Write property test for feedback persistence
    - **Property 23: Recommendation feedback persists**
    - **Validates: Requirements 5.3**
  
  - [x] 9.6 Create recommendation routes
    - GET /api/recommendations endpoint (authenticated)
    - POST /api/recommendations/interaction endpoint (authenticated)
    - POST /api/recommendations/feedback endpoint (authenticated)
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Implement Python AI service layer
  - [x] 10.1 Set up Python service structure
    - Initialize Python project with virtual environment
    - Install dependencies: google-generativeai, flask, requests
    - Create service structure: app/{services,models,utils}
    - Configure Google Gemini API credentials
    - _Requirements: 5.1, 6.1_
  
  - [x] 10.2 Create recommendation engine service
    - Implement generate_recommendations function with Gemini API
    - Implement preference-based content filtering
    - Implement diversity algorithm for content types
    - Implement cold-start handling for new users
    - Add response caching
    - _Requirements: 5.1, 5.4_
  
  - [x] 10.3 Create digital twin service
    - Implement generate_response function with Gemini API
    - Implement context building from user preferences and history
    - Implement conversation history management
    - Add response timeout handling (3 second limit)
    - Implement content reference extraction
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 10.4 Create Flask API endpoints
    - POST /ai/recommendations endpoint
    - POST /ai/twin/message endpoint
    - Add request validation
    - Add error handling for API failures
    - _Requirements: 5.1, 6.1_
  
  - [ ]* 10.5 Write property test for recommendation diversity
    - **Property 24: Recommendations include diverse content types**
    - **Validates: Requirements 5.4**
  
  - [ ]* 10.6 Write property test for digital twin response time
    - **Property 25: Digital twin responds within time limit**
    - **Validates: Requirements 6.1**

- [x] 11. Integrate AI service with Express backend
  - [x] 11.1 Create AI service client in Express
    - Implement HTTP client for Python AI service
    - Add retry logic and timeout handling
    - Implement fallback for service unavailability
    - _Requirements: 6.1, 8.3_
  
  - [x] 11.2 Update recommendation service to use AI
    - Integrate AI recommendation engine
    - Pass user preferences and interaction history
    - Handle AI service errors gracefully
    - _Requirements: 5.1, 5.4_
  
  - [x] 11.3 Create digital twin conversation service
    - Implement message sending with context building
    - Implement conversation history retrieval
    - Implement message persistence
    - Add context passing to AI service
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 11.4 Write property test for context passing
    - **Property 26: Digital twin receives user context**
    - **Validates: Requirements 6.2**
  
  - [ ]* 11.5 Write property test for conversation history ordering
    - **Property 27: Conversation history is ordered**
    - **Validates: Requirements 6.3**
  
  - [ ]* 11.6 Write property test for message persistence
    - **Property 28: Conversation messages persist**
    - **Validates: Requirements 6.4**
  
  - [ ]* 11.7 Write property test for recommendation alignment
    - **Property 21: Recommendations align with user preferences**
    - **Validates: Requirements 5.1**
  
  - [x] 11.8 Create digital twin routes
    - POST /api/twin/message endpoint (authenticated)
    - GET /api/twin/history endpoint (authenticated)
    - _Requirements: 6.1, 6.3_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 13. Implement caching and performance optimizations
  - [x] 13.1 Add Redis caching middleware
    - Create cache middleware for GET endpoints
    - Implement cache key generation from request params
    - Add cache TTL configuration per endpoint type
    - Implement cache invalidation helpers
    - _Requirements: 7.2, 7.3_
  
  - [-] 13.2 Implement cache invalidation logic
    - Add cache invalidation on user preference updates
    - Add cache invalidation on content updates
    - Add cache invalidation on bookmark changes
    - Ensure invalidation completes within 1 second
    - _Requirements: 2.3, 7.4_
  
  - [ ]* 13.3 Write property test for caching behavior
    - **Property 29: Repeated requests use cache**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ]* 13.4 Write property test for cache invalidation timing
    - **Property 30: Cache invalidation is timely**
    - **Validates: Requirements 7.4**

- [ ] 14. Implement rate limiting and security
  - [ ] 14.1 Create rate limiting middleware
    - Implement Redis-based rate limiter
    - Configure rate limits per endpoint type
    - Add rate limit headers to responses
    - Return 429 status when limits exceeded
    - _Requirements: 8.5_
  
  - [ ] 14.2 Implement input validation and sanitization
    - Create validation middleware using express-validator
    - Add SQL injection prevention
    - Add XSS prevention with input sanitization
    - Validate all request parameters and body data
    - _Requirements: 9.5_
  
  - [ ]* 14.3 Write property test for rate limiting
    - **Property 35: Rate limiting enforces thresholds**
    - **Validates: Requirements 8.5**
  
  - [ ]* 14.4 Write property test for input sanitization
    - **Property 37: Malicious inputs are rejected**
    - **Validates: Requirements 9.5**
  
  - [ ] 14.5 Add security headers middleware
    - Implement helmet.js for security headers
    - Configure CORS appropriately
    - Add request logging for security auditing
    - _Requirements: 9.1_

- [ ] 15. Implement error handling and logging
  - [ ] 15.1 Create centralized error handler
    - Implement error handling middleware
    - Create structured error response format
    - Add error logging with context (timestamp, stack trace, user ID, request ID)
    - Map error types to HTTP status codes
    - _Requirements: 8.1_
  
  - [ ] 15.2 Implement transaction rollback handling
    - Add transaction wrapper with automatic rollback on errors
    - Test rollback behavior with simulated failures
    - Add logging for transaction failures
    - _Requirements: 8.2_
  
  - [ ]* 15.3 Write property test for error logging
    - **Property 32: Errors are logged with context**
    - **Validates: Requirements 8.1**
  
  - [ ]* 15.4 Write property test for transaction rollback
    - **Property 33: Failed transactions rollback**
    - **Validates: Requirements 8.2**
  
  - [ ]* 15.5 Write property test for concurrent modifications
    - **Property 34: Concurrent modifications preserve integrity**
    - **Validates: Requirements 8.4**
  
  - [ ]* 15.6 Write property test for HTTP status codes
    - **Property 31: API responses include proper status codes**
    - **Validates: Requirements 7.1**

- [ ] 16. Create seed data and database utilities
  - [ ] 16.1 Create database seed script
    - Generate sample ghost entities with varied attributes
    - Generate sample stories linked to ghost entities
    - Create sample user accounts for testing
    - Add sample preferences and interactions
    - _Requirements: 3.1, 4.1_
  
  - [ ] 16.2 Create database migration utilities
    - Implement migration runner
    - Create rollback functionality
    - Add migration versioning
    - _Requirements: All_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Create API documentation
  - [ ] 18.1 Document all API endpoints
    - Document authentication endpoints with request/response examples
    - Document user and preferences endpoints
    - Document ghost entity endpoints with query parameters
    - Document story endpoints
    - Document bookmark endpoints
    - Document recommendation endpoints
    - Document digital twin endpoints
    - Include error response examples
    - _Requirements: All_
  
  - [ ] 18.2 Create README with setup instructions
    - Document environment variables required
    - Document database setup steps
    - Document Redis setup
    - Document Python AI service setup
    - Document how to run the application
    - Document how to run tests
    - _Requirements: All_
