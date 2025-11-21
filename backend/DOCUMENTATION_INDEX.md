# Ghostypedia Backend Documentation Index

Welcome to the Ghostypedia Backend documentation! This index will help you find the information you need.

## 📚 Documentation Files

### [README.md](./README.md)
**Complete setup and installation guide**

Start here if you're setting up the project for the first time. Includes:
- Prerequisites and installation instructions
- Database setup (PostgreSQL)
- Redis setup
- Python AI service setup
- Environment configuration
- Running the application
- Testing instructions
- Troubleshooting guide

### [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Complete API reference**

Comprehensive documentation of all API endpoints. Includes:
- Authentication endpoints
- User and preferences management
- Ghost entities search and retrieval
- Stories and reading progress
- Bookmarks management
- Personalized recommendations
- Digital twin AI interactions
- Request/response examples
- Error codes and handling

### Additional Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Detailed database schema and migration guide
- **[DATABASE_UTILITIES.md](./DATABASE_UTILITIES.md)** - Database utility scripts and commands
- **[SECURITY.md](./SECURITY.md)** - Security best practices and configuration

## 🚀 Quick Start

1. **First Time Setup:**
   - Read [README.md](./README.md) sections:
     - Prerequisites
     - Installation
     - Database Setup
     - Redis Setup
     - Python AI Service Setup
     - Environment Configuration

2. **Running the Application:**
   - Follow [Running the Application](./README.md#running-the-application) section
   - Start AI service first, then backend

3. **Using the API:**
   - Reference [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
   - Start with authentication endpoints
   - Use Bearer tokens for protected endpoints

4. **Testing:**
   - See [Testing](./README.md#testing) section in README
   - Run `npm test` to execute all tests

## 🔍 Find What You Need

### I want to...

**Set up the project**
→ [README.md - Installation](./README.md#installation)

**Configure the database**
→ [README.md - Database Setup](./README.md#database-setup)

**Set up Redis**
→ [README.md - Redis Setup](./README.md#redis-setup)

**Configure the AI service**
→ [README.md - Python AI Service Setup](./README.md#python-ai-service-setup)

**Run the application**
→ [README.md - Running the Application](./README.md#running-the-application)

**Understand the API**
→ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Register a user**
→ [API_DOCUMENTATION.md - POST /api/auth/register](./API_DOCUMENTATION.md#post-apiauthregister)

**Search for ghosts**
→ [API_DOCUMENTATION.md - GET /api/ghosts](./API_DOCUMENTATION.md#get-apighosts)

**Get recommendations**
→ [API_DOCUMENTATION.md - GET /api/recommendations](./API_DOCUMENTATION.md#get-apirecommendations)

**Use the digital twin**
→ [API_DOCUMENTATION.md - POST /api/twin/message](./API_DOCUMENTATION.md#post-apitwinmessage)

**Run tests**
→ [README.md - Testing](./README.md#testing)

**Troubleshoot issues**
→ [README.md - Troubleshooting](./README.md#troubleshooting)

**Understand the project structure**
→ [README.md - Project Structure](./README.md#project-structure)

**See available npm scripts**
→ [README.md - Available Scripts](./README.md#available-scripts)

## 📖 Documentation for Different Roles

### For Developers
1. [README.md](./README.md) - Complete setup guide
2. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
3. [Project Structure](./README.md#project-structure) - Code organization
4. [Testing](./README.md#testing) - Testing guide

### For Frontend Developers
1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All endpoints
2. [Authentication](./API_DOCUMENTATION.md#authentication) - How to authenticate
3. [Error Responses](./API_DOCUMENTATION.md#error-responses) - Error handling
4. [Rate Limiting](./API_DOCUMENTATION.md#rate-limiting) - Rate limit info

### For DevOps/System Administrators
1. [Prerequisites](./README.md#prerequisites) - System requirements
2. [Database Setup](./README.md#database-setup) - Database configuration
3. [Redis Setup](./README.md#redis-setup) - Redis configuration
4. [Environment Configuration](./README.md#environment-configuration) - Environment variables
5. [Troubleshooting](./README.md#troubleshooting) - Common issues

### For QA/Testers
1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All endpoints with examples
2. [Testing](./README.md#testing) - How to run tests
3. [Quick API Test](./README.md#quick-api-test) - Manual testing examples

## 🆘 Getting Help

If you can't find what you're looking for:

1. Check the [Troubleshooting](./README.md#troubleshooting) section
2. Search the documentation files for keywords
3. Review the [Additional Resources](./README.md#additional-resources)
4. Contact the development team

## 📝 Documentation Updates

This documentation is maintained alongside the codebase. When making changes:

- Update README.md for setup/configuration changes
- Update API_DOCUMENTATION.md for API changes
- Keep examples current and accurate
- Add troubleshooting entries for common issues

---

**Last Updated:** 2024
**Version:** 1.0.0
