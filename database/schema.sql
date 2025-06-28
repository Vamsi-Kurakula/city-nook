-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_progress table
CREATE TABLE IF NOT EXISTS crawl_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crawl_id)
);

-- Create user_crawl_history table
CREATE TABLE IF NOT EXISTS user_crawl_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  crawl_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_minutes INTEGER,
  score INTEGER,
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