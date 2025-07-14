import { supabase } from './client';

/**
 * Add a crawl completion record to user_crawl_history
 */
export async function addCrawlHistory({ userId, crawlId, isPublic, completedAt, totalTimeMinutes, score }: {
  userId: string;
  crawlId: string;
  isPublic: boolean;
  completedAt: string;
  totalTimeMinutes: number;
  score?: number;
}) {
  return supabase.from('user_crawl_history').insert([
    {
      user_id: userId,
      crawl_id: crawlId,
      is_public: isPublic,
      completed_at: completedAt,
      total_time_minutes: totalTimeMinutes,
      score: score || null,
    }
  ]);
}

/**
 * Get crawl history for a user with crawl details
 */
export async function getCrawlHistory(userId: string) {
  const { data: history, error } = await supabase
    .from('user_crawl_history')
    .select(`
      user_crawl_history_id,
      crawl_id,
      is_public,
      completed_at,
      total_time_minutes,
      score,
      created_at
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching crawl history:', error);
    return null;
  }

  return history;
} 