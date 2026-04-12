'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

export async function onboardingCreateOffice(_: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  const state = formData.get('state') as string

  if (!name || !state) return { error: 'Preencha todos os campos.' }

  const { error } = await supabase.from('offices').insert({
    user_id: user.id,
    name,
    state,
    plan: 'trial',
  })

  if (error) {
    if (error.code === '23505') return { error: 'Escritório já cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  redirect('/onboarding/cliente')
}

export async function onboardingCreateClient(_: unknown, formData: FormData) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) redirect('/onboarding/escritorio')

  const cnpjRaw = (formData.get('cnpj') as string).replace(/\D/g, '')
  const nameTyped = (formData.get('name') as string).trim()
  const taxRegime = formData.get('tax_regime') as TaxRegime
  const hasEmployees = formData.get('has_employees') === 'true'

  if (cnpjRaw.length !== 14) return { error: 'CNPJ inválido.' }

  const { data: allowed } = await supabase.rpc('check_cnpj_rate_limit', {
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

  const { data: newClient } = await supabase
    .from('clients')
    .select('id')
    .eq('office_id', office.id)
    .eq('cnpj', cnpjRaw)
    .single()

  if (newClient) {
    const year = new Date().getFullYear()
    await gerarVencimentos(supabase, newClient.id, taxRegime, hasEmployees, year)
    await gerarVencimentos(supabase, newClient.id, taxRegime, hasEmployees, year + 1)
  }

  await supabase
    .from('offices')
    .update({ onboarding_completed: true })
    .eq('id', office.id)

  redirect('/onboarding/pronto')
}

export async function onboardingSkipClient() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('offices')
    .update({ onboarding_skipped_client: true, onboarding_completed: true })
    .eq('user_id', user.id)

  redirect('/onboarding/pronto')
}
