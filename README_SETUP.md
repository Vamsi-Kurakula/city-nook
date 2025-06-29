# Setup Guide

## Environment Variables Setup

1. Copy `env.template` to `.env`:
   ```bash
   cp env.template .env
   ```

2. Fill in your API keys in the `.env` file:
   ```
   CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

3. **Alternative**: You can also directly edit `utils/config.ts` and uncomment the development section to hardcode your values.

## Clerk Authentication Setup

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application and choose React Native
3. Enable Google OAuth in Social Connections
4. Copy your publishable key from API Keys section
5. Add the key to your `.env` file or `utils/config.ts`

## Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy your project URL and anon key from Settings > API
4. Add the credentials to your `.env` file or `utils/config.ts`
5. Run the SQL schema in Supabase SQL Editor:
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL commands

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore`
- Keep your API keys secure and rotate them regularly
- For development, you can hardcode values in `utils/config.ts` (but don't commit them) 