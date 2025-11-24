import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkUser() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Users in database:', users?.length || 0)
    users?.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.role}) [${user.id}]`)
    })
  }
}

checkUser()
