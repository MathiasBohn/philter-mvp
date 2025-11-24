import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function testLookup() {
  console.log('Testing building code lookup...\n')

  // Test 1: List all buildings
  const { data: allBuildings, error: allError } = await supabase
    .from('buildings')
    .select('id, name, code')

  if (allError) {
    console.error('❌ Error fetching all buildings:', allError)
  } else {
    console.log('✅ All buildings:')
    console.log(allBuildings)
  }

  console.log('\n---\n')

  // Test 2: Look up DAKOTA
  const { data: dakota, error: dakotaError } = await supabase
    .from('buildings')
    .select('id, name, code')
    .eq('code', 'DAKOTA')
    .single()

  if (dakotaError) {
    console.error('❌ Error looking up DAKOTA:', dakotaError)
  } else {
    console.log('✅ Found DAKOTA:')
    console.log(dakota)
  }
}

testLookup()
