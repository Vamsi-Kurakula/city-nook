-- 01_core_tables.sql
-- Core tables for City Crawler (run this first)
-- Includes user, crawl, progress, and stop tables

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_profile_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl definitions
CREATE TABLE IF NOT EXISTS crawl_definitions (
  crawl_definition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  distance TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIMESTAMP WITH TIME ZONE,
  hero_image_url TEXT,
  hero_image_path TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl progress
CREATE TABLE IF NOT EXISTS crawl_progress (
  crawl_progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  crawl_id UUID NOT NULL REFERENCES crawl_definitions(crawl_definition_id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  current_stop INTEGER DEFAULT 1,
  completed_stops INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT crawl_progress_user_id_key UNIQUE(user_id)
);

-- User crawl history
CREATE TABLE IF NOT EXISTS user_crawl_history (
  user_crawl_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  crawl_id UUID NOT NULL REFERENCES crawl_definitions(crawl_definition_id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_minutes INTEGER,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl stops
CREATE TABLE IF NOT EXISTS crawl_stops (
  crawl_stop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_definition_id UUID NOT NULL REFERENCES crawl_definitions(crawl_definition_id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  stop_type TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_link TEXT,
  stop_components JSONB NOT NULL DEFAULT '{}',
  reveal_after_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crawl_definition_id, stop_number)
);

-- Public crawl signups
CREATE TABLE IF NOT EXISTS public_crawl_signups (
  public_crawl_signup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crawl_id, is_public)
); 