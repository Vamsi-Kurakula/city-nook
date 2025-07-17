import { UserReport } from '../../types/social';

/**
 * Report a user.
 */
export async function reportUser(reporterId: string, reportedId: string, reason: string, details?: string): Promise<void> {
  // TODO: Implement
  throw new Error('Not implemented');
}

/**
 * Get user reports for a user.
 */
export async function getUserReports(userId: string): Promise<UserReport[]> {
  // TODO: Implement
  throw new Error('Not implemented');
} 