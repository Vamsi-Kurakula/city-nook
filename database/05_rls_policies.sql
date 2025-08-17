-- 05_rls_policies.sql
-- RLS enablement and security policies for City Crawler with Clerk integration

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_crawl_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_crawl_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;

-- Function to extract user ID from Clerk JWT claims with enhanced debugging
CREATE OR REPLACE FUNCTION get_user_id_from_jwt()
RETURNS TEXT AS $$
DECLARE
  claims JSONB;
  user_id TEXT;
  claims_raw TEXT;
BEGIN
  -- Get JWT claims as raw text first for debugging
  claims_raw := current_setting('request.jwt.claims', true);
  
  -- Log raw claims for debugging
  RAISE LOG 'Raw JWT claims setting: %', claims_raw;
  
  -- Check if claims exist
  IF claims_raw IS NULL OR claims_raw = '' THEN
    RAISE LOG 'No JWT claims found - JWT may not be properly configured or verified';
    RETURN NULL;
  END IF;
  
  -- Parse claims as JSONB
  claims := claims_raw::jsonb;
  
  -- Log parsed claims for debugging
  RAISE LOG 'Parsed JWT claims: %', claims;
  
  -- Extract user ID from 'sub' claim (automatically set by Clerk)
  user_id := claims->>'sub';
  
  -- Log extracted user ID for debugging
  RAISE LOG 'Extracted user ID from JWT: %', user_id;
  
  -- Return user ID if found, otherwise NULL
  RETURN user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detailed error for debugging
    RAISE LOG 'Error extracting user ID from JWT: %', SQLERRM;
    RAISE LOG 'Error context: claims_raw="%", claims=%', claims_raw, claims;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for user-specific tables using Clerk JWT
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT USING (user_profile_id = get_user_id_from_jwt());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE USING (user_profile_id = get_user_id_from_jwt());

-- Allow users to view other user profiles for friend requests and search
CREATE POLICY "Users can view other user profiles for social features"
  ON user_profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT WITH CHECK (user_profile_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own crawl progress"
  ON crawl_progress
  FOR SELECT USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own crawl progress"
  ON crawl_progress
  FOR INSERT WITH CHECK (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can update their own crawl progress"
  ON crawl_progress
  FOR UPDATE USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can delete their own crawl progress"
  ON crawl_progress
  FOR DELETE USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own crawl history"
  ON user_crawl_history
  FOR SELECT USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own crawl history"
  ON user_crawl_history
  FOR INSERT WITH CHECK (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own public crawl signups"
  ON public_crawl_signups
  FOR SELECT USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own public crawl signups"
  ON public_crawl_signups
  FOR INSERT WITH CHECK (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own friendships"
  ON friendships
  FOR SELECT USING (user_id_1 = get_user_id_from_jwt() OR user_id_2 = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own friendships"
  ON friendships
  FOR INSERT WITH CHECK (user_id_1 = get_user_id_from_jwt() OR user_id_2 = get_user_id_from_jwt());

CREATE POLICY "Users can view their own friend requests"
  ON friend_requests
  FOR SELECT USING (from_user_id = get_user_id_from_jwt() OR to_user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own friend requests"
  ON friend_requests
  FOR INSERT WITH CHECK (from_user_id = get_user_id_from_jwt());

-- Allow users to update friend requests (accept/reject)
CREATE POLICY "Users can update friend requests they received"
  ON friend_requests
  FOR UPDATE USING (to_user_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own blocked users"
  ON blocked_users
  FOR SELECT USING (blocker_id = get_user_id_from_jwt() OR blocked_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own blocked users"
  ON blocked_users
  FOR INSERT WITH CHECK (blocker_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own reports"
  ON user_reports
  FOR SELECT USING (reporter_user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own reports"
  ON user_reports
  FOR INSERT WITH CHECK (reporter_user_id = get_user_id_from_jwt());

CREATE POLICY "Users can view their own notifications"
  ON social_notifications
  FOR SELECT USING (user_id = get_user_id_from_jwt());

CREATE POLICY "Users can insert their own notifications"
  ON social_notifications
  FOR INSERT WITH CHECK (user_id = get_user_id_from_jwt());

-- Policies for public/shared tables
CREATE POLICY "Anyone can view crawl definitions"
  ON crawl_definitions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view crawl stops"
  ON crawl_stops
  FOR SELECT USING (true); 