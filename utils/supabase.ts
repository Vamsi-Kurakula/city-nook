import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  current_step: number;
  completed_steps: number[];
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCrawlHistory {
  id: string;
  user_id: string;
  crawl_id: string;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
}

/**
 * Upsert crawl progress for a user
 */
export async function saveCrawlProgress({ userId, crawlId, currentStep, completedSteps, startedAt, completedAt }: {
  userId: string;
  crawlId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
  completedAt?: string;
}) {
  return supabase.from('crawl_progress').upsert([
    {
      user_id: userId,
      crawl_id: crawlId,
      current_step: currentStep,
      completed_steps: completedSteps,
      started_at: startedAt,
      completed_at: completedAt || null,
    }
  ], { onConflict: 'user_id,crawl_id' });
}

/**
 * Add a crawl completion record to user_crawl_history
 */
export async function addCrawlHistory({ userId, crawlId, completedAt, totalTimeMinutes, score }: {
  userId: string;
  crawlId: string;
  completedAt: string;
  totalTimeMinutes: number;
  score?: number;
}) {
  return supabase.from('user_crawl_history').insert([
    {
      user_id: userId,
      crawl_id: crawlId,
      completed_at: completedAt,
      total_time_minutes: totalTimeMinutes,
      score: score || null,
    }
  ]);
} 