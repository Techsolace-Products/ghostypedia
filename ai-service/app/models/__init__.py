"""Data models for AI service"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum


class ContentType(str, Enum):
    GHOST_ENTITY = 'ghost_entity'
    STORY = 'story'
    MOVIE = 'movie'
    MYTH = 'myth'


@dataclass
class PreferenceProfile:
    user_id: str
    favorite_ghost_types: List[str]
    preferred_content_types: List[str]
    cultural_interests: List[str]
    spookiness_level: int


@dataclass
class Interaction:
    user_id: str
    content_id: str
    content_type: str
    interaction_type: str
    timestamp: str


@dataclass
class ConversationContext:
    user_id: str
    recent_messages: List[Dict[str, Any]]
    user_preferences: Optional[PreferenceProfile]
    recent_interactions: List[Interaction]


@dataclass
class Recommendation:
    content_id: str
    content_type: str
    score: float
    reasoning: str
