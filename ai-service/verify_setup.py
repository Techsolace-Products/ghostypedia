#!/usr/bin/env python3
"""Verify that the AI service setup is correct"""
import sys

def check_imports():
    """Check that all required packages can be imported"""
    print("Checking imports...")
    
    try:
        import flask
        print("  ✅ Flask imported successfully")
    except ImportError as e:
        print(f"  ❌ Flask import failed: {e}")
        return False
    
    try:
        import google.generativeai
        print("  ✅ Google Generative AI imported successfully")
    except ImportError as e:
        print(f"  ❌ Google Generative AI import failed: {e}")
        return False
    
    try:
        import requests
        print("  ✅ Requests imported successfully")
    except ImportError as e:
        print(f"  ❌ Requests import failed: {e}")
        return False
    
    try:
        from dotenv import load_dotenv
        print("  ✅ Python-dotenv imported successfully")
    except ImportError as e:
        print(f"  ❌ Python-dotenv import failed: {e}")
        return False
    
    return True


def check_app_structure():
    """Check that the app structure is correct"""
    print("\nChecking app structure...")
    
    try:
        from app.models import PreferenceProfile, Interaction, Recommendation
        print("  ✅ App models imported successfully")
    except ImportError as e:
        print(f"  ❌ App models import failed: {e}")
        return False
    
    try:
        from app.services.recommendation_engine import RecommendationEngine
        print("  ✅ Recommendation engine imported successfully")
    except ImportError as e:
        print(f"  ❌ Recommendation engine import failed: {e}")
        return False
    
    try:
        from app.services.digital_twin import DigitalTwinService
        print("  ✅ Digital twin service imported successfully")
    except ImportError as e:
        print(f"  ❌ Digital twin service import failed: {e}")
        return False
    
    try:
        from app.utils import get_flask_config
        print("  ✅ App utils imported successfully")
    except ImportError as e:
        print(f"  ❌ App utils import failed: {e}")
        return False
    
    return True


def check_env_file():
    """Check if .env file exists"""
    print("\nChecking environment configuration...")
    import os
    
    if os.path.exists('.env'):
        print("  ✅ .env file exists")
        
        # Check if GEMINI_API_KEY is set
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key and api_key != 'your_google_gemini_api_key_here':
            print("  ✅ GEMINI_API_KEY is configured")
            return True
        else:
            print("  ⚠️  GEMINI_API_KEY not configured in .env")
            print("     Edit .env and add your Google Gemini API key")
            return False
    else:
        print("  ⚠️  .env file not found")
        print("     Run: cp .env.example .env")
        print("     Then edit .env and add your Google Gemini API key")
        return False


def main():
    print("=" * 60)
    print("Ghostypedia AI Service Setup Verification")
    print("=" * 60)
    
    results = []
    results.append(check_imports())
    results.append(check_app_structure())
    env_ok = check_env_file()
    
    print("\n" + "=" * 60)
    
    if all(results):
        print("✅ Setup verification passed!")
        if not env_ok:
            print("\n⚠️  Note: Configure your .env file before running the service")
        print("\nTo start the service:")
        print("  uv run python app/main.py")
        sys.exit(0)
    else:
        print("❌ Setup verification failed")
        print("\nPlease fix the errors above and try again")
        sys.exit(1)


if __name__ == "__main__":
    main()
