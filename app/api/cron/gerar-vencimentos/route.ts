import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { gerarVencimentos } from '@/lib/gerar-vencimentos'
import type { Regime } from '@/types'

// Vercel Cron envia: Authorization: Bearer <CRON_SECRET>
// Configurar CRON_SECRET nas env vars do projeto Vercel.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Alvo: mês exatamente 12 meses à frente
  const hoje = new Date()
  const target = new Date(hoje.getFullYear(), hoje.getMonth() + 12, 1)
  const targetAno = target.getFullYear()
  const targetMes = target.getMonth() + 1 // 1-based

  const primeiroDia = new Date(targetAno, targetMes - 1, 1)
  const ultimoDia = new Date(targetAno, targetMes, 0) // último dia do mês

  const isoFirst = toISODate(primeiroDia)
  const isoLast = toISODate(ultimoDia)

  // Busca todos os clientes do sistema
  const { data: clientes, error: cErr } = await supabase
    .from('clientes')
    .select('id, regime, tem_empregados')

  if (cErr) {
    console.error('[cron:gerar-vencimentos]', cErr)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }

  let gerados = 0
  let pulados = 0

  for (const cliente of clientes ?? []) {
    // Pula se já existem vencimentos para o mês alvo (evita duplicatas)
    const { count } = await supabase
      .from('obrigacoes_cliente')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', cliente.id)
      .gte('data_vencimento', isoFirst)
      .lte('data_vencimento', isoLast)

    if (count && count > 0) {
      pulados++
      continue
    }

    await gerarVencimentos(
      supabase,
      cliente.id,
      cliente.regime as Regime,
      cliente.tem_empregados,
      targetAno,
      primeiroDia,
      ultimoDia
    )
    gerados++
  }

  console.log(`[cron:gerar-vencimentos] ${isoFirst}–${isoLast}: gerados=${gerados} pulados=${pulados}`)
  return NextResponse.json({ ok: true, mes: `${targetAno}-${String(targetMes).padStart(2, '0')}`, gerados, pulados })
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
