'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { gerarVencimentos } from '@/lib/gerar-vencimentos'
import type { TaxRegime } from '@/types'

async function buscarRazaoSocial(cnpj: string): Promise<string | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.razao_social ?? null
  } catch {
    return null
  }
}

export async function createClient(_: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return { error: 'Escritório não encontrado.' }

  const cnpjRaw = (formData.get('cnpj') as string).replace(/\D/g, '')
  const nameTyped = (formData.get('name') as string).trim()
  const taxRegime = formData.get('tax_regime') as string
  const hasEmployees = formData.get('has_employees') === 'true'

  if (cnpjRaw.length !== 14) return { error: 'CNPJ inválido.' }

  // Verificar rate limit antes de consultar BrasilAPI
  const { data: allowed } = await supabase.rpc('purgar_cnpj_rate_limit', {
    p_office_id: office.id,
  })

  let finalName = nameTyped
  if (allowed) {
    const businessName = await buscarRazaoSocial(cnpjRaw)
    if (businessName) finalName = businessName
  }

  const { error } = await supabase.from('clients').insert({
    office_id: office.id,
    cnpj: cnpjRaw,
    name: finalName,
    tax_regime: taxRegime,
    has_employees: hasEmployees,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Este CNPJ já está cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  // Busca o id do cliente recém-criado para gerar os vencimentos
  const { data: newClient } = await supabase
    .from('clients')
    .select('id')
    .eq('office_id', office.id)
    .eq('cnpj', cnpjRaw)
    .single()

  if (newClient) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const oneYearLater = new Date(today)
    oneYearLater.setFullYear(today.getFullYear() + 1)

    const year = today.getFullYear()
    await gerarVencimentos(supabase, newClient.id, taxRegime as TaxRegime, hasEmployees, year, today, oneYearLater)
    await gerarVencimentos(supabase, newClient.id, taxRegime as TaxRegime, hasEmployees, year + 1, today, oneYearLater)
  }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}

export async function deleteClient(_: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return { error: 'Escritório não encontrado.' }

  const clientId = formData.get('client_id') as string

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('office_id', office.id)

  if (error) return { error: 'Erro ao excluir. Tente novamente.' }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}

export async function updateClient(_: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return { error: 'Escritório não encontrado.' }

  const clientId = formData.get('client_id') as string
  const name = (formData.get('name') as string).trim()
  const taxRegime = formData.get('tax_regime') as TaxRegime
  const hasEmployees = formData.get('has_employees') === 'true'

  // Confirma que o cliente pertence a este escritório
  const { data: currentClient } = await supabase
    .from('clients')
    .select('tax_regime, has_employees')
    .eq('id', clientId)
    .eq('office_id', office.id)
    .single()

  if (!currentClient) return { error: 'Cliente não encontrado.' }

  const { error } = await supabase
    .from('clients')
    .update({ name, tax_regime: taxRegime, has_employees: hasEmployees })
    .eq('id', clientId)
    .eq('office_id', office.id)

  if (error) return { error: 'Erro ao atualizar. Tente novamente.' }

  // Se regime ou empregados mudou, regenera vencimentos futuros
  const regimeChanged = currentClient.tax_regime !== taxRegime
  const employeesChanged = currentClient.has_employees !== hasEmployees

  if (regimeChanged || employeesChanged) {
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('client_obligations')
      .delete()
      .eq('client_id', clientId)
      .gte('due_date', today)
      .eq('status', 'pending')

    const year = new Date().getFullYear()
    await gerarVencimentos(supabase, clientId, taxRegime, hasEmployees, year)
    await gerarVencimentos(supabase, clientId, taxRegime, hasEmployees, year + 1)
  }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}
