import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyFix() {
  const sql = `
DROP FUNCTION IF EXISTS get_user_role();

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS role_enum
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role public.role_enum;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();

  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO service_role;
  `

  console.log('Applying SQL fix for infinite recursion...')
  const { error } = await supabase.rpc('query', { query_text: sql })

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log('✅ Fix applied successfully')
}

applyFix()
