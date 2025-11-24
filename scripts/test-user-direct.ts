// Direct Supabase client test
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('URL:', url ? 'Set' : 'NOT SET')
console.log('Service Key:', serviceKey ? 'Set (length: ' + serviceKey.length + ')' : 'NOT SET')

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function test() {
  console.log('\nTesting users table query with service role key (bypasses RLS)...')
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', '8c72a86d-ac4c-4fcc-9a50-490dc775a508')
    .single()
  
  if (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2))
    process.exit(1)
  } else {
    console.log('✅ User found:', data)
  }
}

test()
