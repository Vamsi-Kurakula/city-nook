-- 04_indexes_and_comments.sql
-- Indexes and documentation comments for City Crawler (run this fourth)

-- Indexes for crawl tables
CREATE INDEX IF NOT EXISTS idx_crawl_progress_user_id ON crawl_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_crawl_id ON crawl_progress(crawl_id);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_is_public ON crawl_progress(is_public);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_user_id ON user_crawl_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_crawl_id ON user_crawl_history(crawl_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_is_public ON user_crawl_history(is_public);
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_name ON crawl_definitions(name);
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_is_public ON crawl_definitions(is_public);
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_is_featured ON crawl_definitions(is_featured);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_crawl_definition_id ON crawl_stops(crawl_definition_id);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_stop_number ON crawl_stops(stop_number);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_stop_components ON crawl_stops USING GIN(stop_components);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_2 ON friendships(user_id_2);
CREATE INDEX IF NOT EXISTS idx_friendships_composite ON friendships(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_id ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user_id ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_composite ON friend_requests(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON user_profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_social_notifications_user_id ON social_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_type ON social_notifications(type);

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information synced from Clerk authentication';
COMMENT ON TABLE crawl_progress IS 'Tracks in-progress crawls for each user (only 1 record per user)';
COMMENT ON TABLE user_crawl_history IS 'Stores completed crawl records for statistics and history';
COMMENT ON TABLE public_crawl_signups IS 'Tracks user signups for scheduled public crawls';
COMMENT ON TABLE crawl_definitions IS 'Crawl definitions combining both public and library crawls with metadata and image storage';
COMMENT ON TABLE crawl_stops IS 'Individual stops for each crawl with flexible JSONB components for different stop types';
COMMENT ON COLUMN crawl_progress.completed_stops IS 'Array of completed stop numbers (1-based indexing)';
COMMENT ON COLUMN crawl_progress.current_stop IS 'Current stop number (1-based indexing)';
COMMENT ON COLUMN crawl_progress.completed_at IS 'NULL if crawl is in progress, timestamp when completed';
COMMENT ON COLUMN crawl_progress.is_public IS 'TRUE for public crawls, FALSE for crawl library crawls';
COMMENT ON COLUMN user_crawl_history.is_public IS 'TRUE for public crawls, FALSE for crawl library crawls';
COMMENT ON COLUMN public_crawl_signups.is_public IS 'Always TRUE for public crawl signups';
COMMENT ON COLUMN crawl_definitions.name IS 'Unique identifier for crawl definitions, used for upserts during migration';
COMMENT ON COLUMN crawl_definitions.is_public IS 'TRUE for public crawls, FALSE for crawl library crawls';
COMMENT ON COLUMN crawl_definitions.is_featured IS 'TRUE for featured crawls displayed prominently';
COMMENT ON COLUMN crawl_definitions.hero_image_url IS 'Public Supabase Storage URL for hero image';
COMMENT ON COLUMN crawl_stops.stop_components IS 'JSONB field containing stop-specific data (coordinates, riddle, photo instructions, etc.)';
COMMENT ON COLUMN crawl_stops.stop_number IS '1-based indexing for stop order within a crawl'; 