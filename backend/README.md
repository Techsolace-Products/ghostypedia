# Ghostypedia Backend

Backend API for Ghostypedia - an AI-powered encyclopedia of ghosts, creatures, myths, and paranormal entities.

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Jest** - Testing framework
- **fast-check** - Property-based testing
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (database, redis, env)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic layer
│   ├── repositories/   # Data access layer
│   ├── models/         # Data models and interfaces
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript output
├── node_modules/       # Dependencies
├── .env.example        # Environment variables template
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── jest.config.js      # Jest testing configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values

### Development

Run the development server with hot reload:
```bash
npm run dev
```

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Running in Production

```bash
npm start
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Type Checking

Check TypeScript types without building:
```bash
npm run lint
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET` - Secret for JWT token signing
- `GEMINI_API_KEY` - Google Gemini API key for AI features

## API Endpoints

Documentation will be added as endpoints are implemented.

## License

ISC
