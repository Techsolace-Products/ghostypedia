"""Flask application for AI service"""
from flask import Flask, request, jsonify
from app.services.recommendation_engine import RecommendationEngine
from app.services.digital_twin import DigitalTwinService
from app.utils import get_flask_config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize services
recommendation_engine = RecommendationEngine()
digital_twin_service = DigitalTwinService()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'ghostypedia-ai'}), 200


@app.route('/ai/recommendations', methods=['POST'])
def generate_recommendations():
    """
    Generate personalized recommendations
    
    Request body:
    {
        "user_id": "string",
        "preference_profile": {
            "favorite_ghost_types": ["string"],
            "preferred_content_types": ["string"],
            "cultural_interests": ["string"],
            "spookiness_level": int
        },
        "interaction_history": [
            {
                "content_id": "string",
                "content_type": "string",
                "interaction_type": "string",
                "timestamp": "string"
            }
        ],
        "limit": int (optional, default 10)
    }
    """
    try:
        # Validate request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        preference_profile = data.get('preference_profile', {})
        interaction_history = data.get('interaction_history', [])
        limit = data.get('limit', 10)
        
        # Validate limit
        if not isinstance(limit, int) or limit < 1 or limit > 50:
            return jsonify({'error': 'limit must be between 1 and 50'}), 400
        
        # Generate recommendations
        logger.info(f"Generating recommendations for user {user_id}")
        recommendations = recommendation_engine.generate_recommendations(
            user_id=user_id,
            preference_profile=preference_profile,
            interaction_history=interaction_history,
            limit=limit
        )
        
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'count': len(recommendations)
        }), 200
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({
            'error': 'Failed to generate recommendations',
            'details': str(e)
        }), 500


@app.route('/ai/twin/message', methods=['POST'])
def digital_twin_message():
    """
    Send a message to the digital twin
    
    Request body:
    {
        "user_id": "string",
        "message": "string",
        "context": {
            "user_preferences": {
                "favorite_ghost_types": ["string"],
                "cultural_interests": ["string"],
                "spookiness_level": int
            },
            "recent_messages": [
                {
                    "role": "user|assistant",
                    "content": "string",
                    "timestamp": "string"
                }
            ],
            "recent_interactions": [
                {
                    "content_type": "string",
                    "interaction_type": "string"
                }
            ]
        }
    }
    """
    try:
        # Validate request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = data.get('user_id')
        message = data.get('message')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        # Validate message length
        if len(message) > 1000:
            return jsonify({'error': 'message must be 1000 characters or less'}), 400
        
        context = data.get('context', {})
        
        # Generate response
        logger.info(f"Generating digital twin response for user {user_id}")
        result = digital_twin_service.generate_response(
            user_id=user_id,
            message=message,
            context=context
        )
        
        if result['success']:
            return jsonify({
                'user_id': user_id,
                'response': result['response'],
                'content_references': result['content_references'],
                'response_time': result['response_time']
            }), 200
        else:
            # Return error response but with 200 status for graceful degradation
            return jsonify({
                'user_id': user_id,
                'response': result['response'],
                'content_references': [],
                'response_time': result['response_time'],
                'error': result.get('error')
            }), 200
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error generating digital twin response: {str(e)}")
        return jsonify({
            'error': 'Failed to generate response',
            'details': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    config = get_flask_config()
    logger.info(f"Starting AI service on port {config['port']}")
    app.run(
        host='0.0.0.0',
        port=config['port'],
        debug=config['debug']
    )
