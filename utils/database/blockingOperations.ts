import { SocialUserProfile } from '../../types/social';

/**
 * Block a user.
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Unblock a user.
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Get blocked users for a user.
 */
export async function getBlockedUsers(userId: string): Promise<SocialUserProfile[]> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Check if a user is blocked by another.
 */
export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  // TODO: Implement
  throw new Error('Not implemented');
} 