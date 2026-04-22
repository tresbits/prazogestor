'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeObligation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const obligationId = formData.get('obligation_id') as string
  const valueRaw = formData.get('value') as string | null
  const value = valueRaw ? parseFloat(valueRaw.replace(',', '.')) : null

  const update: Record<string, unknown> = {
    status: 'completed',
    completed_by: user.email,
    completed_at: new Date().toISOString(),
  }

  if (value !== null && !isNaN(value) && value > 0) {
    update.value = value
    update.value_source = 'manual'
  }

  const { error } = await supabase
    .from('client_obligations')
    .update(update)
    .eq('id', obligationId)

  if (error) return { error: 'Não foi possível registrar a conclusão. Tente novamente.' }

  revalidatePath('/overview')
  revalidatePath('/calendario')
  revalidatePath('/clientes', 'layout')
  return { success: true }
}

function revalidateAll() {
  revalidatePath('/overview')
  revalidatePath('/overview')
  revalidatePath('/overview/proximos')
  revalidatePath('/calendario')
  revalidatePath('/clientes', 'layout')
}

export async function concluirObrigacoes(ids: string[]) {
  if (!ids.length) return { error: 'Nenhuma obrigação selecionada.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices').select('id').eq('user_id', user.id).single()
  if (!office) return { error: 'Escritório não encontrado.' }

  // Only update obligations belonging to this office
  const { data: valid } = await supabase
    .from('client_obligations')
    .select('id, clients!inner(office_id)')
    .eq('clients.office_id', office.id)
    .in('id', ids)

  const validIds = (valid ?? []).map((o: { id: string }) => o.id)
  if (!validIds.length) return { error: 'Obrigações não encontradas.' }

  const { error } = await supabase
    .from('client_obligations')
    .update({
      status: 'completed',
      completed_by: user.email,
      completed_at: new Date().toISOString(),
    })
    .in('id', validIds)

  if (error) return { error: 'Erro ao concluir obrigações.' }
  revalidateAll()
  return { success: true }
}

export async function adiarObrigacoes(ids: string[], dias: number = 7) {
  if (!ids.length) return { error: 'Nenhuma obrigação selecionada.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices').select('id').eq('user_id', user.id).single()
  if (!office) return { error: 'Escritório não encontrado.' }

  const { data: existing } = await supabase
    .from('client_obligations')
    .select('id, due_date, clients!inner(office_id)')
    .eq('clients.office_id', office.id)
    .in('id', ids)

  if (!existing?.length) return { error: 'Obrigações não encontradas.' }

  const updates = existing.map((ob: { id: string; due_date: string }) => {
    const d = new Date(ob.due_date + 'T00:00:00')
    d.setDate(d.getDate() + dias)
    return { id: ob.id, due_date: d.toISOString().split('T')[0], status: 'pending' }
  })

  const { error } = await supabase.from('client_obligations').upsert(updates)
  if (error) return { error: 'Erro ao adiar obrigações.' }
  revalidateAll()
  return { success: true }
}
