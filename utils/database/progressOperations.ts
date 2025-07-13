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
  console.log('saveCrawlProgress called with:', {
    userId,
    crawlId,
    isPublic,
    currentStop,
    completedStops,
    startedAt,
    completedAt
  });
  
  // Debug: Check if we have a session
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Current Supabase session:', sessionData);
  
  // Debug: Test JWT claims by making a simple query
  try {
    const { data: testData, error: testError } = await supabase
      .rpc('current_setting', { name: 'request.jwt.claims' });
    console.log('JWT claims test:', { testData, testError });
  } catch (e) {
    console.log('Could not test JWT claims:', e);
  }
  
  // For single-crawl-per-user design, we can use a simple upsert on user_id
  const { data, error } = await supabase
    .from('crawl_progress')
    .upsert([{
      user_id: userId,
      crawl_id: crawlId,
      is_public: isPublic,
      current_stop: currentStop,
      completed_stops: completedStops,
      started_at: startedAt,
      completed_at: completedAt || null,
    }], { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving crawl progress:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return { data: null, error };
  } else {
    console.log('Crawl progress saved successfully:', data);
    return { data, error: null };
  }
}

/**
 * Get current crawl progress for a user
 */
export async function getCurrentCrawlProgress(userId: string) {
  console.log('getCurrentCrawlProgress called for userId:', userId);
  
  const { data, error } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid PGRST116 error

  if (error) {
    console.error('Error fetching current crawl progress:', error);
    return null;
  }

  console.log('getCurrentCrawlProgress result:', data);
  return data;
}

/**
 * Get crawl progress for a specific crawl
 */
export async function getCrawlProgress(userId: string, crawlId: string, isPublic: boolean) {
  console.log('getCrawlProgress called for userId:', userId, 'crawlId:', crawlId, 'isPublic:', isPublic);
  
  const { data, error } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic)
    .maybeSingle();

  if (error) {
    console.error('Error fetching crawl progress:', error);
    return null;
  }

  console.log('getCrawlProgress result:', data);
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

/**
 * Check if a crawl is already completed for a user
 */
export async function isCrawlCompleted(userId: string, crawlId: string, isPublic: boolean) {
  console.log('isCrawlCompleted called for userId:', userId, 'crawlId:', crawlId, 'isPublic:', isPublic);
  
  // First check crawl_history table
  const { data: historyData, error: historyError } = await supabase
    .from('user_crawl_history')
    .select('id')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic);

  if (historyError) {
    console.error('Error checking crawl history:', historyError);
  } else if (historyData && historyData.length > 0) {
    console.log('Crawl found in history - already completed');
    return true;
  }

  // Also check if there's a progress record with completed_at set
  const { data: progressData, error: progressError } = await supabase
    .from('crawl_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic)
    .not('completed_at', 'is', null);

  if (progressError) {
    console.error('Error checking crawl progress:', progressError);
  } else if (progressData && progressData.length > 0) {
    console.log('Crawl found in progress with completed_at - already completed');
    return true;
  }

  console.log('Crawl not completed');
  return false;
} 