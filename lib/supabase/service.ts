import { createClient } from '@supabase/supabase-js'

// Usa a service role key — bypass de RLS
// Só usar em server-side (route handlers, server actions)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
