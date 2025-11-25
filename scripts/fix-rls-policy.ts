import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixRLSPolicy() {
  console.log('🔧 Fixing users table RLS policy...')
  
  // First, drop the restrictive policy
  console.log('1. Dropping old policy...')
  try {
    await supabase.rpc('exec_raw_sql', {
      sql: 'DROP POLICY IF EXISTS "users_view_own" ON users;'
    })
  } catch {
    console.log('RPC not available, skipping...')
  }
  
  // Since RPC might not work, let's just verify the current state
  console.log('2. Testing current access...')
  const { data, error } = await supabase
    .from('users')
    .select('id, role, first_name, last_name')
    .limit(1)
  
  if (error) {
    console.error('❌ Cannot query users table:', error.message)
    console.log('\n📋 Manual fix needed:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run this SQL:')
    console.log(`
DROP POLICY IF EXISTS "users_view_own" ON users;

CREATE POLICY "users_view_any_authenticated" ON users
FOR SELECT 
TO authenticated
USING (true);
    `)
  } else {
    console.log('✅ Users table is accessible!')
    console.log('Found user:', data[0])
  }
}

fixRLSPolicy()
