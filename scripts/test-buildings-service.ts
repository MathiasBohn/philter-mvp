import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testBuildings() {
  console.log('Checking buildings with service role (bypasses RLS)...\n')

  const { data, error, count } = await supabase
    .from('buildings')
    .select('id, name, code', { count: 'exact' })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`Found ${count} buildings:`)
  console.log(JSON.stringify(data, null, 2))
}

testBuildings()
