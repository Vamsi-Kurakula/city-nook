-- Apply RLS Fix Script
-- Run this in your Supabase SQL Editor to update the get_user_id_from_jwt function

-- Enhanced function with better debugging
CREATE OR REPLACE FUNCTION get_user_id_from_jwt()
RETURNS TEXT AS $$
DECLARE
  claims JSONB;
  user_id TEXT;
  claims_raw TEXT;
BEGIN
  -- Get JWT claims as raw text first for debugging
  claims_raw := current_setting('request.jwt.claims', true);
  
  -- Log raw claims for debugging
  RAISE LOG 'Raw JWT claims setting: %', claims_raw;
  
  -- Check if claims exist
  IF claims_raw IS NULL OR claims_raw = '' THEN
    RAISE LOG 'No JWT claims found - JWT may not be properly configured or verified';
    RETURN NULL;
  END IF;
  
  -- Parse claims as JSONB
  claims := claims_raw::jsonb;
  
  -- Log parsed claims for debugging
  RAISE LOG 'Parsed JWT claims: %', claims;
  
  -- Extract user ID from 'sub' claim (automatically set by Clerk)
  user_id := claims->>'sub';
  
  -- Log extracted user ID for debugging
  RAISE LOG 'Extracted user ID from JWT: %', user_id;
  
  -- Return user ID if found, otherwise NULL
  RETURN user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detailed error for debugging
    RAISE LOG 'Error extracting user ID from JWT: %', SQLERRM;
    RAISE LOG 'Error context: claims_raw="%", claims=%', claims_raw, claims;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function (should return null without JWT)
SELECT get_user_id_from_jwt() as test_result;

-- Check current JWT claims setting (should be null)
SELECT current_setting('request.jwt.claims', true) as jwt_claims;

-- Verify RLS is enabled on crawl_progress
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'crawl_progress';

-- Show RLS policies on crawl_progress
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'crawl_progress'; 