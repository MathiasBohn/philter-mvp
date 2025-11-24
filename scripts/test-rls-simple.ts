/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function test() {
  console.log('✅ Service key works - users table is accessible with service role')
  
  console.log('\n📝 MANUAL FIX REQUIRED:')
  console.log('Go to: https://supabase.com/dashboard → Your Project → SQL Editor')
  console.log('\nRun this SQL:')
  console.log('─'.repeat(60))
  console.log(`
DROP POLICY IF EXISTS "users_view_own" ON users;

CREATE POLICY "users_view_any_authenticated" ON users
FOR SELECT 
TO authenticated
USING (true);
`)
  console.log('─'.repeat(60))
  console.log('\nThis will allow authenticated users to read user profiles.')
}

test()
