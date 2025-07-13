-- Delete Database Script for City Crawler
-- This script completely resets the database to a clean state
-- Run this before running schema.sql to ensure a fresh start

-- Note: All user_id and user_profile_id columns are TEXT to match Clerk user IDs (not UUID)

-- Function to safely drop objects with error handling
CREATE OR REPLACE FUNCTION safe_drop_all_objects()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Step 1: Drop storage policies first (before bucket is dropped)
    BEGIN
        DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
        result := result || 'Storage policies dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Storage policies drop failed: ' || SQLERRM || '. ';
    END;

    -- Step 2: Drop storage bucket (this will also drop all files in the bucket)
    BEGIN
        DELETE FROM storage.buckets WHERE id = 'crawl-images';
        result := result || 'Storage bucket dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Storage bucket drop failed: ' || SQLERRM || '. ';
    END;

    -- Step 3: Drop triggers (before functions are dropped)
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        result := result || 'Auth trigger dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Auth trigger drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
        result := result || 'User profiles trigger dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'User profiles trigger drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP TRIGGER IF EXISTS update_crawl_progress_updated_at ON crawl_progress;
        result := result || 'Crawl progress trigger dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Crawl progress trigger drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP TRIGGER IF EXISTS update_crawl_definitions_updated_at ON crawl_definitions;
        result := result || 'Crawl definitions trigger dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Crawl definitions trigger drop failed: ' || SQLERRM || '. ';
    END;

    -- Step 4: Drop functions (with all possible signatures)
    -- Drop trigger functions first
    BEGIN
        DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
        result := result || 'handle_new_user function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'handle_new_user function drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        result := result || 'update_updated_at_column function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'update_updated_at_column function drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop user profile functions
    BEGIN
        DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT, TEXT) CASCADE;
        result := result || 'create_user_profile function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'create_user_profile function drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT) CASCADE;
        result := result || 'create_user_profile(TEXT, TEXT) function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'create_user_profile(TEXT, TEXT) function drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_user_profile(TEXT, TEXT, TEXT) CASCADE;
        result := result || 'create_user_profile(TEXT, TEXT, TEXT) function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'create_user_profile(TEXT, TEXT, TEXT) function drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop debug functions
    BEGIN
        DROP FUNCTION IF EXISTS debug_user_profile(TEXT) CASCADE;
        result := result || 'debug_user_profile function dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'debug_user_profile function drop failed: ' || SQLERRM || '. ';
    END;

    -- Step 5: Drop all tables in the correct order (respecting foreign key constraints)
    -- Drop crawl_stops first (references crawl_definitions)
    BEGIN
        DROP TABLE IF EXISTS crawl_stops CASCADE;
        result := result || 'crawl_stops table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'crawl_stops table drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop crawl_definitions (no foreign key dependencies)
    BEGIN
        DROP TABLE IF EXISTS crawl_definitions CASCADE;
        result := result || 'crawl_definitions table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'crawl_definitions table drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop public_crawl_signups (references user_profiles)
    BEGIN
        DROP TABLE IF EXISTS public_crawl_signups CASCADE;
        result := result || 'public_crawl_signups table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'public_crawl_signups table drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop user_crawl_history (references user_profiles)
    BEGIN
        DROP TABLE IF EXISTS user_crawl_history CASCADE;
        result := result || 'user_crawl_history table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'user_crawl_history table drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop crawl_progress (references user_profiles)
    BEGIN
        DROP TABLE IF EXISTS crawl_progress CASCADE;
        result := result || 'crawl_progress table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'crawl_progress table drop failed: ' || SQLERRM || '. ';
    END;

    -- Drop user_profiles last (referenced by other tables)
    BEGIN
        DROP TABLE IF EXISTS user_profiles CASCADE;
        result := result || 'user_profiles table dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'user_profiles table drop failed: ' || SQLERRM || '. ';
    END;

    -- Step 6: Clean up any remaining indexes (in case they weren't dropped with tables)
    -- Crawl definitions and stops indexes
    BEGIN
        DROP INDEX IF EXISTS idx_crawl_definitions_name;
        DROP INDEX IF EXISTS idx_crawl_definitions_is_public;
        DROP INDEX IF EXISTS idx_crawl_definitions_is_featured;
        DROP INDEX IF EXISTS idx_crawl_stops_crawl_definition_id;
        DROP INDEX IF EXISTS idx_crawl_stops_stop_number;
        DROP INDEX IF EXISTS idx_crawl_stops_stop_components;
        result := result || 'Crawl indexes dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Crawl indexes drop failed: ' || SQLERRM || '. ';
    END;

    -- User progress and history indexes
    BEGIN
        DROP INDEX IF EXISTS idx_crawl_progress_user_id;
        DROP INDEX IF EXISTS idx_crawl_progress_crawl_id;
        DROP INDEX IF EXISTS idx_crawl_progress_is_public;
        DROP INDEX IF EXISTS idx_crawl_progress_completed_at;
        DROP INDEX IF EXISTS idx_crawl_progress_started_at;
        result := result || 'Progress indexes dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'Progress indexes drop failed: ' || SQLERRM || '. ';
    END;

    BEGIN
        DROP INDEX IF EXISTS idx_user_crawl_history_user_id;
        DROP INDEX IF EXISTS idx_user_crawl_history_crawl_id;
        DROP INDEX IF EXISTS idx_user_crawl_history_is_public;
        DROP INDEX IF EXISTS idx_user_crawl_history_completed_at;
        result := result || 'History indexes dropped. ';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'History indexes drop failed: ' || SQLERRM || '. ';
    END;

    -- Clean up the helper function itself
    DROP FUNCTION IF EXISTS safe_drop_all_objects();

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Execute the safe drop function
SELECT safe_drop_all_objects() AS drop_result;

-- Reset the database to a clean state
SELECT 'Database reset completed successfully. Run schema.sql to recreate tables.' AS status; 