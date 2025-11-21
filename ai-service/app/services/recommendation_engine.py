"""Recommendation Engine Service using Google Gemini"""
import google.generativeai as genai
from typing import List, Dict, Any
import json
from app.models import PreferenceProfile, Interaction, Recommendation, ContentType
from app.utils import get_gemini_api_key


class RecommendationEngine:
    def __init__(self):
        """Initialize the recommendation engine with Gemini API"""
        genai.configure(api_key=get_gemini_api_key())
        self.model = genai.GenerativeModel('gemini-pro')
        self.cache = {}
    
    def generate_recommendations(
        self,
        user_id: str,
        preference_profile: Dict[str, Any],
        interaction_history: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations using Gemini API
        
        Args:
            user_id: User identifier
            preference_profile: User's preference data
            interaction_history: List of user interactions
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommendation dictionaries
        """
        # Check cache first
        cache_key = f"{user_id}_{hash(json.dumps(preference_profile, sort_keys=True))}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Handle cold-start for new users
        if not interaction_history or len(interaction_history) == 0:
            recommendations = self._cold_start_recommendations(preference_profile, limit)
        else:
            recommendations = self._personalized_recommendations(
                preference_profile,
                interaction_history,
                limit
            )
        
        # Apply diversity algorithm
        diverse_recommendations = self._ensure_diversity(recommendations)
        
        # Cache the results
        self.cache[cache_key] = diverse_recommendations
        
        return diverse_recommendations
    
    def _cold_start_recommendations(
        self,
        preference_profile: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for new users with no interaction history"""
        favorite_types = preference_profile.get('favorite_ghost_types', [])
        preferred_content = preference_profile.get('preferred_content_types', [])
        cultural_interests = preference_profile.get('cultural_interests', [])
        spookiness = preference_profile.get('spookiness_level', 3)
        
        prompt = f"""You are a paranormal content recommendation expert. Generate {limit} diverse recommendations for a new user with these preferences:

Favorite Ghost Types: {', '.join(favorite_types) if favorite_types else 'None specified'}
Preferred Content Types: {', '.join(preferred_content) if preferred_content else 'All types'}
Cultural Interests: {', '.join(cultural_interests) if cultural_interests else 'General'}
Spookiness Level: {spookiness}/5

Generate recommendations that include a mix of:
- Ghost entities matching their interests
- Stories from their preferred cultures
- Movies and myths appropriate to their spookiness level

For each recommendation, provide:
1. content_id (generate a plausible ID like "ghost_001" or "story_japanese_001")
2. content_type (ghost_entity, story, movie, or myth)
3. score (0.0-1.0)
4. reasoning (brief explanation why this matches their preferences)

Return ONLY a valid JSON array with no additional text."""
        
        try:
            response = self.model.generate_content(prompt)
            recommendations = self._parse_gemini_response(response.text)
            return recommendations[:limit]
        except Exception as e:
            # Fallback to basic recommendations
            return self._fallback_recommendations(preference_profile, limit)
    
    def _personalized_recommendations(
        self,
        preference_profile: Dict[str, Any],
        interaction_history: List[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on user history"""
        favorite_types = preference_profile.get('favorite_ghost_types', [])
        preferred_content = preference_profile.get('preferred_content_types', [])
        spookiness = preference_profile.get('spookiness_level', 3)
        
        # Summarize recent interactions
        recent_content = [
            f"{i.get('content_type', 'unknown')}: {i.get('content_id', 'unknown')} ({i.get('interaction_type', 'view')})"
            for i in interaction_history[-10:]
        ]
        
        prompt = f"""You are a paranormal content recommendation expert. Generate {limit} personalized recommendations based on:

User Preferences:
- Favorite Ghost Types: {', '.join(favorite_types) if favorite_types else 'Various'}
- Preferred Content: {', '.join(preferred_content) if preferred_content else 'All types'}
- Spookiness Level: {spookiness}/5

Recent Activity:
{chr(10).join(recent_content)}

Generate diverse recommendations that:
1. Build on their recent interests
2. Introduce new but related content
3. Match their spookiness comfort level
4. Include multiple content types (ghost_entity, story, movie, myth)

For each recommendation, provide:
1. content_id (generate a plausible ID)
2. content_type (ghost_entity, story, movie, or myth)
3. score (0.0-1.0)
4. reasoning (brief explanation)

Return ONLY a valid JSON array with no additional text."""
        
        try:
            response = self.model.generate_content(prompt)
            recommendations = self._parse_gemini_response(response.text)
            return recommendations[:limit]
        except Exception as e:
            return self._fallback_recommendations(preference_profile, limit)
    
    def _ensure_diversity(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure recommendations include diverse content types"""
        if not recommendations:
            return recommendations
        
        # Group by content type
        by_type = {}
        for rec in recommendations:
            content_type = rec.get('content_type', 'ghost_entity')
            if content_type not in by_type:
                by_type[content_type] = []
            by_type[content_type].append(rec)
        
        # If we have good diversity (3+ types), return as is
        if len(by_type) >= 3:
            return recommendations
        
        # Otherwise, try to balance the types
        diverse_recs = []
        content_types = list(by_type.keys())
        max_per_type = max(3, len(recommendations) // len(content_types))
        
        for content_type in content_types:
            diverse_recs.extend(by_type[content_type][:max_per_type])
        
        return diverse_recs
    
    def _parse_gemini_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse Gemini API response into recommendation list"""
        try:
            # Remove markdown code blocks if present
            text = response_text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            recommendations = json.loads(text)
            
            # Validate structure
            if not isinstance(recommendations, list):
                return []
            
            validated = []
            for rec in recommendations:
                if all(key in rec for key in ['content_id', 'content_type', 'score', 'reasoning']):
                    validated.append(rec)
            
            return validated
        except json.JSONDecodeError:
            return []
    
    def _fallback_recommendations(
        self,
        preference_profile: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Fallback recommendations when AI service fails"""
        favorite_types = preference_profile.get('favorite_ghost_types', ['ghost'])
        
        # Generate basic recommendations based on preferences
        recommendations = []
        content_types = ['ghost_entity', 'story', 'movie', 'myth']
        
        for i in range(limit):
            content_type = content_types[i % len(content_types)]
            ghost_type = favorite_types[i % len(favorite_types)] if favorite_types else 'ghost'
            
            recommendations.append({
                'content_id': f"{content_type}_{ghost_type}_{i}",
                'content_type': content_type,
                'score': 0.7 - (i * 0.05),
                'reasoning': f"Popular {content_type} related to {ghost_type}"
            })
        
        return recommendations
    
    def invalidate_cache(self, user_id: str = None):
        """Invalidate recommendation cache"""
        if user_id:
            # Remove specific user's cache entries
            keys_to_remove = [k for k in self.cache.keys() if k.startswith(user_id)]
            for key in keys_to_remove:
                del self.cache[key]
        else:
            # Clear entire cache
            self.cache.clear()
