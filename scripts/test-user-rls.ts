import { createClient } from '@/lib/supabase/server'

async function testUserQuery() {
  console.log('Testing user query with service role...')
  
  const supabase = await createClient()
  
  // Test with service role (bypasses RLS)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', '8c72a86d-ac4c-4fcc-9a50-490dc775a508')
    .single()
  
  if (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Success! User found:',JSON.stringify(data, null, 2))
  }
}

testUserQuery()
