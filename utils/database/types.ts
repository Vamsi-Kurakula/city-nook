// Database types for TypeScript
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlProgress {
  id: string;
  user_id: string;
  crawl_id: string;
  is_public: boolean;
  current_stop: number;
  completed_stops: number[];
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCrawlHistory {
  id: string;
  user_id: string;
  crawl_id: string;
  is_public: boolean;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
} 