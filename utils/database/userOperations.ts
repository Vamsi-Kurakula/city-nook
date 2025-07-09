import { supabase } from './client';
import { validateUserId } from '../inputValidation';

/**
 * Delete all user data for GDPR compliance
 * @param userId - The user ID to delete
 * @returns Promise with success status
 */
export const deleteUserAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      return { success: false, error: 'Invalid user ID' };
    }

    // Delete user data in the correct order (respecting foreign key constraints)
    
    // 1. Delete public crawl signups
    const { error: signupsError } = await supabase
      .from('public_crawl_signups')
      .delete()
      .eq('user_id', userId);

    if (signupsError) {
      console.error('Error deleting public crawl signups:', signupsError);
      return { success: false, error: 'Failed to delete user signups' };
    }

    // 2. Delete crawl history
    const { error: historyError } = await supabase
      .from('user_crawl_history')
      .delete()
      .eq('user_id', userId);

    if (historyError) {
      console.error('Error deleting crawl history:', historyError);
      return { success: false, error: 'Failed to delete crawl history' };
    }

    // 3. Delete crawl progress
    const { error: progressError } = await supabase
      .from('crawl_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error deleting crawl progress:', progressError);
      return { success: false, error: 'Failed to delete crawl progress' };
    }

    // 4. Delete user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_profile_id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return { success: false, error: 'Failed to delete user profile' };
    }

    console.log('Successfully deleted all data for user:', userId);
    return { success: true };

  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    return { success: false, error: 'Internal server error' };
  }
};

/**
 * Export user data for GDPR compliance
 * @param userId - The user ID to export data for
 * @returns Promise with user data
 */
export const exportUserData = async (userId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      return { success: false, error: 'Invalid user ID' };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_profile_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'Failed to fetch user profile' };
    }

    // Get crawl history
    const { data: history, error: historyError } = await supabase
      .from('user_crawl_history')
      .select('*')
      .eq('user_id', userId);

    if (historyError) {
      console.error('Error fetching crawl history:', historyError);
      return { success: false, error: 'Failed to fetch crawl history' };
    }

    // Get current crawl progress
    const { data: progress, error: progressError } = await supabase
      .from('crawl_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching crawl progress:', progressError);
      return { success: false, error: 'Failed to fetch crawl progress' };
    }

    // Get public crawl signups
    const { data: signups, error: signupsError } = await supabase
      .from('public_crawl_signups')
      .select('*')
      .eq('user_id', userId);

    if (signupsError) {
      console.error('Error fetching public crawl signups:', signupsError);
      return { success: false, error: 'Failed to fetch public crawl signups' };
    }

    const userData = {
      profile,
      crawlHistory: history || [],
      currentProgress: progress || null,
      publicCrawlSignups: signups || [],
      exportDate: new Date().toISOString(),
    };

    return { success: true, data: userData };

  } catch (error) {
    console.error('Error in exportUserData:', error);
    return { success: false, error: 'Internal server error' };
  }
};

/**
 * Update user profile with validation
 * @param userId - The user ID
 * @param updates - Object containing profile updates
 * @returns Promise with success status
 */
export const updateUserProfile = async (
  userId: string, 
  updates: { full_name?: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      return { success: false, error: 'Invalid user ID' };
    }

    // Sanitize input data
    const sanitizedUpdates: any = {};
    if (updates.full_name) {
      sanitizedUpdates.full_name = updates.full_name.trim().substring(0, 100);
    }
    if (updates.avatar_url) {
      sanitizedUpdates.avatar_url = updates.avatar_url.trim();
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(sanitizedUpdates)
      .eq('user_profile_id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: 'Internal server error' };
  }
}; 