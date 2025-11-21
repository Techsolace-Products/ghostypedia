# AI Service Implementation

This document describes the implementation of the Ghostypedia AI Service Layer.

## Overview

The AI Service is a Python-based Flask application that provides two main AI-powered features:
1. **Recommendation Engine** - Generates personalized content recommendations
2. **Digital Twin** - Provides conversational AI guidance about paranormal topics

Both features are powered by Google Gemini API.

## Implementation Details

### 1. Project Structure

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                          # Flask application and API endpoints
│   ├── models/
│   │   └── __init__.py                  # Data models (PreferenceProfile, Interaction, etc.)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_engine.py     # Recommendation generation logic
│   │   └── digital_twin.py              # Digital twin conversation logic
│   └── utils/
│       └── __init__.py                  # Utility functions (config, API key management)
├── requirements.txt                      # Python dependencies
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules
├── README.md                            # Service documentation
├── setup.sh                             # Setup script
└── test_service.py                      # Integration test script
```

### 2. Recommendation Engine (`recommendation_engine.py`)

**Key Features:**
- Generates personalized recommendations using Gemini API
- Implements preference-based content filtering
- Handles cold-start scenarios for new users
- Ensures content diversity across types (ghost_entity, story, movie, myth)
- Includes response caching for performance

**Main Methods:**
- `generate_recommendations()` - Main entry point for recommendation generation
- `_cold_start_recommendations()` - Handles new users with no interaction history
- `_personalized_recommendations()` - Generates recommendations based on user history
- `_ensure_diversity()` - Ensures diverse content types in results
- `_fallback_recommendations()` - Provides basic recommendations when AI service fails

**Validation:**
- Validates Requirements 5.1 (personalized recommendations)
- Validates Requirements 5.4 (diverse content types)

### 3. Digital Twin Service (`digital_twin.py`)

**Key Features:**
- Generates contextually relevant responses using Gemini API
- Builds context from user preferences and conversation history
- Implements 3-second response timeout
- Extracts content references from responses
- Manages conversation history

**Main Methods:**
- `generate_response()` - Main entry point for generating responses
- `_build_context()` - Builds context string from user data
- `_create_prompt()` - Creates the full prompt for Gemini
- `_generate_with_timeout()` - Generates response with timeout handling
- `_extract_content_references()` - Extracts [TYPE:id] references from responses
- `get_conversation_history()` - Retrieves and orders conversation history

**Content Reference Format:**
- `[GHOST:entity_id]` - Ghost entity references
- `[STORY:story_id]` - Story references
- `[MOVIE:movie_id]` - Movie references
- `[MYTH:myth_id]` - Myth references

**Validation:**
- Validates Requirements 6.1 (response generation within 3 seconds)
- Validates Requirements 6.2 (context building)
- Validates Requirements 6.5 (content reference extraction)

### 4. Flask API Endpoints (`main.py`)

**Endpoints:**

#### `GET /health`
Health check endpoint for service monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "ghostypedia-ai"
}
```

#### `POST /ai/recommendations`
Generate personalized recommendations.

**Request:**
```json
{
  "user_id": "string",
  "preference_profile": {
    "favorite_ghost_types": ["string"],
    "preferred_content_types": ["string"],
    "cultural_interests": ["string"],
    "spookiness_level": 1-5
  },
  "interaction_history": [
    {
      "content_id": "string",
      "content_type": "string",
      "interaction_type": "string",
      "timestamp": "string"
    }
  ],
  "limit": 10
}
```

**Response:**
```json
{
  "user_id": "string",
  "recommendations": [
    {
      "content_id": "string",
      "content_type": "string",
      "score": 0.0-1.0,
      "reasoning": "string"
    }
  ],
  "count": 10
}
```

**Validation:**
- Validates Requirements 5.1 (recommendation generation)

#### `POST /ai/twin/message`
Send a message to the digital twin.

**Request:**
```json
{
  "user_id": "string",
  "message": "string",
  "context": {
    "user_preferences": {
      "favorite_ghost_types": ["string"],
      "cultural_interests": ["string"],
      "spookiness_level": 1-5
    },
    "recent_messages": [
      {
        "role": "user|assistant",
        "content": "string",
        "timestamp": "string"
      }
    ],
    "recent_interactions": [
      {
        "content_type": "string",
        "interaction_type": "string"
      }
    ]
  }
}
```

