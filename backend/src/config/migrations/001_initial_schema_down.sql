-- Rollback for Initial Schema Migration

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS recommendation_feedback CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reading_progress CASCADE;
DROP TABLE IF EXISTS story_ghost_entities CASCADE;
DROP TABLE IF EXISTS ghost_entity_relationships CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS ghost_entities CASCADE;
DROP TABLE IF EXISTS conversation_messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS preference_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
