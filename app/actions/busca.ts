'use server'

import { createClient } from '@/lib/supabase/server'

export type ClienteBusca = {
  id: string
  nome: string
  cnpj: string
  regime: string
}

export async function buscarClientes(q: string): Promise<ClienteBusca[]> {
  if (!q.trim()) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) return []

  const { data } = await supabase
    .from('clientes')
    .select('id, nome, cnpj, regime')
    .eq('escritorio_id', escritorio.id)
    .ilike('nome', `%${q.trim()}%`)
    .order('nome')
    .limit(8)

  return data ?? []
}
