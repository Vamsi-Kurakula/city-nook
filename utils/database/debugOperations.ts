import { getSupabaseClient } from './client';

/**
 * Debug utility to test database access and RLS policies
 */
export const debugDatabaseAccess = async (token: string) => {
  console.log('🔍 Debugging database access...');
  
  const supabase = getSupabaseClient(token);
  
  // Test 1: Check JWT token
  console.log('\n📋 Test 1: JWT Token Validation');
  try {
    const { data: jwtTest, error: jwtError } = await supabase.rpc('get_user_id_from_jwt');
    if (jwtError) {
      console.error('❌ JWT Error:', jwtError);
    } else {
      console.log('✅ JWT User ID:', jwtTest);
    }
  } catch (error) {
    console.error('❌ JWT Test failed:', error);
  }

  // Test 2: Check user profile access
  console.log('\n📋 Test 2: User Profile Access');
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ User Profile Error:', profileError);
    } else {
      console.log('✅ User Profile Access:', profile ? 'Success' : 'No data');
    }
  } catch (error) {
    console.error('❌ User Profile Test failed:', error);
  }

  // Test 3: Check crawl definitions access
  console.log('\n📋 Test 3: Crawl Definitions Access');
  try {
    const { data: definitions, error: defError } = await supabase
      .from('crawl_definitions')
      .select('*')
      .limit(1);
    
    if (defError) {
      console.error('❌ Crawl Definitions Error:', defError);
    } else {
      console.log('✅ Crawl Definitions Access:', definitions ? 'Success' : 'No data');
    }
  } catch (error) {
    console.error('❌ Crawl Definitions Test failed:', error);
  }

  // Test 4: Check crawl progress access
  console.log('\n📋 Test 4: Crawl Progress Access');
  try {
    const { data: progress, error: progressError } = await supabase
      .from('crawl_progress')
      .select('*')
      .limit(1);
    
    if (progressError) {
      console.error('❌ Crawl Progress Error:', progressError);
    } else {
      console.log('✅ Crawl Progress Access:', progress ? 'Success' : 'No data');
    }
  } catch (error) {
    console.error('❌ Crawl Progress Test failed:', error);
  }

  // Test 5: Check friend requests access
  console.log('\n📋 Test 5: Friend Requests Access');
  try {
    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('*')
      .limit(1);
    
    if (requestsError) {
      console.error('❌ Friend Requests Error:', requestsError);
    } else {
      console.log('✅ Friend Requests Access:', requests ? 'Success' : 'No data');
    }
  } catch (error) {
    console.error('❌ Friend Requests Test failed:', error);
  }

  // Test 6: Check friendships access
  console.log('\n📋 Test 6: Friendships Access');
  try {
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('*')
      .limit(1);
    
    if (friendshipsError) {
      console.error('❌ Friendships Error:', friendshipsError);
    } else {
      console.log('✅ Friendships Access:', friendships ? 'Success' : 'No data');
    }
  } catch (error) {
    console.error('❌ Friendships Test failed:', error);
  }

  // Test 7: Check user search access
  console.log('\n📋 Test 7: User Search Access');
  try {
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_profile_id, full_name, email')
      .limit(5);
    
    if (usersError) {
      console.error('❌ User Search Error:', usersError);
    } else {
      console.log('✅ User Search Access:', users ? `${users.length} users found` : 'No data');
    }
  } catch (error) {
    console.error('❌ User Search Test failed:', error);
  }

  console.log('\n🔍 Database access debugging complete');
};

/**
 * Test specific table access with detailed error reporting
 */
export const testTableAccess = async (tableName: string, token: string) => {
  console.log(`🔍 Testing access to table: ${tableName}`);
  
  const supabase = getSupabaseClient(token);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`❌ ${tableName} Error:`, error);
      console.error(`❌ Error Code:`, error.code);
      console.error(`❌ Error Message:`, error.message);
      console.error(`❌ Error Details:`, error.details);
      console.error(`❌ Error Hint:`, error.hint);
    } else {
      console.log(`✅ ${tableName} Access: Success`);
      console.log(`✅ Data count:`, data ? data.length : 0);
    }
  } catch (error) {
    console.error(`❌ ${tableName} Test failed:`, error);
  }
};

/**
 * Get current user ID from JWT
 */
export const getCurrentUserId = async (token: string): Promise<string | null> => {
  const supabase = getSupabaseClient(token);
  
  try {
    const { data, error } = await supabase.rpc('get_user_id_from_jwt');
    if (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('❌ Failed to get user ID:', error);
    return null;
  }
}; 