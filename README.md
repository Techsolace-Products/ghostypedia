# Ghostypedia

An immersive, AI-powered encyclopedia of ghosts, creatures, myths, and paranormal entities. Ghostypedia blends storytelling, knowledge exploration, and personalized recommendations into one spooky, engaging platform.

## Project Overview

Ghostypedia consists of two main services:

1. **Backend API** (Node.js/TypeScript) - RESTful API handling authentication, data management, and business logic
2. **AI Service** (Python) - AI-powered recommendation engine and digital twin using Google Gemini

## Architecture

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
│                     (Node.js/TypeScript)                     │
│                                                              │
│  - Authentication & Authorization                            │
│  - User & Preferences Management                             │
│  - Ghost Entity Search & Retrieval                           │
│  - Story & Reading Progress                                  │
│  - Bookmark Management                                       │
│  - Recommendation Coordination                               │
└─────────────────────────────────────────────────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────────┐
  │PostgreSQL│      │  Redis   │      │  AI Service  │
  │          │      │          │      │   (Python)   │
  │ (Primary │      │(Sessions,│      │              │
  │   Data)  │      │ Cache,   │      │ - Gemini API │
  │          │      │  Rate    │      │ - Recommend  │
  │          │      │ Limiting)│      │ - Twin Chat  │
  └──────────┘      └──────────┘      └──────────────┘
```

## Tech Stack

### Backend API
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching, sessions, rate limiting
- **Jest** & **fast-check** - Testing
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication

### AI Service
- **Python 3.8+**
- **Flask** - Web framework
- **Google Gemini** - LLM for AI features
- **google-generativeai** - Gemini API client

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.9 or higher
- [uv](https://docs.astral.sh/uv/) - Fast Python package manager
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Quick Start

#### 1. Set up the Backend API

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

See [backend/README.md](backend/README.md) for detailed instructions.

#### 2. Set up the AI Service

```bash
cd ai-service
./setup.sh
# Edit .env and add your GEMINI_API_KEY
uv run python app/main.py
```

See [ai-service/README.md](ai-service/README.md) for detailed instructions.

**Note**: The AI service uses [uv](https://docs.astral.sh/uv/) for fast Python package management. Install it first if you don't have it.

### Database Setup

See [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md) for database schema and migration instructions.

## Development

### Running Services

**Backend API** (default port 3000):
```bash
cd backend
npm run dev
```

**AI Service** (default port 5001):
```bash
cd ai-service
uv run python app/main.py
```

### Testing

**Backend Tests**:
```bash
cd backend
npm test
```

**AI Service Tests**:
```bash
cd ai-service
uv run python test_service.py
```

## Features

### Core Features
- 🔐 User authentication and authorization
- 👤 User preference management
- 👻 Ghost entity search and discovery
- 📖 Story reading and progress tracking
- 🔖 Bookmark management
- 🤖 AI-powered personalized recommendations
- 💬 Digital twin conversational AI

### AI Capabilities
- **Recommendation Engine**: Generates personalized content suggestions based on user preferences and interaction history
- **Digital Twin**: Provides conversational AI guidance about paranormal topics with context awareness
- **Cold-start Handling**: Smart recommendations for new users
- **Content Diversity**: Ensures varied content types in recommendations

## API Documentation

### Backend API Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Ghost Entities**: `/api/ghosts/*`
- **Stories**: `/api/stories/*`
- **Recommendations**: `/api/recommendations/*`
- **Bookmarks**: `/api/bookmarks/*`
- **Digital Twin**: `/api/twin/*`

### AI Service Endpoints

- **Health Check**: `GET /health`
- **Recommendations**: `POST /ai/recommendations`
- **Digital Twin**: `POST /ai/twin/message`

## Project Structure

```
ghostypedia/
├── backend/              # Node.js/TypeScript backend API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Data access
│   │   ├── models/      # Data models
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   └── ...
├── ai-service/          # Python AI service
│   ├── app/
│   │   ├── services/    # AI implementations
│   │   ├── models/      # Data models
│   │   └── utils/       # Utilities
│   └── ...
└── .kiro/
    └── specs/           # Feature specifications
```

## Contributing

This project follows a spec-driven development approach. See `.kiro/specs/ghostypedia-core/` for detailed requirements, design, and implementation tasks.

## License

ISC

## Notes

This project is currently in active development. Features are being implemented according to the specification in `.kiro/specs/ghostypedia-core/`.
