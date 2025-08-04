import { FriendRequest, SocialError, SocialErrorCodes } from '../../types/social';
import { getSupabaseClient, supabase } from './client';

/**
 * Send a friend request.
 */
export async function sendFriendRequest(fromUserId: string, toUserId: string, message?: string, token?: string): Promise<void> {
  try {
    // Validate inputs
    if (!fromUserId || !toUserId) {
      throw new SocialError('User IDs are required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const supabaseClient = token ? getSupabaseClient(token) : supabase;

    // Prevent self-friending
    if (fromUserId === toUserId) {
      throw new SocialError('Cannot send friend request to yourself', SocialErrorCodes.CANNOT_REQUEST_SELF);
    }

    // Check if users exist
    const { data: fromUser, error: fromUserError } = await supabaseClient
      .from('user_profiles')
      .select('user_profile_id')
      .eq('user_profile_id', fromUserId)
      .single();

    if (fromUserError || !fromUser) {
      throw new SocialError('From user not found', SocialErrorCodes.USER_NOT_FOUND);
    }

    const { data: toUser, error: toUserError } = await supabaseClient
      .from('user_profiles')
      .select('user_profile_id')
      .eq('user_profile_id', toUserId)
      .single();

    if (toUserError || !toUser) {
      throw new SocialError('To user not found', SocialErrorCodes.USER_NOT_FOUND);
    }

    // Check if already friends
    const { data: existingFriendship } = await supabaseClient
      .from('friendships')
      .select('friendship_id')
      .or(`user_id_1.eq.${fromUserId},user_id_2.eq.${fromUserId}`)
      .or(`user_id_1.eq.${toUserId},user_id_2.eq.${toUserId}`)
      .single();

    if (existingFriendship) {
      throw new SocialError('Users are already friends', SocialErrorCodes.ALREADY_FRIENDS);
    }

    // Check if request already exists
    const { data: existingRequest } = await supabaseClient
      .from('friend_requests')
      .select('friend_request_id, status')
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', toUserId)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new SocialError('Friend request already sent', SocialErrorCodes.REQUEST_ALREADY_SENT);
      } else if (existingRequest.status === 'accepted') {
        throw new SocialError('Users are already friends', SocialErrorCodes.ALREADY_FRIENDS);
      }
    }

    // Check if blocked
    const { data: blockedCheck } = await supabaseClient
      .from('blocked_users')
      .select('blocked_user_id')
      .or(`blocker_id.eq.${fromUserId},blocked_id.eq.${toUserId}`)
      .or(`blocker_id.eq.${toUserId},blocked_id.eq.${fromUserId}`)
      .single();

    if (blockedCheck) {
      throw new SocialError('Cannot send friend request to blocked user', SocialErrorCodes.USER_BLOCKED);
    }

    // Validate message length
    if (message && message.length > 50) {
      throw new SocialError('Friend request message must be 50 characters or less', SocialErrorCodes.MESSAGE_TOO_LONG);
    }

    // Insert friend request
    const { error: insertError } = await supabaseClient
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message: message || null,
        status: 'pending'
      });

    if (insertError) {
      console.error('Error inserting friend request:', insertError);
      throw new SocialError('Failed to send friend request', SocialErrorCodes.DATABASE_ERROR);
    }

  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in sendFriendRequest:', error);
    throw new SocialError('Failed to send friend request', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Get pending friend requests for a user.
 */
export async function getPendingRequests(userId: string, token?: string): Promise<FriendRequest[]> {
  try {
    if (!userId) {
      throw new SocialError('User ID is required', SocialErrorCodes.USER_NOT_FOUND);
    }

    const supabaseClient = token ? getSupabaseClient(token) : supabase;

    const { data: requests, error } = await supabaseClient
      .from('friend_requests')
      .select(`
        friend_request_id,
        from_user_id,
        to_user_id,
        message,
        status,
        created_at,
        responded_at,
        responded_by
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      throw new SocialError('Failed to fetch pending requests', SocialErrorCodes.DATABASE_ERROR);
    }

    return requests || [];
  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in getPendingRequests:', error);
    throw new SocialError('Failed to fetch pending requests', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Accept a friend request.
 */
export async function acceptFriendRequest(requestId: string, token?: string): Promise<void> {
  try {
    // Use authenticated client if token is provided
    const client = token ? getSupabaseClient(token) : supabase;

    // Get the friend request
    const { data: request, error: requestError } = await client
      .from('friend_requests')
      .select('*')
      .eq('friend_request_id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      throw new SocialError('Friend request not found or already processed', SocialErrorCodes.REQUEST_NOT_FOUND);
    }

    // Check if users exist
    const { data: fromUser, error: fromUserError } = await client
      .from('user_profiles')
      .select('user_profile_id')
      .eq('user_profile_id', request.from_user_id)
      .single();

    if (fromUserError || !fromUser) {
      throw new SocialError('From user not found', SocialErrorCodes.USER_NOT_FOUND);
    }

    const { data: toUser, error: toUserError } = await client
      .from('user_profiles')
      .select('user_profile_id')
      .eq('user_profile_id', request.to_user_id)
      .single();

    if (toUserError || !toUser) {
      throw new SocialError('To user not found', SocialErrorCodes.USER_NOT_FOUND);
    }

    // Check if already friends
    const { data: existingFriendship } = await client
      .from('friendships')
      .select('friendship_id')
      .or(`user_id_1.eq.${request.from_user_id},user_id_2.eq.${request.from_user_id}`)
      .or(`user_id_1.eq.${request.to_user_id},user_id_2.eq.${request.to_user_id}`)
      .single();

    if (existingFriendship) {
      throw new SocialError('Users are already friends', SocialErrorCodes.ALREADY_FRIENDS);
    }

    // Use a transaction to update request and create friendship
    const { error: updateError } = await client
      .from('friend_requests')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        responded_by: request.to_user_id
      })
      .eq('friend_request_id', requestId);

    if (updateError) {
      console.error('Error updating friend request:', updateError);
      throw new SocialError('Failed to accept friend request', SocialErrorCodes.DATABASE_ERROR);
    }

    // Create friendship (ensure consistent ordering)
    const user1 = request.from_user_id < request.to_user_id ? request.from_user_id : request.to_user_id;
    const user2 = request.from_user_id < request.to_user_id ? request.to_user_id : request.from_user_id;

    const { error: friendshipError } = await client
      .from('friendships')
      .insert([
        {
          user_id_1: user1,
          user_id_2: user2
        }
      ]);

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError);
      // Try to revert the request status
      await client
        .from('friend_requests')
        .update({
          status: 'pending',
          responded_at: null,
          responded_by: null
        })
        .eq('friend_request_id', requestId);
      throw new SocialError('Failed to create friendship', SocialErrorCodes.DATABASE_ERROR);
    }

  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in acceptFriendRequest:', error);
    throw new SocialError('Failed to accept friend request', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Reject a friend request.
 */
export async function rejectFriendRequest(requestId: string, token?: string): Promise<void> {
  try {
    // Use authenticated client if token is provided
    const client = token ? getSupabaseClient(token) : supabase;

    // Get the friend request
    const { data: request, error: requestError } = await client
      .from('friend_requests')
      .select('*')
      .eq('friend_request_id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      throw new SocialError('Friend request not found or already processed', SocialErrorCodes.REQUEST_NOT_FOUND);
    }

    // Update request status
    const { error: updateError } = await client
      .from('friend_requests')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        responded_by: request.to_user_id
      })
      .eq('friend_request_id', requestId);

    if (updateError) {
      console.error('Error updating friend request:', updateError);
      throw new SocialError('Failed to reject friend request', SocialErrorCodes.DATABASE_ERROR);
    }

  } catch (error) {
    if (error instanceof SocialError) {
      throw error;
    }
    console.error('Unexpected error in rejectFriendRequest:', error);
    throw new SocialError('Failed to reject friend request', SocialErrorCodes.UNKNOWN_ERROR);
  }
}

/**
 * Cancel a sent friend request.
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Get sent friend requests for a user.
 */
export async function getSentRequests(userId: string): Promise<FriendRequest[]> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Check if a pending request exists between two users.
 */
export async function hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Get a friend request by ID.
 */
export async function getRequestById(requestId: string): Promise<FriendRequest | null> {
  // TODO: Implement
  throw new Error('Not implemented');
} 