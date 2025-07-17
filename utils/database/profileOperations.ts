import { SocialUserProfile, UserProfileUpdate, SocialError, SocialErrorCodes } from '../../types/social';
import { supabase } from './client';

/**
 * Get the full profile for the user themselves.
 */
export async function getPersonalProfile(userId: string): Promise<SocialUserProfile> {
  try {
    if (!userId) {
      throw new SocialError('User ID is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select(`
        user_profile_id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at,
        bio,
        show_crawl_activity,
        allow_friend_requests,
        last_active_at
      `)
      .eq('user_profile_id', userId)
      .single();

    if (error || !user) {
      throw new SocialError('User not found', SocialErrorCodes.USER_NOT_FOUND);
    }

    // Return full profile with social-specific fields
    const personalProfile: SocialUserProfile = {
      user_profile_id: user.user_profile_id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_friend: false, // User cannot be friends with themselves
      friendship_status: 'none' as const
    };

    return personalProfile;
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in getPersonalProfile:', error);
    throw new SocialError('Failed to get personal profile', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Search users with appropriate profile level.
 */
export async function searchUsers(query: string): Promise<SocialUserProfile[]> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Update user profile.
 */
export async function updateProfile(userId: string, updates: Partial<UserProfileUpdate>): Promise<void> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Get crawl statistics for profile display.
 */
export async function getUserStats(userId: string): Promise<any> {
  // TODO: Define return type and implement
  throw new Error('Not implemented');
} 