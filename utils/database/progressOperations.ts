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
  console.log('saveCrawlProgress called with:', {
    userId,
    crawlId,
    isPublic,
    currentStop,
    completedStops,
    startedAt,
    completedAt
  });
  console.log('Supabase client token length:', token?.length || 0);
  console.log('Supabase client token preview:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN');
  
  // Get authenticated Supabase client
  const supabase = getSupabaseClient(token);
  
  // Debug: Check if we have a session
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Current Supabase session:', sessionData);
  
  // Enhanced JWT debugging
  console.log('=== JWT DEBUGGING START ===');
  
  // Test: Check the get_user_id_from_jwt function directly
  try {
    const { data: functionTest, error: functionError } = await supabase.rpc('get_user_id_from_jwt');
    console.log('get_user_id_from_jwt function test:', { functionTest, functionError });
    
    if (functionTest) {
      console.log('✅ JWT is working! User ID from JWT:', functionTest);
      console.log('Expected user ID:', userId);
      console.log('User ID match:', functionTest === userId);
      
      if (functionTest !== userId) {
        console.error('❌ USER ID MISMATCH! JWT user ID does not match the user_id being inserted');
        console.error('This will cause RLS policy violations');
      } else {
        console.log('✅ User ID matches - RLS should work correctly');
      }
    } else {
      console.log('❌ JWT not working - get_user_id_from_jwt returned null');
    }
  } catch (e) {
    console.log('Could not call get_user_id_from_jwt function:', e);
  }
  
  console.log('=== JWT DEBUGGING END ===');
  
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

  console.log('Existing record check:', existingRecord ? 'Found existing record' : 'No existing record');

  let result;
  
  if (existingRecord) {
    // Update existing record
    console.log('Updating existing crawl progress record');
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
    console.log('Inserting new crawl progress record');
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

  const { data, error } = result;

  if (error) {
    console.error('Error saving crawl progress:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Additional debugging for RLS violations
    if (error.code === '42501') {
      console.error('=== RLS POLICY VIOLATION DEBUGGING ===');
      console.error('This is a Row Level Security policy violation');
      console.error('Possible causes:');
      console.error('1. JWT is not being verified by Supabase');
      console.error('2. JWT claims do not match the user_id being inserted');
      console.error('3. get_user_id_from_jwt() function is returning null');
      console.error('4. Supabase JWT configuration is incorrect');
      console.error('Operation type:', existingRecord ? 'UPDATE' : 'INSERT');
      console.error('Existing record user_id:', existingRecord?.user_id);
      console.error('New record user_id:', userId);
      console.error('=== END RLS DEBUGGING ===');
    }
    
    return { data: null, error };
  }

  console.log('Crawl progress saved successfully:', data);
  return { data, error: null };
}

/**
 * Get current crawl progress for a user
 */
export async function getCurrentCrawlProgress(userId: string, token: string) {
  console.log('getCurrentCrawlProgress called for userId:', userId);
  
  const supabase = getSupabaseClient(token);
  
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
export async function getCrawlProgress(userId: string, crawlId: string, isPublic: boolean, token: string) {
  console.log('getCrawlProgress called for userId:', userId, 'crawlId:', crawlId, 'isPublic:', isPublic);
  
  const supabase = getSupabaseClient(token);
  
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
export async function deleteCrawlProgress({ userId, token }: {
  userId: string;
  token: string;
}) {
  const supabase = getSupabaseClient(token);
  
  return supabase
    .from('crawl_progress')
    .delete()
    .eq('user_id', userId);
}

/**
 * Check if a crawl is already completed for a user
 */
export async function isCrawlCompleted(userId: string, crawlId: string, isPublic: boolean, token: string) {
  console.log('isCrawlCompleted called for userId:', userId, 'crawlId:', crawlId, 'isPublic:', isPublic);
  
  const supabase = getSupabaseClient(token);
  
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