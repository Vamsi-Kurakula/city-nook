-- 05_rls_policies.sql
-- RLS enablement and security policies for City Crawler (run this fifth)

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

-- Policies for user-specific tables
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT USING (user_profile_id = auth.uid()::text);
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE USING (user_profile_id = auth.uid()::text);

CREATE POLICY "Users can view their own crawl progress"
  ON crawl_progress
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own crawl progress"
  ON crawl_progress
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own crawl progress"
  ON crawl_progress
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own crawl history"
  ON user_crawl_history
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own crawl history"
  ON user_crawl_history
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own public crawl signups"
  ON public_crawl_signups
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own public crawl signups"
  ON public_crawl_signups
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own friendships"
  ON friendships
  FOR SELECT USING (user_id_1 = auth.uid()::text OR user_id_2 = auth.uid()::text);
CREATE POLICY "Users can insert their own friendships"
  ON friendships
  FOR INSERT WITH CHECK (user_id_1 = auth.uid()::text OR user_id_2 = auth.uid()::text);

CREATE POLICY "Users can view their own friend requests"
  ON friend_requests
  FOR SELECT USING (from_user_id = auth.uid()::text OR to_user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own friend requests"
  ON friend_requests
  FOR INSERT WITH CHECK (from_user_id = auth.uid()::text);

CREATE POLICY "Users can view their own blocked users"
  ON blocked_users
  FOR SELECT USING (blocker_id = auth.uid()::text OR blocked_id = auth.uid()::text);
CREATE POLICY "Users can insert their own blocked users"
  ON blocked_users
  FOR INSERT WITH CHECK (blocker_id = auth.uid()::text);

CREATE POLICY "Users can view their own reports"
  ON user_reports
  FOR SELECT USING (reporter_user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own reports"
  ON user_reports
  FOR INSERT WITH CHECK (reporter_user_id = auth.uid()::text);

CREATE POLICY "Users can view their own notifications"
  ON social_notifications
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own notifications"
  ON social_notifications
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policies for public/shared tables
CREATE POLICY "Anyone can view crawl definitions"
  ON crawl_definitions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view crawl stops"
  ON crawl_stops
  FOR SELECT USING (true); 