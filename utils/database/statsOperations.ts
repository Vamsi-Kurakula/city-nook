import { supabase } from './client';

/**
 * Get crawl statistics for a user
 */
export async function getCrawlStats(userId: string) {
  // Get completed crawls from history
  const { data: completedCrawls, error: historyError } = await supabase
    .from('user_crawl_history')
    .select('crawl_id, is_public')
    .eq('user_id', userId);

  if (historyError) {
    console.error('Error fetching crawl history:', historyError);
    return null;
  }

  // Get in-progress crawl from progress table (only 1 per user now)
  const { data: inProgressCrawl, error: progressError } = await supabase
    .from('crawl_progress')
    .select('crawl_id, is_public, completed_at')
    .eq('user_id', userId)
    .is('completed_at', null)
    .single();

  if (progressError) {
    console.error('Error fetching crawl progress:', progressError);
    return null;
  }

  // Calculate stats
  const totalCompleted = completedCrawls?.length || 0;
  const uniqueCompleted = new Set(completedCrawls?.map(c => `${c.crawl_id}-${c.is_public}`) || []).size;
  const inProgress = inProgressCrawl ? 1 : 0;

  return {
    totalCompleted,
    uniqueCompleted,
    inProgress,
  };
} 