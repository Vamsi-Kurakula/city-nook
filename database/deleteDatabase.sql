-- Delete Database Script for City Crawler
-- This script completely resets the database to a clean state
-- Run this before running schema.sql to ensure a fresh start

-- Note: All user_id and user_profile_id columns are TEXT to match Clerk user IDs (not UUID)

-- Step 1: Drop RLS policies first (before tables are dropped)
-- Step 2: Drop triggers (before functions are dropped)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_crawl_progress_updated_at ON crawl_progress;

-- Step 3: Drop functions (with all possible signatures)
-- Drop trigger functions first
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop user profile functions
DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT) CASCADE;

-- Drop debug functions
DROP FUNCTION IF EXISTS debug_user_profile(TEXT) CASCADE;

-- Step 4: Drop all tables in the correct order (respecting foreign key constraints)
-- Drop public_crawl_signups first (references user_profiles)
DROP TABLE IF EXISTS public_crawl_signups CASCADE;

-- Drop user_crawl_history (references user_profiles)
DROP TABLE IF EXISTS user_crawl_history CASCADE;

-- Drop crawl_progress (references user_profiles)
DROP TABLE IF EXISTS crawl_progress CASCADE;

-- Drop user_profiles last (referenced by other tables)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 5: Clean up any remaining indexes (in case they weren't dropped with tables)
DROP INDEX IF EXISTS idx_crawl_progress_user_id;
DROP INDEX IF EXISTS idx_crawl_progress_crawl_id;
DROP INDEX IF EXISTS idx_crawl_progress_is_public;
DROP INDEX IF EXISTS idx_crawl_progress_completed_at;
DROP INDEX IF EXISTS idx_crawl_progress_started_at;

DROP INDEX IF EXISTS idx_user_crawl_history_user_id;
DROP INDEX IF EXISTS idx_user_crawl_history_crawl_id;
DROP INDEX IF EXISTS idx_user_crawl_history_is_public;
DROP INDEX IF EXISTS idx_user_crawl_history_completed_at;

-- Reset the database to a clean state
SELECT 'Database reset completed successfully. Run schema.sql to recreate tables.' AS status; 