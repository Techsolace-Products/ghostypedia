# Ghostypedia Docker Deployment

This directory contains Docker configuration for deploying Ghostypedia services.

## Structure

```
deployment/
├── docker-compose.yml       # Orchestration configuration
├── backend.Dockerfile       # Backend API container
├── ai-service.Dockerfile    # AI service container
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Services

- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 cache and session store
- **backend**: Express.js API (TypeScript)
- **ai-service**: Python AI service with Gemini integration

## Quick Start

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   - Set secure passwords for PostgreSQL and Redis
   - Add your Gemini API key
   - Configure JWT secret
   - Adjust ports if needed

3. **Build and start services**:
   ```bash
   docker-compose up -d
   ```

4. **Check service health**:
   ```bash
   docker-compose ps
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

## Individual Service Commands

### Start specific service
```bash
docker-compose up -d postgres
docker-compose up -d redis
docker-compose up -d backend
docker-compose up -d ai-service
```

### Rebuild service
```bash
docker-compose build backend
docker-compose up -d backend
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes data)
```bash
docker-compose down -v
```

## Database Migrations

Run migrations after first startup:
```bash
docker-compose exec backend npm run migrate
```

## Accessing Services

- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Health Checks

All services include health checks:
- Backend: `GET /health`
- AI Service: `GET /health`
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

## Production Considerations

1. **Security**:
   - Change all default passwords
   - Use strong JWT secrets
   - Configure firewall rules
   - Enable SSL/TLS for external connections

2. **Volumes**:
   - Data persists in Docker volumes
   - Backup volumes regularly
   - Consider external volume mounts for production

3. **Networking**:
   - Services communicate via internal network
   - Only necessary ports are exposed
   - Consider using reverse proxy (nginx) for production

4. **Monitoring**:
   - Add logging aggregation
   - Set up monitoring (Prometheus, Grafana)
   - Configure alerts for service failures

## Troubleshooting

### Services won't start
```bash
docker-compose logs [service-name]
```

### Database connection issues
- Verify PostgreSQL is healthy: `docker-compose ps postgres`
- Check connection string in backend logs
- Ensure schema.sql was loaded

### Redis connection issues
- Verify Redis is healthy: `docker-compose ps redis`
- Check Redis password matches in .env

### Rebuild from scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Development vs Production

For development, you may want to:
- Mount source code as volumes for hot-reload
- Expose additional ports for debugging
- Use development environment variables

For production:
- Use the configuration as-is
- Add reverse proxy (nginx/traefik)
- Configure SSL certificates
- Set up automated backups
- Enable monitoring and logging
