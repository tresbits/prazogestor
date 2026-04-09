'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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

export async function criarCliente(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) return { error: 'Escritório não encontrado.' }

  const cnpjRaw = (formData.get('cnpj') as string).replace(/\D/g, '')
  const nomeDigitado = (formData.get('nome') as string).trim()
  const regime = formData.get('regime') as string
  const temEmpregados = formData.get('tem_empregados') === 'true'

  if (cnpjRaw.length !== 14) return { error: 'CNPJ inválido.' }

  // Verificar rate limit antes de consultar BrasilAPI
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

  // Busca o id do cliente recém-criado para gerar os vencimentos
  const { data: novoCliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('escritorio_id', escritorio.id)
    .eq('cnpj', cnpjRaw)
    .single()

  if (novoCliente) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const umAnoDepois = new Date(hoje)
    umAnoDepois.setFullYear(hoje.getFullYear() + 1)

    const ano = hoje.getFullYear()
    // Gera apenas dentro da janela [hoje, hoje + 1 ano]
    await gerarVencimentos(supabase, novoCliente.id, regime as Regime, temEmpregados, ano, hoje, umAnoDepois)
    await gerarVencimentos(supabase, novoCliente.id, regime as Regime, temEmpregados, ano + 1, hoje, umAnoDepois)
  }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}

export async function deletarCliente(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) return { error: 'Escritório não encontrado.' }

  const clienteId = formData.get('cliente_id') as string

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', clienteId)
    .eq('escritorio_id', escritorio.id)

  if (error) return { error: 'Erro ao excluir. Tente novamente.' }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}

export async function atualizarCliente(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) return { error: 'Escritório não encontrado.' }

  const clienteId = formData.get('cliente_id') as string
  const nome = (formData.get('nome') as string).trim()
  const regime = formData.get('regime') as Regime
  const temEmpregados = formData.get('tem_empregados') === 'true'

  // Confirma que o cliente pertence a este escritório
  const { data: clienteAtual } = await supabase
    .from('clientes')
    .select('regime, tem_empregados')
    .eq('id', clienteId)
    .eq('escritorio_id', escritorio.id)
    .single()

  if (!clienteAtual) return { error: 'Cliente não encontrado.' }

  const { error } = await supabase
    .from('clientes')
    .update({ nome, regime, tem_empregados: temEmpregados })
    .eq('id', clienteId)
    .eq('escritorio_id', escritorio.id)

  if (error) return { error: 'Erro ao atualizar. Tente novamente.' }

  // Se regime ou empregados mudou, regenera vencimentos futuros
  const regimeMudou = clienteAtual.regime !== regime
  const empregadosMudou = clienteAtual.tem_empregados !== temEmpregados

  if (regimeMudou || empregadosMudou) {
    const hoje = new Date().toISOString().split('T')[0]
    await supabase
      .from('obrigacoes_cliente')
      .delete()
      .eq('cliente_id', clienteId)
      .gte('data_vencimento', hoje)
      .eq('status', 'pendente')

    const ano = new Date().getFullYear()
    await gerarVencimentos(supabase, clienteId, regime, temEmpregados, ano)
    await gerarVencimentos(supabase, clienteId, regime, temEmpregados, ano + 1)
  }

  revalidatePath('/clientes')
  revalidatePath('/painel')
  return { success: true }
}
