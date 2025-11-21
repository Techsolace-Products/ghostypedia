# Ghostypedia AI Service

Python-based AI service layer for Ghostypedia, providing recommendation engine and digital twin functionality using Google Gemini.

> **Quick Start**: See [QUICK_START.md](QUICK_START.md) for a 2-minute setup guide!

## Prerequisites

- Python 3.9 or higher
- [uv](https://docs.astral.sh/uv/) - Fast Python package installer and resolver

### Installing uv

If you don't have `uv` installed:

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Homebrew:**
```bash
brew install uv
```

**pip:**
```bash
pip install uv
```

Or visit: https://docs.astral.sh/uv/getting-started/installation/

## Quick Setup

1. Run the setup script:
```bash
./setup.sh
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your Google Gemini API key
```

3. Verify the setup:
```bash
uv run python verify_setup.py
```

4. Run the service:
```bash
uv run python app/main.py
```

The service will start on port 5001 by default.

## Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the service
uv run python app/main.py
```

## Development

### Running the service
```bash
uv run python app/main.py
```

### Running tests
```bash
uv run python test_service.py
```

### Adding dependencies
```bash
uv add package-name
```

### Updating dependencies
```bash
uv sync --upgrade
```

## API Endpoints

### POST /ai/recommendations
Generate personalized content recommendations based on user preferences and interaction history.

### POST /ai/twin/message
Send a message to the user's digital twin and receive a personalized response.

### GET /health
Health check endpoint for service monitoring.

## Project Structure

```
ai-service/
├── app/
│   ├── services/       # AI service implementations
│   ├── models/         # Data models
│   ├── utils/          # Utility functions
│   └── main.py         # Flask application entry point
├── pyproject.toml      # Project configuration and dependencies
├── requirements.txt    # Legacy requirements (for reference)
├── .env.example        # Environment template
└── .env               # Environment configuration (create from .env.example)
```

## Why uv?

This project uses [uv](https://github.com/astral-sh/uv) for Python package management because it's:
- **Fast**: 10-100x faster than pip
- **Reliable**: Consistent dependency resolution
- **Modern**: Built in Rust with modern Python tooling
- **Simple**: Drop-in replacement for pip/venv workflows

For detailed uv usage instructions, see [UV_GUIDE.md](UV_GUIDE.md).
