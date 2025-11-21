"""Simple test script to verify AI service functionality"""
import requests
import json
import sys


def test_health_check(base_url):
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        return False


def test_recommendations(base_url):
    """Test the recommendations endpoint"""
    print("\nTesting recommendations endpoint...")
    
    payload = {
        "user_id": "test_user_123",
        "preference_profile": {
            "favorite_ghost_types": ["poltergeist", "yokai"],
            "preferred_content_types": ["story", "ghost_entity"],
            "cultural_interests": ["japanese", "european"],
            "spookiness_level": 4
        },
        "interaction_history": [],
        "limit": 5
    }
    
    try:
        response = requests.post(
            f"{base_url}/ai/recommendations",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recommendations endpoint passed")
            print(f"   Received {data.get('count', 0)} recommendations")
            return True
        else:
            print(f"❌ Recommendations endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Recommendations endpoint failed: {str(e)}")
        return False


def test_digital_twin(base_url):
    """Test the digital twin endpoint"""
    print("\nTesting digital twin endpoint...")
    
    payload = {
        "user_id": "test_user_123",
        "message": "Tell me about Japanese ghosts",
        "context": {
            "user_preferences": {
                "favorite_ghost_types": ["yokai"],
                "cultural_interests": ["japanese"],
                "spookiness_level": 4
            },
            "recent_messages": [],
            "recent_interactions": []
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/ai/twin/message",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Digital twin endpoint passed")
            print(f"   Response time: {data.get('response_time', 0):.2f}s")
            return True
        else:
            print(f"❌ Digital twin endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Digital twin endpoint failed: {str(e)}")
        return False


def main():
    base_url = "http://localhost:5001"
    
    print("=" * 60)
    print("Ghostypedia AI Service Test Suite")
    print("=" * 60)
    print(f"Testing service at: {base_url}")
    print()
    
    results = []
    results.append(test_health_check(base_url))
    results.append(test_recommendations(base_url))
    results.append(test_digital_twin(base_url))
    
    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("✅ All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
