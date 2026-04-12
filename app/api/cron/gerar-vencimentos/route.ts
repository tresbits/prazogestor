import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { gerarVencimentos } from '@/lib/gerar-vencimentos'
import type { TaxRegime } from '@/types'

// Vercel Cron envia: Authorization: Bearer <CRON_SECRET>
// Configurar CRON_SECRET nas env vars do projeto Vercel.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Alvo: mês exatamente 12 meses à frente
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth() + 12, 1)
  const targetYear = target.getFullYear()
  const targetMonth = target.getMonth() + 1 // 1-based

  const firstDay = new Date(targetYear, targetMonth - 1, 1)
  const lastDay = new Date(targetYear, targetMonth, 0) // último dia do mês

  const isoFirst = toISODate(firstDay)
  const isoLast = toISODate(lastDay)

  // Busca todos os clientes do sistema
  const { data: clients, error: cErr } = await supabase
    .from('clients')
    .select('id, tax_regime, has_employees')

  if (cErr) {
    console.error('[cron:gerar-vencimentos]', cErr)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }

  let generated = 0
  let skipped = 0

  for (const client of clients ?? []) {
    // Pula se já existem vencimentos para o mês alvo (evita duplicatas)
    const { count } = await supabase
      .from('client_obligations')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id)
      .gte('due_date', isoFirst)
      .lte('due_date', isoLast)

    if (count && count > 0) {
      skipped++
      continue
    }

    await gerarVencimentos(
      supabase,
      client.id,
      client.tax_regime as TaxRegime,
      client.has_employees,
      targetYear,
      firstDay,
      lastDay
    )
    generated++
  }

  console.log(`[cron:gerar-vencimentos] ${isoFirst}–${isoLast}: generated=${generated} skipped=${skipped}`)
  return NextResponse.json({ ok: true, mes: `${targetYear}-${String(targetMonth).padStart(2, '0')}`, generated, skipped })
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
