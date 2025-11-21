"""Digital Twin Service using Google Gemini"""
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import time
import re
from app.models import ConversationContext, PreferenceProfile
from app.utils import get_gemini_api_key


class DigitalTwinService:
    def __init__(self):
        """Initialize the digital twin service with Gemini API"""
        genai.configure(api_key=get_gemini_api_key())
        self.model = genai.GenerativeModel('gemini-pro')
        self.response_timeout = 3.0  # 3 second timeout
    
    def generate_response(
        self,
        user_id: str,
        message: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a personalized response from the digital twin
        
        Args:
            user_id: User identifier
            message: User's message
            context: Conversation context including preferences and history
            
        Returns:
            Dictionary with response and metadata
        """
        start_time = time.time()
        
        try:
            # Build context for the AI
            system_context = self._build_context(context)
            
            # Create the prompt
            prompt = self._create_prompt(message, system_context)
            
            # Generate response with timeout handling
            response = self._generate_with_timeout(prompt)
            
            # Extract content references
            content_refs = self._extract_content_references(response)
            
            elapsed_time = time.time() - start_time
            
            return {
                'response': response,
                'content_references': content_refs,
                'response_time': elapsed_time,
                'success': True
            }
        
        except TimeoutError:
            return {
                'response': "I'm taking a bit longer to think about that. Could you rephrase your question?",
                'content_references': [],
                'response_time': self.response_timeout,
                'success': False,
                'error': 'timeout'
            }
        except Exception as e:
            return {
                'response': "I'm having trouble connecting right now. Please try again in a moment.",
                'content_references': [],
                'response_time': time.time() - start_time,
                'success': False,
                'error': str(e)
            }
    
    def _build_context(self, context: Dict[str, Any]) -> str:
        """Build context string from user preferences and history"""
        context_parts = []
        
        # Add user preferences
        preferences = context.get('user_preferences', {})
        if preferences:
            favorite_types = preferences.get('favorite_ghost_types', [])
            cultural_interests = preferences.get('cultural_interests', [])
            spookiness = preferences.get('spookiness_level', 3)
            
            context_parts.append("User Preferences:")
            if favorite_types:
                context_parts.append(f"- Interested in: {', '.join(favorite_types)}")
            if cultural_interests:
                context_parts.append(f"- Cultural interests: {', '.join(cultural_interests)}")
            context_parts.append(f"- Comfort with spookiness: {spookiness}/5")
        
        # Add recent conversation history
        recent_messages = context.get('recent_messages', [])
        if recent_messages:
            context_parts.append("\nRecent Conversation:")
            for msg in recent_messages[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                context_parts.append(f"{role.capitalize()}: {content[:100]}")
        
        # Add recent interactions
        recent_interactions = context.get('recent_interactions', [])
        if recent_interactions:
            context_parts.append("\nRecent Activity:")
            for interaction in recent_interactions[-5:]:
                content_type = interaction.get('content_type', 'content')
                interaction_type = interaction.get('interaction_type', 'viewed')
                context_parts.append(f"- {interaction_type} {content_type}")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, user_message: str, system_context: str) -> str:
        """Create the full prompt for Gemini"""
        prompt = f"""You are a knowledgeable and friendly digital twin guide for Ghostypedia, an encyclopedia of ghosts, creatures, myths, and paranormal entities. Your role is to:

1. Help users discover fascinating paranormal content
2. Answer questions about ghosts, myths, and supernatural beings
3. Provide personalized recommendations based on their interests
4. Share interesting stories and folklore
5. Be engaging, slightly mysterious, but always helpful

When referencing specific content, use this format:
- For ghost entities: [GHOST:entity_id]
- For stories: [STORY:story_id]
- For movies: [MOVIE:movie_id]
- For myths: [MYTH:myth_id]

{system_context}

User Message: {user_message}

Respond in a conversational, engaging way. Keep responses concise (2-3 paragraphs max). If you reference specific content, include the appropriate tags."""
        
        return prompt
    
    def _generate_with_timeout(self, prompt: str) -> str:
        """Generate response with timeout handling"""
        start_time = time.time()
        
        # Configure generation with timeout considerations
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=500,  # Limit response length for faster generation
            temperature=0.7,
        )
        
        response = self.model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        elapsed = time.time() - start_time
        
        if elapsed > self.response_timeout:
            raise TimeoutError("Response generation exceeded timeout")
        
        return response.text
    
    def _extract_content_references(self, response: str) -> List[Dict[str, str]]:
        """Extract content references from the response"""
        references = []
        
        # Pattern to match [TYPE:id] format
        pattern = r'\[(GHOST|STORY|MOVIE|MYTH):([^\]]+)\]'
        matches = re.findall(pattern, response)
        
        for content_type, content_id in matches:
            references.append({
                'content_type': content_type.lower() + ('_entity' if content_type == 'GHOST' else ''),
                'content_id': content_id
            })
        
        return references
    
    def get_conversation_history(
        self,
        user_id: str,
        messages: List[Dict[str, Any]],
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get conversation history for a user
        
        Args:
            user_id: User identifier
            messages: List of conversation messages
            limit: Maximum number of messages to return
            
        Returns:
            List of messages ordered by timestamp
        """
        # Sort messages by timestamp
        sorted_messages = sorted(
            messages,
            key=lambda m: m.get('timestamp', ''),
            reverse=False
        )
        
        # Return the most recent messages up to limit
        return sorted_messages[-limit:] if len(sorted_messages) > limit else sorted_messages
    
    def update_user_model(
        self,
        user_id: str,
        interaction_data: Dict[str, Any]
    ) -> None:
        """
        Update the user model based on new interaction data
        
        This is a placeholder for future implementation where we might
        fine-tune or adjust the model based on user feedback
        
        Args:
            user_id: User identifier
            interaction_data: New interaction information
        """
        # Future implementation: Could store user-specific context
        # or preferences that influence future responses
        pass