**Response:**
```json
{
  "user_id": "string",
  "response": "string",
  "content_references": [
    {
      "content_type": "string",
      "content_id": "string"
    }
  ],
  "response_time": 0.0
}
```

**Validation:**
- Validates Requirements 6.1 (digital twin responses)

### 5. Error Handling

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

**Error Handling Strategy:**
- Input validation with appropriate 400 responses
- Graceful degradation for AI service failures
- Timeout handling for slow responses
- Fallback recommendations when Gemini API fails
- Comprehensive logging for debugging

### 6. Configuration

**Environment Variables:**
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `FLASK_PORT` - Service port (default: 5001)
- `FLASK_ENV` - Environment (development/production)

**Configuration Management:**
- Environment variables loaded via `python-dotenv`
- Configuration utilities in `app/utils/__init__.py`
- Secure API key management

## Testing

### Manual Testing

Use the provided test script:
```bash
python test_service.py
```

This tests:
- Health check endpoint
- Recommendations endpoint
- Digital twin endpoint

### Integration Testing

The service is designed to integrate with the Express.js backend. The backend will:
1. Call `/ai/recommendations` when users request recommendations
2. Call `/ai/twin/message` when users interact with the digital twin
3. Handle caching and persistence of results

## Performance Considerations

### Recommendation Engine
- **Caching**: Recommendations are cached based on user_id and preference hash
- **Timeout**: No explicit timeout (relies on Gemini API defaults)
- **Fallback**: Provides basic recommendations if AI service fails

### Digital Twin
- **Timeout**: 3-second hard limit on response generation
- **Token Limit**: Max 500 output tokens for faster responses
- **Context Management**: Only includes last 5 messages and interactions

## Security Considerations

1. **API Key Protection**: Gemini API key stored in environment variables
2. **Input Validation**: All endpoints validate input data
3. **Message Length Limits**: Digital twin messages limited to 1000 characters
4. **Error Handling**: Sensitive error details not exposed to clients

## Future Enhancements

1. **User Model Persistence**: Store user-specific AI model adjustments
2. **Advanced Caching**: Redis-based caching for better performance
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Monitoring**: Add metrics and monitoring for AI service performance
5. **A/B Testing**: Support for testing different recommendation strategies
6. **Fine-tuning**: Custom model fine-tuning based on user feedback

## Requirements Validation

This implementation validates the following requirements:

- ✅ **Requirement 5.1**: Personalized recommendations based on preferences
- ✅ **Requirement 5.4**: Diverse content types in recommendations
- ✅ **Requirement 6.1**: Digital twin responses within 3 seconds
- ✅ **Requirement 6.2**: Context building from preferences and history
- ✅ **Requirement 6.5**: Content reference extraction

## Dependencies

- `google-generativeai>=0.3.2` - Google Gemini API client
- `flask>=3.0.0` - Web framework
- `requests>=2.31.0` - HTTP client (for testing)
- `python-dotenv>=1.0.0` - Environment variable management

## Package Management

This project uses [uv](https://github.com/astral-sh/uv) for Python package management:
- **10-100x faster** than pip
- Consistent dependency resolution
- Built-in virtual environment management
- Drop-in replacement for pip/venv

### Common Commands

```bash
# Install dependencies
uv sync

# Add a new dependency
uv add package-name

# Run the service
uv run python app/main.py

# Run tests
uv run python test_service.py
```

## Deployment Notes

1. Ensure Python 3.9+ is installed
2. Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. Run setup: `./setup.sh`
4. Configure environment variables in .env
5. Run with `uv run python app/main.py`
6. Service listens on port 5001 by default
7. Backend API should be configured to communicate with this service

## Troubleshooting

**Issue**: "GEMINI_API_KEY not found"
- **Solution**: Ensure .env file exists and contains valid API key

**Issue**: Slow response times
- **Solution**: Check network connectivity to Google Gemini API

**Issue**: Empty recommendations
- **Solution**: Check Gemini API response parsing in logs

**Issue**: Digital twin timeout
- **Solution**: Responses are limited to 3 seconds; consider simplifying prompts
