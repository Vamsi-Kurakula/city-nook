-- Delete Database Script for City Crawler (Complete Reset)
-- Run this to completely wipe the database before running the schema files
-- This script drops all tables, types, functions, triggers, indexes, and policies

-- Disable RLS on all tables first
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE ' || r.tablename || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- Drop ALL RLS policies for all tables (comprehensive cleanup)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    -- Drop all possible policy names we might have created
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view other user profiles for social features" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own crawl progress" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own crawl progress" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own crawl progress" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own crawl history" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own crawl history" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own public crawl signups" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own public crawl signups" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own friendships" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own friendships" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own friend requests" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own friend requests" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update friend requests they received" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own blocked users" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own blocked users" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own reports" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own reports" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own notifications" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own notifications" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view crawl definitions" ON ' || r.tablename || ' CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view crawl stops" ON ' || r.tablename || ' CASCADE';
  END LOOP;
END $$;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles CASCADE;
DROP TRIGGER IF EXISTS update_crawl_progress_updated_at ON crawl_progress CASCADE;
DROP TRIGGER IF EXISTS update_crawl_definitions_updated_at ON crawl_definitions CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS debug_user_profile(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_id_from_jwt() CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS friend_request_status CASCADE;

-- Drop all tables (in dependency order to avoid foreign key constraints)
DROP TABLE IF EXISTS social_notifications CASCADE;
DROP TABLE IF EXISTS user_reports CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS crawl_stops CASCADE;
DROP TABLE IF EXISTS public_crawl_signups CASCADE;
DROP TABLE IF EXISTS user_crawl_history CASCADE;
DROP TABLE IF EXISTS crawl_progress CASCADE;
DROP TABLE IF EXISTS crawl_definitions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop all indexes (if not dropped with tables)
DROP INDEX IF EXISTS idx_crawl_progress_user_id CASCADE;
DROP INDEX IF EXISTS idx_crawl_progress_crawl_id CASCADE;
DROP INDEX IF EXISTS idx_crawl_progress_is_public CASCADE;
DROP INDEX IF EXISTS idx_user_crawl_history_user_id CASCADE;
DROP INDEX IF EXISTS idx_user_crawl_history_crawl_id CASCADE;
DROP INDEX IF EXISTS idx_user_crawl_history_is_public CASCADE;
DROP INDEX IF EXISTS idx_crawl_definitions_name CASCADE;
DROP INDEX IF EXISTS idx_crawl_definitions_is_public CASCADE;
DROP INDEX IF EXISTS idx_crawl_definitions_is_featured CASCADE;
DROP INDEX IF EXISTS idx_crawl_stops_crawl_definition_id CASCADE;
DROP INDEX IF EXISTS idx_crawl_stops_stop_number CASCADE;
DROP INDEX IF EXISTS idx_crawl_stops_stop_components CASCADE;
DROP INDEX IF EXISTS idx_friendships_user_id_1 CASCADE;
DROP INDEX IF EXISTS idx_friendships_user_id_2 CASCADE;
DROP INDEX IF EXISTS idx_friendships_composite CASCADE;
DROP INDEX IF EXISTS idx_friend_requests_to_user_id CASCADE;
DROP INDEX IF EXISTS idx_friend_requests_from_user_id CASCADE;
DROP INDEX IF EXISTS idx_friend_requests_status CASCADE;
DROP INDEX IF EXISTS idx_friend_requests_composite CASCADE;
DROP INDEX IF EXISTS idx_blocked_users_blocker_id CASCADE;
DROP INDEX IF EXISTS idx_blocked_users_blocked_id CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_full_name CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_email CASCADE;
DROP INDEX IF EXISTS idx_social_notifications_user_id CASCADE;
DROP INDEX IF EXISTS idx_social_notifications_type CASCADE;

-- Drop storage policies (if using Supabase Storage)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Public Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects CASCADE;

-- Drop storage buckets and objects
DO $$ 
BEGIN
  -- Delete all objects from crawl-images bucket
  DELETE FROM storage.objects WHERE bucket_id = 'crawl-images';
  
  -- Delete the bucket itself
  DELETE FROM storage.buckets WHERE id = 'crawl-images';
  
  -- Delete any other buckets we might have created
  DELETE FROM storage.buckets WHERE id LIKE '%crawl%';
  DELETE FROM storage.buckets WHERE id LIKE '%city%';
END $$;

-- Clean up any remaining auth-related data (if needed)
-- Note: This is optional and depends on your setup
-- DELETE FROM auth.users WHERE email LIKE '%test%';

-- Reset sequences (if any were created)
-- Note: This is optional and depends on your setup
-- ALTER SEQUENCE IF EXISTS user_profiles_user_profile_id_seq RESTART WITH 1;

-- Final cleanup - drop any remaining objects
DO $$ DECLARE r RECORD;
BEGIN
  -- Drop any remaining functions
  FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.proname || ' CASCADE';
  END LOOP;
  
  -- Drop any remaining triggers
  FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))) LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON ALL TABLES CASCADE';
  END LOOP;
END $$;

-- Verify cleanup
SELECT 
  'Database reset completed successfully!' AS status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') AS remaining_tables,
  (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) AS remaining_functions,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))) AS remaining_triggers;

-- Instructions for next steps
SELECT 'Next steps:' AS instruction;
SELECT '1. Run 01_core_tables.sql' AS step;
SELECT '2. Run 02_social_tables.sql' AS step;
SELECT '3. Run 03_functions_and_triggers.sql' AS step;
SELECT '4. Run 04_indexes_and_comments.sql' AS step;
SELECT '5. Run 05_rls_policies.sql' AS step; 