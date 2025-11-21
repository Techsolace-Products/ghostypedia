# Ghostypedia Backend

Backend API for Ghostypedia - an AI-powered encyclopedia of ghosts, creatures, myths, and paranormal entities.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Python AI Service Setup](#python-ai-service-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- **Node.js** (v18+) with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** (v14+) - Primary database
- **Redis** (v6+) - Caching and session management
- **Jest** - Testing framework
- **fast-check** - Property-based testing
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Python** (3.9+) - AI service layer
- **Google Gemini** - AI/LLM capabilities

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **Redis** v6 or higher ([Download](https://redis.io/download))
- **Python** 3.9 or higher ([Download](https://www.python.org/downloads/))
- **uv** - Python package manager ([Installation Guide](https://docs.astral.sh/uv/getting-started/installation/))

### Installing Prerequisites

**macOS (using Homebrew):**
```bash
# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis

# Install Python
brew install python@3.9

# Install uv
brew install uv
```

**Ubuntu/Debian:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql-14

# Install Redis
sudo apt-get install redis-server
sudo systemctl start redis-server

# Install Python
sudo apt-get install python3.9

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Installation

1. **Clone the repository** (if you haven't already):
```bash
git clone <repository-url>
cd ghostypedia
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE ghostypedia;
CREATE USER ghostypedia_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ghostypedia TO ghostypedia_user;

# Exit psql
\q
```

### 2. Configure Database Connection

Update your `.env` file with database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ghostypedia
DB_USER=ghostypedia_user
DB_PASSWORD=your_secure_password
DB_MAX_CONNECTIONS=20
```

### 3. Run Database Migrations

```bash
# Run all migrations
npm run migrate:up

# Check migration status
npm run migrate:status
```

### 4. Seed Database (Optional)

Populate the database with sample data:
```bash
npm run seed
```

To clear seed data:
```bash
npm run seed:clear
```

To reset (clear and re-seed):
```bash
npm run seed:reset
```

## Redis Setup

### 1. Start Redis Server

**macOS/Linux:**
```bash
redis-server
```

Or if installed via Homebrew:
```bash
brew services start redis
```

### 2. Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### 3. Configure Redis Connection

Update your `.env` file:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Python AI Service Setup

The AI service provides recommendation engine and digital twin functionality.

### 1. Navigate to AI Service Directory

```bash
cd ../ai-service
```

### 2. Run Setup Script

```bash
./setup.sh
```

Or manually:
```bash
uv sync
```

### 3. Configure AI Service

```bash
cp .env.example .env
```

Update `.env` with your Google Gemini API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
FLASK_PORT=5001
FLASK_ENV=development
```

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 4. Verify AI Service Setup

```bash
uv run python verify_setup.py
```

### 5. Start AI Service

```bash
uv run python app/main.py
```

The AI service will start on port 5001 by default.

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ghostypedia
DB_USER=ghostypedia_user
DB_PASSWORD=your_secure_password
DB_MAX_CONNECTIONS=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# Session Configuration
SESSION_TIMEOUT=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5001
AI_SERVICE_TIMEOUT=3000

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@ghostypedia.com

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Cache Configuration
CACHE_TTL_DEFAULT=3600
CACHE_TTL_GHOST_ENTITIES=7200
CACHE_TTL_STORIES=7200
CACHE_TTL_RECOMMENDATIONS=1800

# Logging
LOG_LEVEL=info

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong, random string in production
- Use strong passwords for database and email accounts
- Never commit `.env` files to version control
- Use environment-specific configurations for production

## Running the Application

### Development Mode

**Terminal 1 - Start AI Service:**
```bash
cd ai-service
uv run python app/main.py
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000` with hot reload enabled.

### Production Mode

**Build the application:**
```bash
npm run build
```

**Start the server:**
```bash
npm start
```

### Verify Everything is Running

1. **Backend Health Check:**
```bash
curl http://localhost:3000/api/auth/validate
# Should return 401 (expected without token)
```

2. **AI Service Health Check:**
```bash
curl http://localhost:5001/health
# Should return: {"status": "healthy"}
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- auth.service.test.ts
```

### Type Checking

Check TypeScript types without building:
```bash
npm run lint
```

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # PostgreSQL connection
│   │   ├── redis.ts         # Redis connection
│   │   ├── env.ts           # Environment variables
│   │   ├── migrations/      # Database migrations
│   │   └── schema.sql       # Database schema
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── ghost.routes.ts
│   │   ├── story.routes.ts
│   │   ├── bookmark.routes.ts
│   │   ├── recommendation.routes.ts
│   │   └── digital-twin.routes.ts
│   ├── services/            # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── ghost.service.ts
│   │   ├── story.service.ts
│   │   ├── bookmark.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── digital-twin.service.ts
│   │   └── ai-client.service.ts
│   ├── repositories/        # Data access layer
│   │   ├── user.repository.ts
│   │   ├── ghost.repository.ts
│   │   ├── story.repository.ts
│   │   ├── bookmark.repository.ts
│   │   ├── recommendation.repository.ts
│   │   └── conversation.repository.ts
│   ├── models/              # Data models and interfaces
│   │   └── index.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── cache.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── security.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/               # Utility functions
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── scripts/             # Database scripts
│   │   ├── migrate.ts       # Migration runner
│   │   └── seed.ts          # Seed data
│   └── index.ts             # Application entry point
├── dist/                    # Compiled JavaScript output
├── node_modules/            # Dependencies
├── .env.example             # Environment variables template
├── .env                     # Environment configuration (create from .env.example)
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest testing configuration
├── API_DOCUMENTATION.md     # Complete API documentation
└── README.md                # This file
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check TypeScript types |
| `npm run migrate:up` | Run all pending migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Check migration status |
| `npm run migrate:reset` | Reset all migrations |
| `npm run seed` | Seed database with sample data |
| `npm run seed:clear` | Clear seed data |
| `npm run seed:reset` | Clear and re-seed database |

## API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

Quick links:
- [Authentication Endpoints](./API_DOCUMENTATION.md#authentication-endpoints)
- [User & Preferences Endpoints](./API_DOCUMENTATION.md#user--preferences-endpoints)
- [Ghost Entities Endpoints](./API_DOCUMENTATION.md#ghost-entities-endpoints)
- [Stories Endpoints](./API_DOCUMENTATION.md#stories-endpoints)
- [Bookmarks Endpoints](./API_DOCUMENTATION.md#bookmarks-endpoints)
- [Recommendations Endpoints](./API_DOCUMENTATION.md#recommendations-endpoints)
- [Digital Twin Endpoints](./API_DOCUMENTATION.md#digital-twin-endpoints)

### Quick API Test

After starting the server, test the API:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Search ghosts (no auth required)
curl http://localhost:3000/api/ghosts?query=poltergeist
```

## Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Verify database credentials in `.env`
- Ensure PostgreSQL is running: `pg_isready`
- Check PostgreSQL logs: `tail -f /usr/local/var/log/postgresql@14.log` (macOS)

**Error: "database does not exist"**
- Create the database: `createdb ghostypedia`
- Or use psql: `CREATE DATABASE ghostypedia;`

### Redis Connection Issues

**Error: "Redis connection refused"**
- Verify Redis is running: `redis-cli ping`
- Start Redis: `redis-server` or `brew services start redis`
- Check Redis port in `.env` (default: 6379)

### Migration Issues

**Error: "Migration failed"**
- Check migration status: `npm run migrate:status`
- Reset migrations: `npm run migrate:reset`
- Verify database connection

### AI Service Issues

**Error: "AI service unavailable"**
- Verify AI service is running on port 5001
- Check `AI_SERVICE_URL` in backend `.env`
- Verify Gemini API key is valid
- Check AI service logs

**Error: "Invalid Gemini API key"**
- Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Update `GEMINI_API_KEY` in `ai-service/.env`

### Port Already in Use

**Error: "Port 3000 already in use"**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### TypeScript Compilation Errors

```bash
# Clean build directory
rm -rf dist

# Rebuild
npm run build

# Check for type errors
npm run lint
```

### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- auth.service.test.ts

# Clear Jest cache
npm test -- --clearCache
```

### Common Issues

1. **"Cannot find module"** - Run `npm install`
2. **"Permission denied"** - Use `sudo` or fix file permissions
3. **"Out of memory"** - Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm start`

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Google Gemini API](https://ai.google.dev/docs)

## License

ISC
