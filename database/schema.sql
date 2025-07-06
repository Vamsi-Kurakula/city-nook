-- City Crawler Database Schema
-- This file contains all database objects for the City Crawler application
-- Run this in your Supabase SQL editor to set up the complete database

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
-- Stores user profile information synced from Clerk authentication
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_progress table
-- Tracks in-progress crawls for each user
CREATE TABLE IF NOT EXISTS crawl_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL, -- References crawl ID from YAML files
  current_stop INTEGER DEFAULT 1, -- Current stop number (1-based)
  completed_stops INTEGER[] DEFAULT '{}', -- Array of completed stop numbers
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE, -- NULL if crawl is in progress
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crawl_id) -- One active crawl per user per crawl type
);

-- Create user_crawl_history table
-- Stores completed crawl records for statistics and history
CREATE TABLE IF NOT EXISTS user_crawl_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL, -- References crawl ID from YAML files
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_minutes INTEGER, -- Time taken to complete the crawl
  score INTEGER, -- Optional score/rating for the crawl
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawl_progress_user_id ON crawl_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_crawl_id ON crawl_progress(crawl_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_user_id ON user_crawl_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_crawl_id ON user_crawl_history(crawl_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_crawl_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles (disabled for now since we're using Clerk)
-- These will be enabled later when we set up proper JWT handling
CREATE POLICY "Allow all operations for now" ON user_profiles
  FOR ALL USING (true);

-- Create RLS policies for crawl_progress
CREATE POLICY "Allow all operations for now" ON crawl_progress
  FOR ALL USING (true);

-- Create RLS policies for user_crawl_history
CREATE POLICY "Allow all operations for now" ON user_crawl_history
  FOR ALL USING (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
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
CREATE TABLE IF NOT EXISTS public_crawl_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL, -- References public crawl ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crawl_id) -- One signup per user per public crawl
);

CREATE INDEX IF NOT EXISTS idx_public_crawl_signups_crawl_id ON public_crawl_signups(crawl_id);
CREATE INDEX IF NOT EXISTS idx_public_crawl_signups_user_id ON public_crawl_signups(user_id);

-- Additional useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_crawl_progress_completed_at ON crawl_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_crawl_progress_started_at ON crawl_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_user_crawl_history_completed_at ON user_crawl_history(completed_at);

-- Enable RLS and allow all for now
ALTER TABLE public_crawl_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for now" ON public_crawl_signups FOR ALL USING (true);

-- Add comments to tables for better documentation
COMMENT ON TABLE user_profiles IS 'User profile information synced from Clerk authentication';
COMMENT ON TABLE crawl_progress IS 'Tracks in-progress crawls for each user';
COMMENT ON TABLE user_crawl_history IS 'Stores completed crawl records for statistics and history';
COMMENT ON TABLE public_crawl_signups IS 'Tracks user signups for scheduled public crawls';

-- Add comments to important columns
COMMENT ON COLUMN crawl_progress.completed_stops IS 'Array of completed stop numbers (1-based indexing)';
COMMENT ON COLUMN crawl_progress.current_stop IS 'Current stop number (1-based indexing)';
COMMENT ON COLUMN crawl_progress.completed_at IS 'NULL if crawl is in progress, timestamp when completed';