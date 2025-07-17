import { SocialUserProfile, SocialError, SocialErrorCodes } from '../../types/social';
import { supabase } from './client';

/**
 * Search users, excluding a specific user and existing friends.
 */
export async function searchUsers(query: string, excludeUserId: string): Promise<SocialUserProfile[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (!excludeUserId) {
      throw new SocialError('Exclude user ID is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const searchTerm = `%${query.trim()}%`;

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_profile_id, email, full_name, avatar_url, created_at, updated_at')
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .neq('user_profile_id', excludeUserId)
      .order('full_name', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      throw new SocialError('Failed to search users', SocialErrorCodes.DATABASE_ERROR);
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Get the user IDs from search results
    const userIds = users.map(user => user.user_profile_id);

    // Get existing friendships to exclude friends
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${excludeUserId},user_id_2.eq.${excludeUserId}`);

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      throw new SocialError('Failed to fetch friendships', SocialErrorCodes.DATABASE_ERROR);
    }

    // Create a set of friend IDs for quick lookup
    const friendIds = new Set<string>();
    if (friendships) {
      friendships.forEach(friendship => {
        const friendId = friendship.user_id_1 === excludeUserId ? friendship.user_id_2 : friendship.user_id_1;
        friendIds.add(friendId);
      });
    }

    // Filter out existing friends from search results
    const nonFriends = users.filter(user => !friendIds.has(user.user_profile_id));

    // Get existing friend requests to check if requests have been sent
    const { data: friendRequests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('from_user_id, to_user_id, status')
      .eq('from_user_id', excludeUserId)
      .eq('status', 'pending');

    if (requestsError) {
      console.error('Error fetching friend requests:', requestsError);
      throw new SocialError('Failed to fetch friend requests', SocialErrorCodes.DATABASE_ERROR);
    }

    // Create a set of user IDs that have pending requests sent to them
    const requestSentIds = new Set<string>();
    if (friendRequests) {
      friendRequests.forEach(request => {
        requestSentIds.add(request.to_user_id);
      });
    }

    const usersWithSocialData: SocialUserProfile[] = nonFriends.map(user => ({
      ...user,
      is_friend: false,
      friendship_status: requestSentIds.has(user.user_profile_id) ? 'pending_sent' as const : 'none' as const
    }));

    return usersWithSocialData;
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in searchUsers:', error);
    throw new SocialError('Failed to search users', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Search users with pagination.
 */
export async function searchUsersWithPagination(query: string, excludeUserId: string, page: number, limit: number): Promise<{users: SocialUserProfile[], total: number, hasMore: boolean}> {
  // TODO: Implement
  throw new Error('Not implemented');
} 