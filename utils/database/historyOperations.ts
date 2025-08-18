import { getSupabaseClient } from './client';

/**
 * Add a crawl completion record to user_crawl_history
 */
export async function addCrawlHistory({ userId, crawlId, isPublic, completedAt, totalTimeMinutes, score, token }: {
  userId: string;
  crawlId: string;
  isPublic: boolean;
  completedAt: string;
  totalTimeMinutes: number;
  score?: number;
  token: string;
}) {
  const supabase = getSupabaseClient(token);

  // Idempotency guard: avoid duplicate inserts within a short time window
  try {
    const completedAtDate = new Date(completedAt);
    const windowStartIso = new Date(completedAtDate.getTime() - 2 * 60 * 1000).toISOString();

    const { data: existing, error: selectError } = await supabase
      .from('user_crawl_history')
      .select('user_crawl_history_id')
      .eq('user_id', userId)
      .eq('crawl_id', crawlId)
      .eq('is_public', isPublic)
      .gte('completed_at', windowStartIso)
      .limit(1);

    if (!selectError && existing && existing.length > 0) {
      // Duplicate detected, treat as success without inserting again
      return { data: existing, error: null } as const;
    }
  } catch (_) {
    // Non-fatal; proceed to insert
  }

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
export async function getCrawlHistory(userId: string, token: string) {
  const supabase = getSupabaseClient(token);
  
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching crawl history:', error);
    return null;
  }

  // Normalize display date to ensure we show actual completion time when available,
  // and fall back to created_at otherwise. Also prefer the later of the two.
  return (history || []).map((item: any) => {
    const completedAt = item.completed_at ? new Date(item.completed_at) : null;
    const createdAt = item.created_at ? new Date(item.created_at) : null;
    let displayCompletedAt: string | null = null;
    if (completedAt && createdAt) {
      displayCompletedAt = (completedAt.getTime() >= createdAt.getTime() ? completedAt : createdAt).toISOString();
    } else if (completedAt) {
      displayCompletedAt = completedAt.toISOString();
    } else if (createdAt) {
      displayCompletedAt = createdAt.toISOString();
    }
    return { ...item, completed_at: displayCompletedAt };
  });
} 