# Supabase Migration Deployment Guide

## Problem
The production Supabase database doesn't have the required schema, particularly the trigger that automatically creates user profiles when someone signs up.

## Solution

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
```bash
npm install -g supabase
```

2. **Link to your project:**
```bash
supabase link --project-ref nwrluynitevbridyenpe
# When prompted, enter your database password from Supabase Dashboard
# Settings → Database → Database password
```

3. **Push migrations to production:**
```bash
supabase db push
```

This will run all migrations in the `supabase/migrations/` folder in order.

### Option 2: Manual SQL Execution (If CLI doesn't work)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/nwrluynitevbridyenpe

2. Navigate to **SQL Editor**

3. Run each migration file in order:
   - `20250101000000_initial_schema.sql` (creates tables and enums)
   - `20250101000001_create_functions_and_triggers.sql` (creates the user profile trigger)
   - `20250101000002_enable_rls.sql` (enables RLS)
   - `20250101000003_create_rls_policies.sql` (creates security policies)
   - `20250101000005_create_indexes.sql` (creates indexes)
   - `20250101000006_seed_data.sql` (optional seed data)
   - `20250123000007_create_storage_policies.sql` (storage policies)

4. Copy and paste each file's contents into the SQL Editor and run them one at a time.

## Verifying the Fix

After deployment, verify the trigger exists:

```sql
-- Run this in Supabase SQL Editor
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see:
- trigger_name: `on_auth_user_created`
- event_manipulation: `INSERT`
- event_object_table: `users`

## Testing

After deploying migrations:

1. Try signing up a new user on production
2. The user profile should be created automatically
3. Check the `users` table in Supabase Dashboard → Table Editor

## Troubleshooting

### If sign-up still fails:

1. **Check Database Logs:**
   - Go to Supabase Dashboard → Logs → Database
   - Look for errors related to the trigger

2. **Verify Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Ensure these are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Check RLS Policies:**
   ```sql
   -- View all policies on users table
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

4. **Manually test the trigger:**
   ```sql
   -- This should create a user profile automatically
   -- (Run in SQL Editor with a test email)
   INSERT INTO auth.users (
     email,
     raw_user_meta_data
   ) VALUES (
     'test@example.com',
     '{"first_name": "Test", "last_name": "User", "role": "APPLICANT"}'::jsonb
   );

   -- Then check if profile was created:
   SELECT * FROM users WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'test@example.com'
   );
   ```

## What Changed in the Code

The sign-up form (`app/(auth)/sign-up/page.tsx`) previously tried to manually insert into the `users` table, which failed due to RLS policies. Now it relies on the database trigger to automatically create the user profile.

The trigger (`create_user_profile`) runs with `SECURITY DEFINER`, which bypasses RLS and can insert into the `users` table automatically.
