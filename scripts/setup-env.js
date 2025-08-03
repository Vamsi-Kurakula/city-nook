#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 City Crawler Environment Setup');
  console.log('=====================================\n');

  console.log('This script will help you set up environment variables for your City Crawler app.');
  console.log('You can run this script multiple times to update your configuration.\n');

  // Ask for environment type
  const envType = await question('Which environment are you setting up? (development/staging/production): ');
  
  if (!['development', 'staging', 'production'].includes(envType.toLowerCase())) {
    console.error('❌ Invalid environment type. Please choose development, staging, or production.');
    rl.close();
    return;
  }

  console.log(`\n📝 Setting up ${envType} environment variables...\n`);

  // Collect environment variables
  const envVars = {};

  // Clerk Configuration
  console.log('🔐 Clerk Authentication Setup');
  envVars.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = await question(
    'Enter your Clerk Publishable Key (pk_test_... for dev/staging, pk_live_... for production): '
  );

  // Supabase Configuration
  console.log('\n🗄️  Supabase Database Setup');
  envVars.EXPO_PUBLIC_SUPABASE_URL = await question('Enter your Supabase URL (https://your-project-id.supabase.co): ');
  envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY = await question('Enter your Supabase Anon Key: ');
  
  if (envType.toLowerCase() === 'development') {
    envVars.SUPABASE_SERVICE_KEY = await question('Enter your Supabase Service Key (for migrations): ');
  }

  // Google Maps Configuration
  console.log('\n🗺️  Google Maps Setup');
  envVars.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = await question('Enter your Google Maps API Key: ');

  // Generate .env file content
  let envContent = `# City Crawler Environment Variables - ${envType.toUpperCase()}\n`;
  envContent += `# Generated on ${new Date().toISOString()}\n\n`;

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      envContent += `${key}=${value}\n`;
    }
  });

  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Environment variables saved to .env file!');
  console.log('\n📋 Next steps:');
  console.log('1. For local development: Run "npm start" to test your app');
  console.log('2. For Android build: Run "eas build --platform android --profile production"');
  console.log('3. For iOS build: Run "eas build --platform ios --profile production"');
  console.log('\n⚠️  Important:');
  console.log('- Never commit the .env file to version control');
  console.log('- Use different API keys for different environments');
  console.log('- For production builds, update the values in eas.json with your actual keys');

  rl.close();
}

// Handle script execution
if (require.main === module) {
  setupEnvironment().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupEnvironment }; 