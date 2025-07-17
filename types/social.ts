// Social feature types for City Crawler

// Friend request status enum
type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Friend request interface
export interface FriendRequest {
  friend_request_id: string;
  from_user_id: string;
  to_user_id: string;
  message?: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at?: string;
  responded_by?: string;
}

// Friendship interface
export interface Friendship {
  friendship_id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: string;
  updated_at: string;
}

// Extended user profile for social features
export interface SocialUserProfile {
  user_profile_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Social-specific fields
  is_friend?: boolean;
  friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  mutual_friends_count?: number;
}

// Blocked user interface
export interface BlockedUser {
  blocked_user_id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

// User report interface
export interface UserReport {
  user_report_id: string;
  reported_user_id: string;
  reporter_user_id: string;
  reason: string;
  details?: string;
  created_at: string;
}

// User profile update interface
export interface UserProfileUpdate {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  show_crawl_activity?: boolean;
  allow_friend_requests?: boolean;
}

// Notification interface
export interface SocialNotification {
  notification_id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'friend_rejected' | 'friend_removed';
  title: string;
  message: string;
  related_user_id?: string;
  read_at?: string;
  created_at: string;
}

// Social error class
export class SocialError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'SocialError';
  }
}

// Social error codes
export const SocialErrorCodes = {
  ALREADY_FRIENDS: 'ALREADY_FRIENDS',
  REQUEST_ALREADY_SENT: 'REQUEST_ALREADY_SENT',
  REQUEST_NOT_FOUND: 'REQUEST_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CANNOT_REQUEST_SELF: 'CANNOT_REQUEST_SELF',
  USER_BLOCKED: 'USER_BLOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const; 