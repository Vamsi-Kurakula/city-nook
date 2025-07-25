import { SocialUserProfile, SocialError, SocialErrorCodes } from '../../types/social';
import { getSupabaseClient } from './client';

/**
 * Get the user's friends list.
 */
export async function getFriendsList(userId: string, token: string): Promise<SocialUserProfile[]> {
  try {
    if (!userId) {
      throw new SocialError('User ID is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    if (!token) {
      throw new SocialError('JWT token is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const supabase = getSupabaseClient(token);

    // Get friendships where the user is either user_id_1 or user_id_2
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      throw new SocialError('Failed to fetch friends list', SocialErrorCodes.DATABASE_ERROR);
    }

    if (!friendships || friendships.length === 0) {
      return [];
    }

    // Extract friend IDs (the other user in each friendship)
    const friendIds = friendships.map(friendship =>
      friendship.user_id_1 === userId ? friendship.user_id_2 : friendship.user_id_1
    );

    // Get friend profiles
    const { data: friends, error: friendsError } = await supabase
      .from('user_profiles')
      .select(`
        user_profile_id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
      `)
      .in('user_profile_id', friendIds)
      .order('full_name', { ascending: true });

    if (friendsError) {
      console.error('Error fetching friend profiles:', friendsError);
      throw new SocialError('Failed to fetch friend profiles', SocialErrorCodes.DATABASE_ERROR);
    }

    // Add social-specific fields
    const friendsWithSocialData: SocialUserProfile[] = (friends || []).map(friend => ({
      ...friend,
      is_friend: true,
      friendship_status: 'friends' as const
    }));

    return friendsWithSocialData;
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in getFriendsList:', error);
    throw new SocialError('Failed to fetch friends list', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Check if two users are friends.
 */
export async function areFriends(userId1: string, userId2: string, token: string): Promise<boolean> {
  try {
    if (!userId1 || !userId2) {
      throw new SocialError('Both user IDs are required', SocialErrorCodes.USER_NOT_FOUND);
    }

    if (!token) {
      throw new SocialError('JWT token is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    if (userId1 === userId2) {
      return false; // Users cannot be friends with themselves
    }

    const supabase = getSupabaseClient(token);

    // Check for friendship (ensure consistent ordering)
    const user1 = userId1 < userId2 ? userId1 : userId2
    const user2 = userId1 < userId2 ? userId2 : userId1;

    const { data: friendship, error } = await supabase
      .from('friendships')
      .select('friendship_id')
      .eq('user_id_1', user1)
      .eq('user_id_2', user2)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "not found"
      console.error('Error checking friendship:', error);
      throw new SocialError('Failed to check friendship status', SocialErrorCodes.DATABASE_ERROR);
    }

    return !!friendship;
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in areFriends:', error);
    throw new SocialError('Failed to check friendship status', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Remove a friend.
 */
export async function removeFriend(userId: string, friendId: string, token: string): Promise<void> {
  try {
    if (!userId || !friendId) {
      throw new SocialError('Both user IDs are required', SocialErrorCodes.USER_NOT_FOUND);
    }

    if (!token) {
      throw new SocialError('JWT token is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const supabase = getSupabaseClient(token);

    // Ensure consistent ordering
    const user1 = userId < friendId ? userId : friendId;
    const user2 = userId < friendId ? friendId : userId;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id_1', user1)
      .eq('user_id_2', user2);

    if (error) {
      console.error('Error removing friend:', error);
      throw new SocialError('Failed to remove friend', SocialErrorCodes.DATABASE_ERROR);
    }
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in removeFriend:', error);
    throw new SocialError('Failed to remove friend', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Get friendship status between two users.
 */
export async function getFriendshipStatus(userId1: string, userId2: string, token: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked'> {
  // This would need to be implemented based on your friendship request system
  // For now, just check if they're friends
  const isFriend = await areFriends(userId1, userId2, token);
  return isFriend ? 'friends' : 'none';
}

/**
 * Get mutual friends between two users.
 */
export async function getMutualFriends(userId1: string, userId2: string, token: string): Promise<SocialUserProfile[]> {
  try {
    if (!userId1 || !userId2) {
      throw new SocialError('Both user IDs are required', SocialErrorCodes.USER_NOT_FOUND);
    }

    if (!token) {
      throw new SocialError('JWT token is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    // Get friends of both users
    const [friends1, friends2] = await Promise.all([
      getFriendsList(userId1, token),
      getFriendsList(userId2, token)
    ]);

    // Find mutual friends
    const friends1Ids = new Set(friends1.map(f => f.user_profile_id));
    const mutualFriends = friends2.filter(friend => friends1Ids.has(friend.user_profile_id));

    return mutualFriends;
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in getMutualFriends:', error);
    throw new SocialError('Failed to get mutual friends', SocialErrorCodes.UNKNOWN_ERROR);
  }
} 