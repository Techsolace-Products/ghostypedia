-- Ghostypedia Database Schema - Initial Migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Preference Profiles table
CREATE TABLE IF NOT EXISTS preference_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_ghost_types TEXT[] DEFAULT '{}',
  preferred_content_types TEXT[] DEFAULT '{}',
  cultural_interests TEXT[] DEFAULT '{}',
  spookiness_level INTEGER DEFAULT 3 CHECK (spookiness_level BETWEEN 1 AND 5),
  email_notifications BOOLEAN DEFAULT true,
  recommendation_alerts BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_preference_profiles_user_id ON preference_profiles(user_id);

-- Ghost Entities table
CREATE TABLE IF NOT EXISTS ghost_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  origin VARCHAR(255),
  cultural_context TEXT,
  description TEXT NOT NULL,
  characteristics TEXT[] DEFAULT '{}',
  danger_level INTEGER DEFAULT 3 CHECK (danger_level BETWEEN 1 AND 5),
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ghost_entities_name ON ghost_entities(name);
CREATE INDEX idx_ghost_entities_type ON ghost_entities(type);
CREATE INDEX idx_ghost_entities_tags ON ghost_entities USING GIN(tags);
CREATE INDEX idx_ghost_entities_search ON ghost_entities USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || type || ' ' || COALESCE(origin, ''))
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  origin VARCHAR(255),
  cultural_context TEXT,
  estimated_reading_time INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stories_title ON stories(title);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);

-- Story-Ghost Entity relationship (many-to-many)
CREATE TABLE IF NOT EXISTS story_ghost_entities (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  ghost_entity_id UUID NOT NULL REFERENCES ghost_entities(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, ghost_entity_id)
);

CREATE INDEX idx_story_ghost_entities_story_id ON story_ghost_entities(story_id);
CREATE INDEX idx_story_ghost_entities_ghost_entity_id ON story_ghost_entities(ghost_entity_id);

-- Ghost Entity relationships (related entities)
CREATE TABLE IF NOT EXISTS ghost_entity_relationships (
  ghost_entity_id UUID NOT NULL REFERENCES ghost_entities(id) ON DELETE CASCADE,
  related_ghost_entity_id UUID NOT NULL REFERENCES ghost_entities(id) ON DELETE CASCADE,
  PRIMARY KEY (ghost_entity_id, related_ghost_entity_id)
);

CREATE INDEX idx_ghost_entity_relationships_ghost_entity_id ON ghost_entity_relationships(ghost_entity_id);
CREATE INDEX idx_ghost_entity_relationships_related_ghost_entity_id ON ghost_entity_relationships(related_ghost_entity_id);

-- Reading Progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  last_read_position INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, story_id)
);

CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_story_id ON reading_progress(story_id);

-- Bookmarks table (polymorphic content references)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('ghost_entity', 'story', 'movie', 'myth')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_content_id ON bookmarks(content_id);
CREATE INDEX idx_bookmarks_content_type ON bookmarks(content_type);

-- Interactions table for recommendation tracking
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('ghost_entity', 'story', 'movie', 'myth')),
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'click', 'bookmark', 'read', 'share')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_content_id ON interactions(content_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('ghost_entity', 'story', 'movie', 'myth')),
  score DECIMAL(3, 2) CHECK (score BETWEEN 0 AND 1),
  reasoning TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_generated_at ON recommendations(generated_at);

-- Recommendation Feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'not_interested')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);

-- Conversation Messages table for digital twin history
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversation_messages_user_id ON conversation_messages(user_id);
CREATE INDEX idx_conversation_messages_timestamp ON conversation_messages(timestamp);

-- Sessions table with expiration tracking
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preference_profiles_updated_at BEFORE UPDATE ON preference_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ghost_entities_updated_at BEFORE UPDATE ON ghost_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
