#!/bin/bash

# Ghostypedia AI Service Setup Script

echo "Setting up Ghostypedia AI Service with uv..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ Error: uv is not installed."
    echo ""
    echo "Install uv with one of these methods:"
    echo "  • macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo "  • Homebrew: brew install uv"
    echo "  • pip: pip install uv"
    echo ""
    echo "Or visit: https://docs.astral.sh/uv/getting-started/installation/"
    exit 1
fi

echo "✅ uv is installed"

# Sync dependencies using uv
echo "Installing dependencies with uv..."
uv sync

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your Google Gemini API key"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "To start the service:"
echo "  1. Edit .env and add your GEMINI_API_KEY"
echo "  2. Run: uv run python app/main.py"
echo ""
echo "Or run tests:"
echo "  uv run python test_service.py"
