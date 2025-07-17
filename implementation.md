# Social Features Implementation Plan

## Overview
This plan outlines the implementation of social features for the City Crawler app, starting with a friends system and public profiles that showcase crawl statistics and history.

**Note: This implementation focuses on a basic friend system to establish core social functionality. We acknowledge that this is a simplified version and will continue to refine and expand features after the basic system is operational. Additional features like advanced privacy controls, social activity feeds, performance optimizations, and enhanced user experience will be addressed in future iterations.**

## TypeScript Type Definitions

### Core Social Types
- [ ] **Create `types/social.ts`**
  ```typescript
  // Friend request status enum
  export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
  
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
  export interface UserProfileUpdate[object Object]full_name?: string;
    bio?: string;
    avatar_url?: string;
    profile_visibility?: 'public| friends_only | private;
    show_crawl_activity?: boolean;
    allow_friend_requests?: boolean;
  }
  
  // Notification interface
  export interface SocialNotification [object Object]   notification_id: string;
    user_id: string;
    type: friend_request' |friend_accepted' |friend_rejected' | friend_removed';
    title: string;
    message: string;
    related_user_id?: string;
    read_at?: string;
    created_at: string;
  }
  ```

### Navigation Type Updates
- [ ] **Update `types/navigation.ts`**
  ```typescript
  export type RootStackParamList = {
    // ... existing routes ...
    FriendsList: undefined;
    FriendRequests: undefined;
    UserSearch: undefined;
    PublicProfile: { userId: string };
    FriendProfile: { userId: string };
    BlockedUsers: undefined;
    SocialSettings: undefined;
    Notifications: undefined;
  };
  ```

## Database Schema Changes

### Profile System Tables
- **Extend `user_profiles` table** (already exists, add social fields)
  ```sql
  -- Add social fields to existing user_profiles table
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public,nds_only','private'));  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_crawl_activity BOOLEAN DEFAULT TRUE;
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN DEFAULT TRUE;
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  
  -- Add indexes for social queries
  CREATE INDEX IF NOT EXISTS idx_user_profiles_visibility ON user_profiles(profile_visibility);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at);
  ```

### Friends System Tables
- [ ] **Create `friend_request_status` enum**
  ```sql
  CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
  ```

- [ ] **Create `friendships` table**
  ```sql
  CREATE TABLE IF NOT EXISTS friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
    user_id_2 TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2) -- Ensures consistent ordering
  );

  -- Add trigger for updated_at
  CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  ```

- [ ] **Create `friend_requests` table**
  - `friend_request_id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
  - `from_user_id` (TEXT - references user_profiles(user_profile_id) ON DELETE CASCADE)
  - `to_user_id` (TEXT - references user_profiles(user_profile_id) ON DELETE CASCADE)
  - `message` (TEXT - optional friend request message)
  - `status` (friend_request_status DEFAULT 'pending')
  - `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
  - `responded_at` (TIMESTAMP WITH TIME ZONE)
  - `responded_by` (TEXT - references user_profiles(user_profile_id))
  - Unique constraint on (from_user_id, to_user_id) to prevent duplicate requests
  - Check constraint to ensure from_user_id != to_user_id

- [ ] **Create `blocked_users` table**
  - `blocked_user_id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
  - `blocker_id` (TEXT - references user_profiles(user_profile_id) ON DELETE CASCADE)
  - `blocked_id` (TEXT - references user_profiles(user_profile_id) ON DELETE CASCADE)
  - `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
  - Unique constraint on (blocker_id, blocked_id)
  - Check constraint to ensure blocker_id != blocked_id

### Reports Table
-  **Create `user_reports` table**
  - Stores reports of inappropriate behavior for later review.
  - Example schema:

