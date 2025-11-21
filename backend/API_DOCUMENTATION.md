# Ghostypedia Backend API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [User & Preferences](#user--preferences-endpoints)
  - [Ghost Entities](#ghost-entities-endpoints)
  - [Stories](#stories-endpoints)
  - [Bookmarks](#bookmarks-endpoints)
  - [Recommendations](#recommendations-endpoints)
  - [Digital Twin](#digital-twin-endpoints)

---

## Overview

The Ghostypedia Backend API is a RESTful service that provides access to a comprehensive database of ghosts, creatures, myths, and paranormal entities. The API supports user authentication, personalized recommendations, and AI-powered digital twin interactions.

## Base URL

```
http://localhost:3000/api
```

In production, replace with your deployed API URL.

## Authentication

Most endpoints require authentication using Bearer tokens. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

### Protected Endpoints

Endpoints marked with 🔒 require authentication.

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "unique-request-id"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate email) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | AI service unavailable |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default**: 100 requests per 15 minutes per IP address
- **Authentication endpoints**: Stricter limits apply
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

When rate limit is exceeded, the API returns a `429 Too Many Requests` response.

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "ghosthunter"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters, must include uppercase, lowercase, number, and special character
- Username: 3-30 characters, alphanumeric and underscores only

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "ghosthunter",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid input data
- `409 CONFLICT`: Email or username already exists

---

#### POST /api/auth/login

Authenticate user and receive session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "userId": "uuid-here",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid input data
- `401 UNAUTHORIZED`: Invalid email or password

---

#### POST /api/auth/logout 🔒

End user session.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `400 BAD_REQUEST`: Missing authorization header
- `401 UNAUTHORIZED`: Invalid token

---

#### POST /api/auth/reset-password

Request password reset or complete password reset.

**Request Password Reset:**
```json
{
  "email": "user@example.com"
}
```

**Complete Password Reset:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid input data
- `400 BAD_REQUEST`: Invalid or expired reset token

---

#### GET /api/auth/validate 🔒

Validate session token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "username": "ghosthunter"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid or expired token

---

### User & Preferences Endpoints

#### GET /api/users/:userId 🔒

Get user profile. Users can only access their own profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "ghosthunter",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `403 FORBIDDEN`: Attempting to access another user's profile
- `404 NOT_FOUND`: User not found

---

#### GET /api/users/:userId/preferences 🔒

Get user preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "favoriteGhostTypes": ["poltergeist", "banshee", "yokai"],
    "preferredContentTypes": ["ghost_entity", "story", "myth"],
    "culturalInterests": ["japanese", "celtic", "american"],
    "spookinessLevel": 3,
    "notificationSettings": {
      "emailNotifications": true,
      "recommendationAlerts": false
    },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `403 FORBIDDEN`: Attempting to access another user's preferences

---

#### PUT /api/users/:userId/preferences 🔒

Update user preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "favoriteGhostTypes": ["poltergeist", "banshee"],
  "preferredContentTypes": ["ghost_entity", "story"],
  "culturalInterests": ["japanese", "celtic"],
  "spookinessLevel": 4,
  "notificationSettings": {
    "emailNotifications": true,
    "recommendationAlerts": true
  }
}
```

**Validation Rules:**
- `spookinessLevel`: Integer between 1 and 5
- `preferredContentTypes`: Must be valid content types (ghost_entity, story, movie, myth)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "favoriteGhostTypes": ["poltergeist", "banshee"],
    "preferredContentTypes": ["ghost_entity", "story"],
    "culturalInterests": ["japanese", "celtic"],
    "spookinessLevel": 4,
    "notificationSettings": {
      "emailNotifications": true,
      "recommendationAlerts": true
    },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid preference values
- `401 UNAUTHORIZED`: Invalid token
- `403 FORBIDDEN`: Attempting to update another user's preferences

---

#### DELETE /api/users/:userId 🔒

Delete user account and all associated data.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `403 FORBIDDEN`: Attempting to delete another user's account
- `404 NOT_FOUND`: User not found

---

### Ghost Entities Endpoints

#### GET /api/ghosts

Search and browse ghost entities with filters.

**Query Parameters:**
- `query` (string): Search term for name, description, type, or origin
- `categories` (string or array): Filter by categories
- `dangerLevel` (integer): Filter by danger level (1-5)
- `culturalContext` (string): Filter by cultural context
- `tags` (string or array): Filter by tags
- `sortBy` (string): Sort field (name, type, dangerLevel, createdAt)
- `sortOrder` (string): Sort order (asc, desc)
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 50, max: 100)

**Example Request:**
```
GET /api/ghosts?query=poltergeist&dangerLevel=3&sortBy=name&sortOrder=asc&page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Poltergeist",
      "type": "spirit",
      "origin": "German folklore",
      "culturalContext": "European",
      "description": "A type of ghost or spirit that is responsible for physical disturbances...",
      "characteristics": ["noisy", "mischievous", "object manipulation"],
      "dangerLevel": 3,
      "imageUrl": "https://example.com/poltergeist.jpg",
      "relatedEntityIds": ["uuid-1", "uuid-2"],
      "tags": ["german", "spirit", "haunting"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `500 INTERNAL_SERVER_ERROR`: Failed to search ghost entities

---

#### GET /api/ghosts/:ghostId

Get specific ghost entity by ID.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Banshee",
    "type": "spirit",
    "origin": "Irish mythology",
    "culturalContext": "Celtic",
    "description": "A female spirit in Irish mythology who heralds the death of a family member...",
    "characteristics": ["wailing", "omen of death", "female"],
    "dangerLevel": 2,
    "imageUrl": "https://example.com/banshee.jpg",
    "relatedEntityIds": ["uuid-1", "uuid-2"],
    "tags": ["irish", "celtic", "death omen"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 NOT_FOUND`: Ghost entity not found
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch ghost entity

---

#### GET /api/ghosts/category/:category

Get ghosts by category with pagination.

**Path Parameters:**
- `category` (string): Category name

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 50)

**Example Request:**
```
GET /api/ghosts/category/spirit?page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Ghost Name",
      "type": "spirit",
      "origin": "Origin",
      "culturalContext": "Context",
      "description": "Description...",
      "characteristics": ["trait1", "trait2"],
      "dangerLevel": 2,
      "imageUrl": "https://example.com/image.jpg",
      "relatedEntityIds": [],
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2
  }
}
```

**Error Responses:**
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch ghost entities by category

---

#### GET /api/ghosts/:ghostId/related

Get related ghost entities.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Related Ghost",
      "type": "spirit",
      "origin": "Origin",
      "culturalContext": "Context",
      "description": "Description...",
      "characteristics": ["trait1"],
      "dangerLevel": 3,
      "imageUrl": "https://example.com/image.jpg",
      "relatedEntityIds": [],
      "tags": ["tag1"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch related ghost entities

---

### Stories Endpoints

#### GET /api/stories/ghost/:ghostId

Get all stories for a ghost entity.

**Path Parameters:**
- `ghostId` (string): Ghost entity ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "The Haunting of Hill House",
      "content": "Full story content here...",
      "ghostEntityIds": ["uuid-1", "uuid-2"],
      "origin": "American folklore",
      "culturalContext": "American",
      "estimatedReadingTime": 15,
      "tags": ["haunting", "mansion", "horror"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch stories

---

#### GET /api/stories/:storyId

Get a specific story by ID.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "The Legend of Sleepy Hollow",
    "content": "Full story content here...",
    "ghostEntityIds": ["uuid-1"],
    "origin": "American literature",
    "culturalContext": "American",
    "estimatedReadingTime": 20,
    "tags": ["headless horseman", "classic", "halloween"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 NOT_FOUND`: Story not found
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch story

---

#### PUT /api/stories/:storyId/progress 🔒

Update reading progress for a story.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "progressPercentage": 45.5,
  "lastReadPosition": 1234
}
```

**Validation Rules:**
- `progressPercentage`: Number between 0 and 100
- `lastReadPosition`: Non-negative integer

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "storyId": "uuid-here",
    "progressPercentage": 45.5,
    "lastReadPosition": 1234,
    "isCompleted": false,
    "lastReadAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid progress data
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to update reading progress

---

#### GET /api/stories/:storyId/progress 🔒

Get reading progress for a story.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "storyId": "uuid-here",
    "progressPercentage": 45.5,
    "lastReadPosition": 1234,
    "isCompleted": false,
    "lastReadAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `404 NOT_FOUND`: Reading progress not found
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch reading progress

---

#### POST /api/stories/:storyId/mark-read 🔒

Mark a story as completed.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "storyId": "uuid-here",
    "progressPercentage": 100,
    "lastReadPosition": 5678,
    "isCompleted": true,
    "lastReadAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to mark story as read

---

### Bookmarks Endpoints

#### POST /api/bookmarks 🔒

Create a new bookmark.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "contentId": "uuid-here",
  "contentType": "ghost_entity",
  "tags": ["favorite", "research"],
  "notes": "Interesting ghost for my project"
}
```

**Validation Rules:**
- `contentId`: Required, valid UUID
- `contentType`: Required, must be one of: ghost_entity, story, movie, myth
- `tags`: Optional array of strings
- `notes`: Optional string

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "contentId": "uuid-here",
    "contentType": "ghost_entity",
    "tags": ["favorite", "research"],
    "notes": "Interesting ghost for my project",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid bookmark data
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to create bookmark

---

#### GET /api/bookmarks 🔒

Get all bookmarks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "userId": "uuid-here",
      "contentId": "uuid-here",
      "contentType": "ghost_entity",
      "tags": ["favorite", "research"],
      "notes": "Interesting ghost for my project",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-here-2",
      "userId": "uuid-here",
      "contentId": "uuid-here-2",
      "contentType": "story",
      "tags": ["to-read"],
      "notes": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch bookmarks

---

#### DELETE /api/bookmarks/:bookmarkId 🔒

Delete a bookmark.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookmark deleted successfully"
}
```

**Error Responses:**
- `401 UNAUTHORIZED`: Invalid token
- `404 NOT_FOUND`: Bookmark not found
- `500 INTERNAL_SERVER_ERROR`: Failed to delete bookmark

---

#### PUT /api/bookmarks/:bookmarkId/organize 🔒

Update bookmark tags.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tags": ["favorite", "research", "important"]
}
```

**Validation Rules:**
- `tags`: Required, must be an array

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "contentId": "uuid-here",
    "contentType": "ghost_entity",
    "tags": ["favorite", "research", "important"],
    "notes": "Interesting ghost for my project",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid tags data
- `401 UNAUTHORIZED`: Invalid token
- `404 NOT_FOUND`: Bookmark not found
- `500 INTERNAL_SERVER_ERROR`: Failed to organize bookmark

---

### Recommendations Endpoints

#### GET /api/recommendations 🔒

Get personalized recommendations.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (integer): Number of recommendations (default: 10, max: 100)

**Example Request:**
```
GET /api/recommendations?limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "userId": "uuid-here",
      "contentId": "uuid-here",
      "contentType": "ghost_entity",
      "score": 0.95,
      "reasoning": "Based on your interest in Celtic mythology and poltergeists",
      "generatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-here-2",
      "userId": "uuid-here",
      "contentId": "uuid-here-2",
      "contentType": "story",
      "score": 0.87,
      "reasoning": "Similar to stories you've read recently",
      "generatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid limit parameter
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch recommendations

---

#### POST /api/recommendations/interaction 🔒

Record user interaction with content.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "contentId": "uuid-here",
  "contentType": "ghost_entity",
  "interactionType": "view"
}
```

**Validation Rules:**
- `contentId`: Required, valid UUID
- `contentType`: Required, must be one of: ghost_entity, story, movie, myth
- `interactionType`: Required, must be one of: view, click, bookmark, read, share

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "contentId": "uuid-here",
    "contentType": "ghost_entity",
    "interactionType": "view",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "Interaction recorded successfully"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid interaction data
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to record interaction

---

#### POST /api/recommendations/feedback 🔒

Submit recommendation feedback.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recommendationId": "uuid-here",
  "feedbackType": "like"
}
```

**Validation Rules:**
- `recommendationId`: Required, valid UUID
- `feedbackType`: Required, must be one of: like, dislike, not_interested

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid feedback data
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to submit feedback

---

### Digital Twin Endpoints

#### POST /api/twin/message 🔒

Send a message to the digital twin and receive a personalized response.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Tell me about Japanese yokai"
}
```

