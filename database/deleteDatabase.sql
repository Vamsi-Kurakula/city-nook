-- Delete Database Script for City Crawler (updated for split schema)
-- Run this before running the split schema files (01_core_tables.sql, etc.)
-- This script drops all tables, types, functions, triggers, and indexes

-- Drop RLS policies for all tables
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own crawl progress" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own crawl progress" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own crawl progress" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own crawl history" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own crawl history" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own public crawl signups" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own public crawl signups" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own friendships" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own friendships" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own friend requests" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own friend requests" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own blocked users" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own blocked users" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own reports" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own reports" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own notifications" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own notifications" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view crawl definitions" ON ' || r.tablename;
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view crawl stops" ON ' || r.tablename;
  END LOOP;
END $$;

-- Drop triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_crawl_progress_updated_at ON crawl_progress;
DROP TRIGGER IF EXISTS update_crawl_definitions_updated_at ON crawl_definitions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS debug_user_profile(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop types
DROP TYPE IF EXISTS friend_request_status;

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS social_notifications CASCADE;
DROP TABLE IF EXISTS user_reports CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS crawl_stops CASCADE;
DROP TABLE IF EXISTS crawl_definitions CASCADE;
DROP TABLE IF EXISTS public_crawl_signups CASCADE;
DROP TABLE IF EXISTS user_crawl_history CASCADE;
DROP TABLE IF EXISTS crawl_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop indexes (if not dropped with tables)
DROP INDEX IF EXISTS idx_crawl_progress_user_id;
DROP INDEX IF EXISTS idx_crawl_progress_crawl_id;
DROP INDEX IF EXISTS idx_crawl_progress_is_public;
DROP INDEX IF EXISTS idx_user_crawl_history_user_id;
DROP INDEX IF EXISTS idx_user_crawl_history_crawl_id;
DROP INDEX IF EXISTS idx_user_crawl_history_is_public;
DROP INDEX IF EXISTS idx_crawl_definitions_name;
DROP INDEX IF EXISTS idx_crawl_definitions_is_public;
DROP INDEX IF EXISTS idx_crawl_definitions_is_featured;
DROP INDEX IF EXISTS idx_crawl_stops_crawl_definition_id;
DROP INDEX IF EXISTS idx_crawl_stops_stop_number;
DROP INDEX IF EXISTS idx_crawl_stops_stop_components;
DROP INDEX IF EXISTS idx_friendships_user_id_1;
DROP INDEX IF EXISTS idx_friendships_user_id_2;
DROP INDEX IF EXISTS idx_friendships_composite;
DROP INDEX IF EXISTS idx_friend_requests_to_user_id;
DROP INDEX IF EXISTS idx_friend_requests_from_user_id;
DROP INDEX IF EXISTS idx_friend_requests_status;
DROP INDEX IF EXISTS idx_friend_requests_composite;
DROP INDEX IF EXISTS idx_blocked_users_blocker_id;
DROP INDEX IF EXISTS idx_blocked_users_blocked_id;
DROP INDEX IF EXISTS idx_user_profiles_full_name;
DROP INDEX IF EXISTS idx_user_profiles_email;
DROP INDEX IF EXISTS idx_social_notifications_user_id;
DROP INDEX IF EXISTS idx_social_notifications_type;

-- Drop storage policies (if using Supabase Storage)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

-- Drop storage bucket (if using Supabase Storage)
DELETE FROM storage.buckets WHERE id = 'crawl-images';

SELECT 'Database reset completed. Now run the split schema files in order.' AS status; 