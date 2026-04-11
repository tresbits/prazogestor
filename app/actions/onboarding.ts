'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { gerarVencimentos } from '@/lib/gerar-vencimentos'
import type { Regime } from '@/types'

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

export async function onboardingCriarEscritorio(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nome = (formData.get('nome') as string).trim()
  const estado = formData.get('estado') as string

  if (!nome || !estado) return { error: 'Preencha todos os campos.' }

  const { error } = await supabase.from('escritorios').insert({
    user_id: user.id,
    nome,
    estado,
    plano: 'trial',
  })

  if (error) {
    if (error.code === '23505') return { error: 'Escritório já cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  redirect('/onboarding/cliente')
}

export async function onboardingCriarCliente(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')

  const cnpjRaw = (formData.get('cnpj') as string).replace(/\D/g, '')
  const nomeDigitado = (formData.get('nome') as string).trim()
  const regime = formData.get('regime') as Regime
  const temEmpregados = formData.get('tem_empregados') === 'true'

  if (cnpjRaw.length !== 14) return { error: 'CNPJ inválido.' }

  const { data: permitido } = await supabase.rpc('verificar_cnpj_rate_limit', {
    p_escritorio_id: escritorio.id,
  })

  let nomeFinal = nomeDigitado
  if (permitido) {
    const razaoSocial = await buscarRazaoSocial(cnpjRaw)
    if (razaoSocial) nomeFinal = razaoSocial
  }

  const { error } = await supabase.from('clientes').insert({
    escritorio_id: escritorio.id,
    cnpj: cnpjRaw,
    nome: nomeFinal,
    regime,
    tem_empregados: temEmpregados,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Este CNPJ já está cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  const { data: novoCliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('escritorio_id', escritorio.id)
    .eq('cnpj', cnpjRaw)
    .single()

  if (novoCliente) {
    const ano = new Date().getFullYear()
    await gerarVencimentos(supabase, novoCliente.id, regime, temEmpregados, ano)
    await gerarVencimentos(supabase, novoCliente.id, regime, temEmpregados, ano + 1)
  }

  await supabase
    .from('escritorios')
    .update({ onboarding_concluido: true })
    .eq('id', escritorio.id)

  redirect('/onboarding/pronto')
}

export async function onboardingPularCliente() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('escritorios')
    .update({ onboarding_pulou_cliente: true, onboarding_concluido: true })
    .eq('user_id', user.id)

  redirect('/onboarding/pronto')
}
