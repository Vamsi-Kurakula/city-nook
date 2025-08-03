#!/usr/bin/env node

/**
 * Test script to verify environment variables are properly configured
 * Run this script to check if your environment variables are accessible
 */

require('dotenv/config');

console.log('🔍 Testing Environment Variables...\n');

const requiredVars = [
  'CLERK_PUBLISHABLE_KEY',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY'
];

const optionalVars = [
  'GOOGLE_MAPS_API_KEY'
];

let allValid = true;

// Check required variables
console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    allValid = false;
  } else {
    // Basic validation
    let isValid = true;
    let message = 'Valid';
    
    if (varName === 'CLERK_PUBLISHABLE_KEY' && !value.startsWith('pk_')) {
      isValid = false;
      message = 'Invalid format (should start with pk_)';
    } else if (varName === 'SUPABASE_URL' && !value.includes('supabase.co')) {
      isValid = false;
      message = 'Invalid format (should contain supabase.co)';
    } else if (varName === 'SUPABASE_ANON_KEY' && !value.startsWith('eyJ')) {
      isValid = false;
      message = 'Invalid format (should start with eyJ)';
    }
    
    if (isValid) {
      console.log(`✅ ${varName}: ${message}`);
    } else {
      console.log(`❌ ${varName}: ${message}`);
      allValid = false;
    }
  }
});

// Check optional variables
console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Missing (optional)`);
  } else {
    console.log(`✅ ${varName}: Valid`);
  }
});

console.log('\n📊 Summary:');
if (allValid) {
  console.log('🎉 All required environment variables are properly configured!');
  console.log('✅ Your app should work correctly in both development and production.');
} else {
  console.log('🚨 Some required environment variables are missing or invalid!');
  console.log('❌ Your app may not function properly in production builds.');
  console.log('\n💡 To fix this:');
  console.log('1. Check your .env file for local development');
  console.log('2. Set environment variables in your Expo project dashboard for production');
  console.log('3. Ensure you\'re using the correct API keys (production vs development)');
}

console.log('\n🔧 Next Steps:');
console.log('1. For local development: Ensure your .env file is properly configured');
console.log('2. For production: Set environment variables in Expo project dashboard');
console.log('3. Test your app with: npm start');
console.log('4. Build for production with: eas build --platform ios --profile production'); 