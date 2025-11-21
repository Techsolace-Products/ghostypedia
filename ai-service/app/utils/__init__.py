"""Utility functions for AI service"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_gemini_api_key() -> str:
    """Get Google Gemini API key from environment"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    return api_key


def get_flask_config() -> dict:
    """Get Flask configuration from environment"""
    return {
        'port': int(os.getenv('FLASK_PORT', 5001)),
        'debug': os.getenv('FLASK_ENV', 'development') == 'development'
    }