**Validation Rules:**
- `message`: Required, non-empty string, max 1000 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "Japanese yokai are a class of supernatural entities in Japanese folklore...",
    "contentReferences": [
      {
        "type": "ghost_entity",
        "id": "uuid-here",
        "name": "Kitsune"
      },
      {
        "type": "story",
        "id": "uuid-here-2",
        "title": "The Tale of the Bamboo Cutter"
      }
    ],
    "responseTime": 1250
  }
}
```

**Response Fields:**
- `response`: AI-generated response text
- `contentReferences`: Array of related content (ghost entities, stories) referenced in the response
- `responseTime`: Response generation time in milliseconds

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid message data
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to generate response

---

#### GET /api/twin/history 🔒

Get conversation history with the digital twin.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (integer): Number of messages to retrieve (default: 20, max: 100)

**Example Request:**
```
GET /api/twin/history?limit=50
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "userId": "uuid-here",
      "role": "user",
      "content": "Tell me about Japanese yokai",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-here-2",
      "userId": "uuid-here",
      "role": "assistant",
      "content": "Japanese yokai are a class of supernatural entities...",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ],
  "count": 2
}
```

**Response Fields:**
- `role`: Either "user" or "assistant"
- Messages are ordered by timestamp (oldest to newest)

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid limit parameter
- `401 UNAUTHORIZED`: Invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch conversation history

---

## Additional Notes

### Caching

The API implements Redis caching for improved performance:
- Ghost entity endpoints are cached for 2 hours
- Story endpoints are cached for 2 hours
- Recommendation endpoints are cached for 30 minutes
- User preference endpoints are cached for 1 hour

Cache is automatically invalidated when relevant data is updated.

### Content Types

Valid content types used throughout the API:
- `ghost_entity`: Ghost or paranormal entity
- `story`: Narrative content
- `movie`: Movie recommendation
- `myth`: Mythological content

### Pagination

Endpoints that return lists support pagination with the following parameters:
- `page`: Page number (starts at 1)
- `limit`: Results per page

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Security

- All passwords are hashed using bcrypt with 10+ salt rounds
- Session tokens expire after 24 hours of inactivity
- HTTPS is enforced in production
- Input validation and sanitization prevent SQL injection and XSS attacks
- Rate limiting prevents abuse

---

## Support

For issues or questions, please contact the development team or open an issue in the project repository.
