# Quick Start Guide

Get the Ghostypedia AI Service running in under 2 minutes!

## Prerequisites

- Python 3.9+
- [uv](https://docs.astral.sh/uv/) installed

## Install uv (if needed)

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Homebrew:**
```bash
brew install uv
```

## Setup & Run

```bash
# 1. Install dependencies
uv sync

# 2. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Verify setup
uv run python verify_setup.py

# 4. Start the service
uv run python app/main.py
```

That's it! The service will be running on http://localhost:5001

## Test the Service

```bash
# In another terminal
uv run python test_service.py
```

## Common Commands

```bash
# Run the service
uv run python app/main.py

# Run tests
uv run python test_service.py

# Verify setup
uv run python verify_setup.py

# Add a dependency
uv add package-name

# Update dependencies
uv sync --upgrade
```

## API Endpoints

- **Health Check**: `GET http://localhost:5001/health`
- **Recommendations**: `POST http://localhost:5001/ai/recommendations`
- **Digital Twin**: `POST http://localhost:5001/ai/twin/message`

## Need Help?

- [README.md](README.md) - Full documentation
- [UV_GUIDE.md](UV_GUIDE.md) - Detailed uv usage
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical details

## Get Your Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```
