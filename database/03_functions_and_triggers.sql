-- 03_functions_and_triggers.sql
-- Functions and triggers for City Crawler (run this third)
-- Includes user creation, updated_at, and related triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_profile_id, email, full_name, avatar_url)
  VALUES (
    NEW.id::TEXT,
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

-- Function to manually create user profile
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

-- Debug function
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_progress_updated_at
  BEFORE UPDATE ON crawl_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_definitions_updated_at
  BEFORE UPDATE ON crawl_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 