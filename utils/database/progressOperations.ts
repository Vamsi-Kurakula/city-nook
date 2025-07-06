import { supabase } from './client';

/**
 * Upsert crawl progress for a user
 */
export async function saveCrawlProgress({ userId, crawlId, isPublic, currentStop, completedStops, startedAt, completedAt }: {
  userId: string;
  crawlId: string;
  isPublic: boolean;
  currentStop: number;
  completedStops: number[];
  startedAt: string;
  completedAt?: string;
}) {
  return supabase.from('crawl_progress').upsert([
    {
      user_id: userId,
      crawl_id: crawlId,
      is_public: isPublic,
      current_stop: currentStop,
      completed_stops: completedStops,
      started_at: startedAt,
      completed_at: completedAt || null,
    }
  ], { onConflict: 'user_id' });
}

/**
 * Get current crawl progress for a user
 */
export async function getCurrentCrawlProgress(userId: string) {
  const { data, error } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)
    .single();

  if (error) {
    // PGRST116 means no rows found, which is expected when no progress exists
    if (error.code === 'PGRST116') {
      console.log('No current crawl progress found for user');
      return null;
    }
    console.error('Error fetching current crawl progress:', error);
    return null;
  }

  return data;
}

/**
 * Delete a crawl progress record from the database
 */
export async function deleteCrawlProgress({ userId }: {
  userId: string;
}) {
  return supabase
    .from('crawl_progress')
    .delete()
    .eq('user_id', userId);
} 