```sql
CREATE TABLE user_reports (
  user_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  reporter_user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Recommended Indexes
- [ ] **Friendships Table**
  - CREATE INDEX idx_friendships_user_id_1 ON friendships(user_id_1);
  - CREATE INDEX idx_friendships_user_id_2 ON friendships(user_id_2);
  - CREATE INDEX idx_friendships_composite ON friendships(user_id_1, user_id_2);
- [ ] **Friend Requests Table**
  - CREATE INDEX idx_friend_requests_to_user_id ON friend_requests(to_user_id);
  - CREATE INDEX idx_friend_requests_from_user_id ON friend_requests(from_user_id);
  - CREATE INDEX idx_friend_requests_status ON friend_requests(status);
  - CREATE INDEX idx_friend_requests_composite ON friend_requests(from_user_id, to_user_id);
- [ ] **Blocked Users Table**
  - CREATE INDEX idx_blocked_users_blocker_id ON blocked_users(blocker_id);
  - CREATE INDEX idx_blocked_users_blocked_id ON blocked_users(blocked_id);
- [ ] **User Search**
  - CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name);
  - CREATE INDEX idx_user_profiles_email ON user_profiles(email);

### Real-time Updates & Notifications
- [ ] **Implement real-time updates for social features**
  - Use Supabase real-time for:
    - Friend requests (sent, accepted, rejected)
    - Friendship status changes
    - Notifications (in-app)
  - Define event types and payloads for each social action
  - Fallback to polling if real-time is unavailable
  - Add notification table:
    ```sql
    CREATE TABLE IF NOT EXISTS social_notifications (
      notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES user_profiles(user_profile_id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- e.g., 'friend_request', 'friend_accepted', etc.
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      related_user_id TEXT,
      read_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_social_notifications_user_id ON social_notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_social_notifications_type ON social_notifications(type);
    ```

### Data Migration for Existing Users
- [ ] **Create migration scripts for existing users**
  - Add default privacy settings for all current users (public profile, allow friend requests)
  - Backfill last_active_at with current timestamp
  - Test migration and rollback procedures

## Backend/Database Operations

### Database Operations Layer
- [ ] **Create `profileOperations.ts`**
  - `getPersonalProfile(userId: string)` - Full profile for user themselves
  - `getPublicProfile(userId: string)` - Basic profile for anyone
  - `searchUsers(query: string)` - Search with appropriate profile level
  - `updateProfile(userId: string, updates: Partial<UserProfile>)` - Update user profile
  - `getUserStats(userId: string)` - Get crawl statistics for profile display

### User Profile Management
- reate `userProfileOperations.ts`**
  - `updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<void>`
  - `uploadAvatar(userId: string, imageFile: File): Promise<string>` - Upload and return avatar URL
  - `deleteAvatar(userId: string): Promise<void>`
  - `getProfileSettings(userId: string): Promise<UserProfileUpdate>`
  - `updateProfileSettings(userId: string, settings: Partial<UserProfileUpdate>): Promise<void>`

- [ ] **Avatar Management System**
  - Image upload with validation (max5MB, JPG/PNG only)
  - Image resizing and compression for storage efficiency
  - CDN integration for fast avatar delivery
  - Default avatar fallback for users without custom avatars

- [ ] **Profile Privacy Controls**
  - Profile visibility settings (public, friends-only, private)
  - Crawl activity visibility toggle
  - Friend request permissions
  - Bio text with character limits (max 500 characters)

### Backend Operations Outline

#### friendshipOperations.ts
- `getFriendsList(userId: string): Promise<SocialUserProfile[]>`
- `areFriends(userId1: string, userId2: string): Promise<boolean>`
- `removeFriend(userId: string, friendId: string): Promise<void>`
- `getFriendshipStatus(userId1: string, userId2: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked'>`
- `getMutualFriends(userId1: string, userId2: string): Promise<SocialUserProfile[]>`

#### friendRequestOperations.ts
- `sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<void>`
- `getPendingRequests(userId: string): Promise<FriendRequest[]>`
- `acceptFriendRequest(requestId: string): Promise<void>`
- `rejectFriendRequest(requestId: string): Promise<void>`
- `cancelFriendRequest(requestId: string): Promise<void>`
- `getSentRequests(userId: string): Promise<FriendRequest>`
- `hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean>`
- `getRequestById(requestId: string): Promise<FriendRequest | null>`

#### userSearchOperations.ts
- `searchUsers(query: string, excludeUserId: string): Promise<SocialUserProfile[]>`
- `searchUsersWithPagination(query: string, excludeUserId: string, page: number, limit: number): Promise<{users: SocialUserProfile[], total: number, hasMore: boolean}>`

#### blockingOperations.ts
- `blockUser(blockerId: string, blockedId: string): Promise<void>`
- `unblockUser(blockerId: string, blockedId: string): Promise<void>`
- `getBlockedUsers(userId: string): Promise<SocialUserProfile[]>`
- `isBlocked(blockerId: string, blockedId: string): Promise<boolean>`

#### reportingOperations.ts
- `reportUser(reporterId: string, reportedId: string, reason: string, details?: string): Promise<void>`
- `getUserReports(userId: string): Promise<UserReport[]>`

#### notificationOperations.ts
- `createNotification(userId: string, type: string, title: string, message: string, relatedUserId?: string): Promise<void>`
- `getUserNotifications(userId: string, limit?: number): Promise<SocialNotification[]>`
- `markNotificationAsRead(notificationId: string): Promise<void>`
- `markAllNotificationsAsRead(userId: string): Promise<void>`
- `deleteNotification(notificationId: string): Promise<void>`
- `getUnreadNotificationCount(userId: string): Promise<number>`

### Notification System Details
- Notification Types**
  - Friend request received
  - Friend request accepted
  - Friend request rejected
  - Friend removed you
  - New friend activity (optional, for future use)

- cation Preferences**
  - In-app notification settings
  - Push notification settings (for future implementation)
  - Email notification settings (for future implementation)
  - Notification frequency controls

- [ ] **Real-time Notification Delivery**
  - Use Supabase real-time subscriptions for instant notifications
  - Fallback to polling for offline users
  - Notification badge updates in app navigation

### Error Handling & Transaction Patterns
- Define error types for social operations
  ```typescript
  export class SocialError extends Error {
    constructor(message: string, public code: string, public statusCode: number = 400) {
      super(message);
      this.name = 'SocialError';
    }
  }
  
  export const SocialErrorCodes = {
    ALREADY_FRIENDS: 'ALREADY_FRIENDS',
    REQUEST_ALREADY_SENT: 'REQUEST_ALREADY_SENT',
    REQUEST_NOT_FOUND: 'REQUEST_NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    CANNOT_REQUEST_SELF: 'CANNOT_REQUEST_SELF',
    USER_BLOCKED: 'USER_BLOCKED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  } as const;
  ```

- [ ] **Self-friending Prevention**
  - Database constraint: CHECK (from_user_id != to_user_id) in friend_requests table
  - Application validation: Check before sending friend request
  - Error handling: Return CANNOT_REQUEST_SELF error code
  - UI prevention: Disable "Add Friend" button for own profile

- [ ] **Implement transaction patterns for atomic operations**
  - Friend request acceptance (create friendship + update request status)
  - Friend removal (remove friendship + cleanup related data)
  - User blocking (block user + remove existing friendship/requests)

### Rate Limiting & Security
- [ ] **Implement rate limiting for social operations**
  - Max 5 friend requests per minute per user
  - Max 10 searches per minute per user
  - Max 20 profile views per minute per user
- [ ] **Input validation and sanitization**
  - Validate friend request messages (max 50 characters)
  - Sanitize user search queries
  - Validate report reasons and details

## Context & State Management

### FriendsContext Integration
- [ ] **Create `FriendsContext.tsx`**
  - Holds the current user's friends, pending requests, and provides methods to refresh or update this data.
  - Exposes:
    - friends: SocialUserProfile[]
    - pendingRequests: FriendRequest[]
    - sentRequests: FriendRequest[]
    - blockedUsers: SocialUserProfile[]
    - refreshFriends()
    - sendFriendRequest(), acceptFriendRequest(), etc.
    - blockUser(), unblockUser()
    - searchUsers()
- **Integration with existing contexts**
  - Integrate with `AuthContext` for user authentication
  - Integrate with `CrawlContext` for displaying friend crawl activity
  - Ensure proper state synchronization between contexts

### State Management Patterns
- [ ] **Implement optimistic updates** for better UX
  - Show friend request as sent immediately, revert on error
  - Show friend as added immediately, revert on error
- [ ] **Implement proper loading states** for all social operations
- [ ] **Implement error recovery** with retry mechanisms

## UI Components & Screens

### New Screens
- [ ] **FriendsListScreen.tsx**
  - Shows the user's friends (avatars, names, quick actions)
  - Pull-to-refresh functionality
  - Empty state when no friends
  - Search within friends list

- [ ] **FriendRequestsScreen.tsx**
  - Shows incoming and outgoing friend requests (accept/reject/cancel)
  - Tabbed interface for incoming vs outgoing
  - Empty states for each tab

- [ ] **UserSearchScreen.tsx**
  - Lets users search for others by name/email and send friend requests
  - Real-time search with debouncing
  - Pagination for large result sets
  - Filter options (online status, mutual friends, etc.)

- [ ] **PublicProfileScreen.tsx**
  - Shows a basic public profile for any user (with "Add Friend" or "Request Sent" button)
  - Basic crawl statistics
  - Recent activity (if public)

- [ ] **FriendProfileScreen.tsx**
  - Shows a more detailed profile for friends (stats, history, etc.)
  - Shared crawl history
  - Mutual friends list
  - Remove friend option

- [ ] **BlockedUsersScreen.tsx**
  - Shows list of blocked users
  - Unblock functionality
  - Empty state when no blocked users

#### Essential UI Components
- [ ] **FriendCard.tsx**
  - Displays a friend's avatar, name, and status, with quick actions (view, remove)
  - Online/offline status indicator
  - Recent activity indicator

- [ ] **FriendRequestCard.tsx**
  - Shows a pending request with accept/reject/cancel buttons
  - Request message display
  - Timestamp information

- [ ] **UserSearchCard.tsx**
  - Shows a user in search results, with "Add Friend" or "Request Sent" button
  - Mutual friends count
  - Basic profile information

- [ ] **SocialLoadingSpinner.tsx**
  - Consistent loading indicator for social operations

- [ ] **SocialErrorBoundary.tsx**
  - Error boundary specifically for social features

### UI/UX Flows
- Add Friend: User searches, finds a user, views their public profile, and sends a friend request.
- Accept/Reject Request: User sees pending requests, accepts or rejects them, and the friend list updates.
- View Friend Profile: User taps a friend to see their detailed profile.
- Remove Friend: User removes a friend from their list.
- Block User: User blocks another user, removing them from friends and preventing future interaction.

## Privacy & Security

### Profile Visibility System
- [ ] **Define profile visibility levels:**
  - Public Profile: Only name, avatar, and minimal stats (total crawls completed)
  - Friend Profile: More details (recent crawls, achievements, mutual friends)
  - Personal Profile: All details, only visible to the user
- [ ] **Implement privacy settings** for profile visibility
- [ ] **Respect user privacy preferences** in search results

### User Blocking System
- [ ] **Complete blocking functionality:**
  - Blocked users cannot send requests, view profiles, or interact in any way
  - Remove existing friendships when blocking
  - Cancel pending requests when blocking
- [ ] **Search visibility filtering:**
  - Only show users in search who are not blocked and have not blocked the searching user

### Data Protection & Compliance
- [ ] **GDPR compliance** for social data
  - Right to be forgotten (delete all social data)
  - Data export functionality
  - Privacy policy updates
- [ ] **Audit logging** for social actions
  - Log all friend requests, acceptances, rejections
  - Log all blocking actions
  - Log all profile views (for analytics)

## Performance & Scalability

### Database Optimization
- [ ] **Query optimization** for large user bases
  - Use composite indexes for common query patterns
  - Implement efficient pagination
  - Optimize friend list queries with proper joins
- [ ] **Connection pooling** for social queries
- [ ] **Database query monitoring** and performance tracking

### Caching Strategy
- [ ] **Local caching** for frequently accessed data
  - Cache friends list locally
  - Cache user profiles locally
  - Implement cache invalidation strategies
- [ ] **Server-side caching** (if applicable)
  - Cache search results
  - Cache public profiles

### Pagination & Lazy Loading
- [ ] **Implement pagination** for all list views
  - Friends list: 20 per page
  - Search results: 15 per page
  - Friend requests: 10 per page
- [ ] **Lazy loading** for profile images and large lists
- [ ] **Infinite scroll** for better UX

## Testing & Validation

### Unit Testing Strategy
- [ ] **Database operation tests**
  - Test all CRUD operations for social tables
  - Test transaction rollbacks
  - Test constraint violations
- [ ] **Business logic tests**
  - Test friend request workflows
  - Test blocking functionality
  - Test privacy rules

### Integration Testing
- [ ] **End-to-end social workflows**
  - Complete friend request flow
  - Blocking and unblocking flow
  - Profile viewing with different privacy levels
- [ ] **Integration with existing features**
  - Test social features with crawl functionality
  - Test auth integration
- [ ] **Performance testing**
  - Test with large friend lists
  - Test search performance with many users

### Mock Data & Test Utilities
- [ ] **Create mock social data** for testing
  - Mock user profiles
  - Mock friendships and requests
  - Mock search results
- [ ] **Test utilities** for social features
  - Helper functions to create test scenarios
  - Cleanup utilities for test data

### UI Testing
- [ ] **Component tests** for all social UI components
- [ ] **Screen tests** for all social screens
- [ ] **Error state testing** for all error scenarios
- [ ] **Accessibility testing** for social features

## Accessibility & Security Considerations

### Accessibility
- [ ] Ensure all social features are accessible:
  - Screen reader support for all new screens and components
  - Keyboard navigation for all interactive elements
  - Sufficient color contrast for text and UI elements
  - Voice control compatibility where possible

### Security
- [ ] Input validation and sanitization for all user-generated content
- [ ] Prevent SQL injection in all queries
- [ ] Prevent cross-site scripting (XSS) in user-generated content and messages
- [ ] Rate limiting for all social endpoints
- [ ] Audit logging for sensitive social actions

## Deployment & Migration Strategy

### Database Migration
- [ ] **Create migration scripts** for social tables
  - Up migration for creating all social tables
  - Down migration for rollback
  - Data migration for existing users (if needed)
- [ ] **Test migrations** in staging environment
- [ ] **Plan rollback strategy** if issues arise

### Feature Flag Implementation
- [ ] **Implement feature flags** for social features
  - Enable/disable social features globally
  - Enable/disable specific social features
  - A/B testing capabilities
- [ ] **Gradual rollout plan**
  - Start with internal testing
  - Roll out to small user group
  - Full rollout with monitoring

### Monitoring & Analytics
- [ ] **Implement social feature analytics**
  - Track friend request success rates
  - Track profile view engagement
  - Track search usage patterns
- [ ] **Performance monitoring**
  - Monitor database query performance
  - Monitor API response times
  - Monitor error rates

## Business Rules & Social Policy

### Friend Limits & Policies
- [ ] **Maximum friends limit:**
  - Set a cap (e.g., 1000 friends per user) to prevent abuse and performance issues
- [ ] **Friend request expiration:**
  - Automatically expire friend requests after a set period (e.g., 30 days)
- [ ] **Duplicate request prevention:**
  - Prevent sending a new request if one is already pending or if users are already friends

### Content Moderation
- [ ] **Friend request message moderation:**
  - Filter inappropriate content
  - Length limits and character restrictions
- [ ] **Report handling:**
  - Multiple reports or severe reports can trigger admin review or automatic restrictions
- [ ] **Automated content filtering** for user-generated content

### User Experience Policies
- [ ] **Friend suggestion algorithm:**
  - Suggest friends based on mutual friends, shared crawls, or recent activity
- [ ] **Activity visibility:**
  - Control what crawl activity is visible to friends
- [ ] **Notification preferences:**
  - Allow users to control social notifications

## Implementation Dependencies

### External Dependencies
- [ ] **User notification system:**
  - For friend requests, acceptances, and rejections (can be email, push, or in-app)
- [ ] **Real-time updates:**
  - Use WebSockets or polling for real-time friend status and request updates
- [ ] **Image upload/avatar management:**
  - Allow users to upload avatars, with validation and moderation

### Internal Dependencies
- [ ] **Integration with existing crawl system:**
  - Display friend crawl activity
  - Share crawl statistics
- [ ] **Integration with existing auth system:**
  - Ensure proper user authentication for social features
- [ ] **Integration with existing profile system:**
  - Extend existing user profiles with social features

## Integration Points

- [ ] Integrate social features with crawl completion flows (e.g., show friend activity on completion)
- [ ] Extend user profile screens to display social data (friends, requests, blocks)
- [ ] Update navigation to include new social screens and routes
- [ ] Use error boundaries for all social UI components
- [ ] Ensure state synchronization between AuthContext, FriendsContext, and CrawlContext

## Documentation & Onboarding

### User Documentation
- [ ] **Social features user guide:**
  - Explain how the friends system works
  - Privacy implications and settings
  - How to report/block users
  - Best practices for social interaction
- [ ] **Privacy policy updates:**
  - Update privacy policy to cover social features
  - Explain data collection and usage

### Developer Documentation
- [ ] **API documentation:**
  - Document all social API endpoints
  - Include request/response examples
  - Document error codes and handling
- [ ] **Database schema documentation:**
  - Document all social tables and relationships
  - Include index explanations
  - Document business rules and constraints
- [ ] **Code documentation:**
  - Document all social-related functions and classes
  - Include usage examples
  - Document integration points

## Success Metrics & KPIs

### User Engagement Metrics
- [ ] **Friend request acceptance rate**
- [ ] **Profile view engagement**
- [ ] **Search usage frequency**
- [ ] **Social feature adoption rate**

### Performance Metrics
- [ ] **API response times** for social operations
- [ ] **Database query performance** for social queries
- [ ] **Error rates** for social features
- [ ] **User satisfaction scores** for social features

### Business Metrics
- [ ] **User retention** with social features
- [ ] **Crawl completion rates** for users with friends
- [ ] **User acquisition** through social features
- [ ] **Community engagement** metrics

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2) Database schema implementation
- [ ] TypeScript type definitions
- [ ] Database operations
- [ ] Core context setup

### Phase 2: Basic Social Features (Week 3-end request system
- [ ] Friend profile viewing
- [ ] User search functionality
- [ ] Simple UI components

### Phase 3: Enhanced Features (Week 5-6) Blocking system
- [ ] Advanced privacy controls
- [ ] Performance optimizations
- [ ] Comprehensive testing

### Phase 4 Polish & Launch (Week 7-8)
- [ ] UI/UX refinements
- [ ] Implementation completion
- [ ] Production deployment
- [ ] Monitoring setup

## Performance & Scalability Details

- [ ] Optimize queries for large friend lists and user search (composite indexes, efficient joins)
- [ ] Implement local caching for friends list and user profiles with cache invalidation
- [ ] Use server-side caching for search and public profiles if needed
- [ ] Enforce pagination on all list endpoints (friends, requests, search)
- [ ] Monitor query performance and API response times for social endpoints
- [ ] Set up alerts for slow queries or high error rates

## Risk Mitigation

### Technical Risks
- [ ] **Database performance issues:**
  - Implement proper indexing from the start
  - Monitor query performance closely
  - Have optimization strategies ready
- [ ] **Scalability concerns:**
  - Design for scale from the beginning
  - Implement pagination and caching
  - Monitor resource usage

### Business Risks
- [ ] **User adoption:**
  - Start with simple features
  - Gather user feedback early
  - Be prepared to iterate based on usage
- [ ] **Privacy concerns:**
  - Implement strong privacy controls
  - Be transparent about data usage
  - Have clear opt-out mechanisms

### Operational Risks
- [ ] **Deployment issues:**
  - Thorough testing in staging
  - Rollback procedures ready
  - Monitoring and alerting in place
- [ ] **Support burden:**
  - Comprehensive documentation
  - Clear error messages
  - Self-service troubleshooting options

## Avatar Management & Privacy Implementation: Next Steps

### Avatar Management
1. **Client-side Validation**
   - Enforce file type (JPG/PNG) and size (max 5MB) before upload.
2. **Server-side Validation**
   - Re-validate file type and size after upload.
   - Strip EXIF metadata and validate MIME type.
3. **Image Processing**
   - Resize uploaded images to standard dimensions (e.g., 256x256px, 64x64px).
   - Compress images for efficient web delivery.
   - Optionally crop to square/aspect ratio.
4. **Storage & CDN**
   - Store avatars in Supabase Storage (or similar), organized by user ID.
   - Use Supabase’s built-in CDN for fast delivery.
   - Ensure avatar URLs are cache-busted on update (e.g., append version or timestamp).
5. **Default Avatars**
   - Generate unique default avatars using a library (e.g., DiceBear) based on user ID or initials.
6. **Security**
   - Limit upload frequency to prevent abuse.
   - Ensure only authenticated users can upload/change avatars.

### Privacy Implementation
1. **Define Data Exposure per Privacy Level**
   - **Public**: Show name, avatar, minimal stats (e.g., total crawls).
   - **Friends Only**: Show above plus recent crawls, achievements, mutual friends.
   - **Private**: Only visible to the user; others see “Profile is private.”
2. **Search Filtering**
   - Only include users in search results if their profile is 'public' or 'friends_only' (and the searcher is a friend).
   - Exclude users who have blocked the searcher or are blocked by the searcher.
3. **Dynamic Privacy Changes**
   - When a user changes to 'private', immediately hide their profile from non-friends and remove from search.
   - Optionally notify friends if their access changes.
4. **Crawl Activity Visibility**
   - Respect the `show_crawl_activity` flag; if false, hide crawl history and stats from everyone except the user.
5. **Blocked Users**
   - Blocked users cannot view, search, or interact with the blocker’s profile.
   - Remove any existing friendships or pending requests upon blocking.
6. **UI Feedback**
   - Clearly indicate when a profile is restricted/private.
   - Show privacy settings in the profile edit screen with clear explanations.


