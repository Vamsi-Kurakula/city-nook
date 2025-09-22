# Supabase API Key Migration Guide

## Overview

Supabase has updated their API key format to enhance security and facilitate zero-downtime rotations. This guide helps you migrate from the old format to the new format.

## Changes Made

### 1. Updated Environment Variables

**Old Format:**
```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**New Format:**
```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_new_key_here
SUPABASE_SERVICE_KEY=sb_secret_your_new_service_role_key_here
```

### 2. Updated Files

- `env.template` - Updated with new API key format examples
- `README.md` - Updated documentation with new format
- `config/environment.ts` - Added validation for new key format
- `docs/SUPABASE_API_KEY_MIGRATION.md` - This migration guide

## Migration Steps

### Step 1: Get New API Keys

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** > **API**
3. Copy the new API keys:
   - **Public key**: `sb_publishable_...` (for client-side use)
   - **Service role key**: `sb_secret_...` (for server-side use only)

### Step 2: Update Your Environment Variables

Update your `.env` file:

```env
# Replace with your new keys
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_actual_key_here
SUPABASE_SERVICE_KEY=sb_secret_your_actual_service_role_key_here
```

### Step 3: Update Production Environment Variables

If you're using Expo Dashboard or EAS Build:

1. **Expo Dashboard**: Go to Settings > Environment Variables
2. **EAS Build**: Update your `eas.json` environment variables

### Step 4: Test Your Application

1. Start your development server: `npm start`
2. Check the console for any validation warnings
3. Test all Supabase functionality in your app

## Key Benefits

- **Enhanced Security**: New keys provide better security features
- **Zero-Downtime Rotations**: Keys can be rotated without service interruption
- **Better Key Management**: Clearer distinction between public and private keys

## Troubleshooting

### Validation Warnings

If you see warnings like:
```
⚠️ Supabase ANON key should use new format (sb_publishable_ prefix)
⚠️ Supabase SERVICE key should use new format (sb_secret_ prefix)
```

This means you're still using the old key format. Update your keys from the Supabase dashboard.

### Backward Compatibility

- The current Supabase client (`@supabase/supabase-js@^2.50.2`) supports both old and new key formats
- However, it's recommended to migrate to the new format for security benefits
- Old keys will continue to work but may be deprecated in future versions

### Common Issues

1. **Key Not Working**: Ensure you copied the complete key including the prefix
2. **Permission Errors**: Make sure you're using the correct key type (publishable vs secret)
3. **Build Errors**: Verify environment variables are set correctly in your build environment

## Support

If you encounter issues during migration:

1. Check the [Supabase Documentation](https://supabase.com/docs/guides/api/api-keys)
2. Review the [Supabase GitHub Discussion](https://github.com/orgs/supabase/discussions/29260)
3. Verify your keys in the Supabase Dashboard

## Migration Checklist

- [ ] Updated `.env` file with new API keys
- [ ] Updated production environment variables
- [ ] Tested development environment
- [ ] Tested production build
- [ ] Verified all Supabase functionality works
- [ ] Updated team documentation if applicable
