-- 02_social_tables.sql
-- Social features tables for City Crawler (run this second)
-- Includes friendships, friend requests, blocks, reports, notifications

-- Friend request status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'friend_request_status') THEN
    CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
  END IF;
END $$;

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
  friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  user_id_2 TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

-- Friend requests
CREATE TABLE IF NOT EXISTS friend_requests (
  friend_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  message TEXT,
  status friend_request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by TEXT REFERENCES user_profiles(user_profile_id),
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

-- Blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
  blocked_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- User reports
CREATE TABLE IF NOT EXISTS user_reports (
  user_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  reporter_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social notifications
CREATE TABLE IF NOT EXISTS social_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 