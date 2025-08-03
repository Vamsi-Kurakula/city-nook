import { getSupabaseClient } from './client';

/**
 * Upsert crawl progress for a user
 */
export async function saveCrawlProgress({ userId, crawlId, isPublic, currentStop, completedStops, startedAt, completedAt, token }: {
  userId: string;
  crawlId: string;
  isPublic: boolean;
  currentStop: number;
  completedStops: number[];
  startedAt: string;
  completedAt?: string;
  token: string;
}) {
  // Get authenticated Supabase client
  const supabase = getSupabaseClient(token);
  
  // Debug: Check if we have a session
  const { data: sessionData } = await supabase.auth.getSession();
  
  // Enhanced JWT debugging
  // Test: Check the get_user_id_from_jwt function directly
  try {
    const { data: functionTest, error: functionError } = await supabase.rpc('get_user_id_from_jwt');
    
    if (functionTest && functionTest !== userId) {
      console.error('❌ USER ID MISMATCH! JWT user ID does not match the user_id being inserted');
      console.error('This will cause RLS policy violations');
    }
  } catch (e) {
    // Silent fail for JWT debugging
  }
  
  // First, check if a record already exists for this user
  const { data: existingRecord, error: selectError } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    console.error('Error checking existing record:', selectError);
    return { data: null, error: selectError };
  }

  let result;
  
  if (existingRecord) {
    // Update existing record
    result = await supabase
      .from('crawl_progress')
      .update({
        crawl_id: crawlId,
        is_public: isPublic,
        current_stop: currentStop,
        completed_stops: completedStops,
        started_at: startedAt,
        completed_at: completedAt || null,
      })
      .eq('user_id', userId);
  } else {
    // Insert new record
    result = await supabase
      .from('crawl_progress')
      .insert([{
        user_id: userId,
        crawl_id: crawlId,
        is_public: isPublic,
        current_stop: currentStop,
        completed_stops: completedStops,
        started_at: startedAt,
        completed_at: completedAt || null,
      }]);
  }

  if (result.error) {
    console.error('Error saving crawl progress:', result.error);
    return { data: null, error: result.error };
  }

  return { data: result.data, error: null };
}

/**
 * Get current crawl progress for a user
 */
export async function getCurrentCrawlProgress(userId: string, token: string) {
  const supabase = getSupabaseClient(token);
  
  const { data, error } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error getting current crawl progress:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get crawl progress for a specific crawl
 */
export async function getCrawlProgress(userId: string, crawlId: string, isPublic: boolean, token: string) {
  const supabase = getSupabaseClient(token);
  
  const { data, error } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic)
    .maybeSingle();

  if (error) {
    console.error('Error getting crawl progress:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete all crawl progress for a user
 */
export async function deleteCrawlProgress({ userId, token }: {
  userId: string;
  token: string;
}) {
  const supabase = getSupabaseClient(token);
  
  const { error } = await supabase
    .from('crawl_progress')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting crawl progress:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Check if a crawl is completed for a user
 */
export async function isCrawlCompleted(userId: string, crawlId: string, isPublic: boolean, token: string) {
  const supabase = getSupabaseClient(token);
  
  // First check crawl history
  const { data: historyData, error: historyError } = await supabase
    .from('crawl_history')
    .select('*')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic)
    .maybeSingle();

  if (historyError) {
    console.error('Error checking crawl history:', historyError);
    return { isCompleted: false, error: historyError };
  }

  if (historyData) {
    return { isCompleted: true, error: null };
  }

  // Then check crawl progress with completed_at
  const { data: progressData, error: progressError } = await supabase
    .from('crawl_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('crawl_id', crawlId)
    .eq('is_public', isPublic)
    .not('completed_at', 'is', null)
    .maybeSingle();

  if (progressError) {
    console.error('Error checking crawl progress:', progressError);
    return { isCompleted: false, error: progressError };
  }

  if (progressData) {
    return { isCompleted: true, error: null };
  }

  return { isCompleted: false, error: null };
} 