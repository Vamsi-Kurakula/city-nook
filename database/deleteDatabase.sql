-- City Crawler Database Deletion Script
-- WARNING: This script will completely delete all data and tables from the database
-- Run this in your Supabase SQL editor to completely reset the database

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_crawl_progress_updated_at ON crawl_progress;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS public_crawl_signups CASCADE;
DROP TABLE IF EXISTS user_crawl_history CASCADE;
DROP TABLE IF EXISTS crawl_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop all indexes (they should be dropped with tables, but just in case)
DROP INDEX IF EXISTS idx_crawl_progress_user_id;
DROP INDEX IF EXISTS idx_crawl_progress_crawl_id;
DROP INDEX IF EXISTS idx_crawl_progress_is_public;
DROP INDEX IF EXISTS idx_crawl_progress_completed_at;
DROP INDEX IF EXISTS idx_crawl_progress_started_at;
DROP INDEX IF EXISTS idx_user_crawl_history_user_id;
DROP INDEX IF EXISTS idx_user_crawl_history_crawl_id;
DROP INDEX IF EXISTS idx_user_crawl_history_is_public;
DROP INDEX IF EXISTS idx_user_crawl_history_completed_at;
DROP INDEX IF EXISTS idx_public_crawl_signups_crawl_id;
DROP INDEX IF EXISTS idx_public_crawl_signups_user_id;
DROP INDEX IF EXISTS idx_public_crawl_signups_is_public;

-- Drop any remaining constraints that might exist
ALTER TABLE IF EXISTS crawl_progress DROP CONSTRAINT IF EXISTS crawl_progress_user_id_crawl_id_is_public_key;
ALTER TABLE IF EXISTS crawl_progress DROP CONSTRAINT IF EXISTS crawl_progress_user_id_key;
ALTER TABLE IF EXISTS crawl_progress DROP CONSTRAINT IF EXISTS crawl_progress_pkey;

-- Reset the database to a clean state
-- Note: This will remove all data permanently
SELECT 'Database deletion completed successfully. All tables, functions, triggers, constraints, and data have been removed.' AS status; 