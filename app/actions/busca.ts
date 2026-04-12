'use server'

import { createClient } from '@/lib/supabase/server'

export type ClientSearch = {
  id: string
  name: string
  cnpj: string
  tax_regime: string
}

export async function searchClients(q: string): Promise<ClientSearch[]> {
  if (!q.trim()) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return []

  const { data } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime')
    .eq('office_id', office.id)
    .ilike('name', `%${q.trim()}%`)
    .order('name')
    .limit(8)

  return data ?? []
}
