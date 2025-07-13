-- City Crawler Database Schema
-- This file contains all database objects for the City Crawler application
-- Run this in your Supabase SQL editor to set up the complete database

-- Remove this line, as it cannot be set by non-superusers in Supabase
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
-- Stores user profile information synced from Clerk authentication
-- Note: user_profile_id is TEXT to match Clerk user IDs (not UUID)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_profile_id TEXT PRIMARY KEY, -- Clerk user ID (TEXT, not UUID)
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_progress table
-- Tracks in-progress crawls for each user (only 1 record per user)
-- Note: user_id is TEXT to match Clerk user IDs (not UUID)
CREATE TABLE IF NOT EXISTS crawl_progress (
  crawl_progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE, -- Clerk user ID (TEXT, not UUID)
  crawl_id TEXT NOT NULL, -- References crawl ID from YAML files
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for public crawls, FALSE for crawl library
  current_stop INTEGER DEFAULT 1, -- Current stop number (1-based)
  completed_stops INTEGER[] DEFAULT '{}', -- Array of completed stop numbers
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE, -- NULL if crawl is in progress
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT crawl_progress_user_id_key UNIQUE(user_id) -- Only one active crawl per user (enforces single crawl per user)
);

-- Create user_crawl_history table
-- Stores completed crawl records for statistics and history
-- Note: user_id is TEXT to match Clerk user IDs (not UUID)
CREATE TABLE IF NOT EXISTS user_crawl_history (
  user_crawl_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE, -- Clerk user ID (TEXT, not UUID)
  crawl_id TEXT NOT NULL, -- References crawl ID from YAML files
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for public crawls, FALSE for crawl library
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_minutes INTEGER, -- Time taken to complete the crawl
  score INTEGER, -- Optional score/rating for the crawl
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawl_progress_user_id ON crawl_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_crawl_id ON crawl_progress(crawl_id);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_is_public ON crawl_progress(is_public);

CREATE INDEX IF NOT EXISTS idx_user_crawl_history_user_id ON user_crawl_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_crawl_id ON user_crawl_history(crawl_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_is_public ON user_crawl_history(is_public);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle cases where user profile might already exist
  INSERT INTO user_profiles (user_profile_id, email, full_name, avatar_url)
  VALUES (
    NEW.id::TEXT, -- Explicitly cast to TEXT to ensure proper type handling
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (user_profile_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manually create user profile (for application use)
CREATE OR REPLACE FUNCTION create_user_profile(
  clerk_user_id TEXT,
  user_email TEXT,
  user_full_name TEXT DEFAULT '',
  user_avatar_url TEXT DEFAULT ''
)
RETURNS TABLE(profile_id TEXT, email TEXT, full_name TEXT, avatar_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO user_profiles (user_profile_id, email, full_name, avatar_url)
  VALUES (clerk_user_id, user_email, user_full_name, user_avatar_url)
  ON CONFLICT (user_profile_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = NOW()
  RETURNING user_profiles.user_profile_id, user_profiles.email, user_profiles.full_name, user_profiles.avatar_url, user_profiles.created_at, user_profiles.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to help debug user profile issues
CREATE OR REPLACE FUNCTION debug_user_profile(debug_user_id TEXT)
RETURNS TABLE(
  profile_exists BOOLEAN,
  profile_id TEXT,
  profile_email TEXT,
  auth_user_exists BOOLEAN,
  auth_user_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM user_profiles WHERE user_profiles.user_profile_id = debug_user_id) as profile_exists,
    up.user_profile_id as profile_id,
    up.email as profile_email,
    EXISTS(SELECT 1 FROM auth.users WHERE auth.users.id = debug_user_id) as auth_user_exists,
    au.id as auth_user_id
  FROM (SELECT debug_user_id) as u
  LEFT JOIN user_profiles up ON up.user_profile_id = u.debug_user_id
  LEFT JOIN auth.users au ON au.id::TEXT = u.debug_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_progress_updated_at
  BEFORE UPDATE ON crawl_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

-- Create public_crawl_signups table
-- Tracks user signups for scheduled public crawls
-- Note: user_id is TEXT to match Clerk user IDs (not UUID)
CREATE TABLE IF NOT EXISTS public_crawl_signups (
  public_crawl_signup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE, -- Clerk user ID (TEXT, not UUID)
  crawl_id TEXT NOT NULL, -- References public crawl ID
  is_public BOOLEAN NOT NULL DEFAULT TRUE, -- Always TRUE for public crawl signups
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crawl_id, is_public) -- One signup per user per public crawl
);

-- Additional useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_crawl_progress_completed_at ON crawl_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_started_at ON crawl_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_completed_at ON user_crawl_history(completed_at);

-- Add comments to tables for better documentation
COMMENT ON TABLE user_profiles IS 'User profile information synced from Clerk authentication';
COMMENT ON TABLE crawl_progress IS 'Tracks in-progress crawls for each user (only 1 record per user)';
COMMENT ON TABLE user_crawl_history IS 'Stores completed crawl records for statistics and history';
COMMENT ON TABLE public_crawl_signups IS 'Tracks user signups for scheduled public crawls';

-- Add comments to important columns
COMMENT ON COLUMN crawl_progress.completed_stops IS 'Array of completed stop numbers (1-based indexing)';
COMMENT ON COLUMN crawl_progress.current_stop IS 'Current stop number (1-based indexing)';
COMMENT ON COLUMN crawl_progress.completed_at IS 'NULL if crawl is in progress, timestamp when completed';
COMMENT ON COLUMN crawl_progress.is_public IS 'TRUE for public crawls, FALSE for crawl library crawls';
COMMENT ON COLUMN user_crawl_history.is_public IS 'TRUE for public crawls, FALSE for crawl library crawls';
COMMENT ON COLUMN public_crawl_signups.is_public IS 'Always TRUE for public crawl signups';

-- Add comments explaining the datatype fixes
COMMENT ON FUNCTION handle_new_user() IS 'Trigger function to create user profiles with proper TEXT type handling for Clerk user IDs - fixed ambiguous column reference';
COMMENT ON FUNCTION create_user_profile(TEXT, TEXT, TEXT, TEXT) IS 'Manual function to create/update user profiles with conflict resolution - fixed ambiguous column reference';
COMMENT ON FUNCTION debug_user_profile(TEXT) IS 'Debug function to check user profile and auth user existence - fixed ambiguous column reference';

SELECT 'Database schema created successfully with datatype fixes for Clerk user IDs and ambiguous column reference fixes.' AS status; 