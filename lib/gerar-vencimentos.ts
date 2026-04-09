import type { SupabaseClient } from '@supabase/supabase-js'
import type { Regime } from '@/types'

// Retorna data no formato YYYY-MM-DD sem conversão de timezone
function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function proximoDiaUtil(date: Date, feriados: Set<string>): Date {
  const d = new Date(date)
  while (d.getDay() === 0 || d.getDay() === 6 || feriados.has(toISODate(d))) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function anteriorDiaUtil(date: Date, feriados: Set<string>): Date {
  const d = new Date(date)
  while (d.getDay() === 0 || d.getDay() === 6 || feriados.has(toISODate(d))) {
    d.setDate(d.getDate() - 1)
  }
  return d
}

function ajustarData(
  date: Date,
  regra: 'prorroga' | 'antecipa',
  feriados: Set<string>
): Date {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const isFeriado = feriados.has(toISODate(date))
  if (!isWeekend && !isFeriado) return date
  return regra === 'prorroga'
    ? proximoDiaUtil(date, feriados)
    : anteriorDiaUtil(date, feriados)
}

export async function gerarVencimentos(
  supabase: SupabaseClient,
  clienteId: string,
  regime: Regime,
  temEmpregados: boolean,
  ano: number,
  dataInicio?: Date, // só gera obrigações a partir desta data (inclusive)
  dataFim?: Date,    // só gera obrigações até esta data (inclusive)
) {
  // Busca os templates aplicáveis ao regime do cliente
  const { data: templates, error: tErr } = await supabase
    .from('obrigacoes_template')
    .select('*')
    .contains('regimes', [regime])

  if (tErr || !templates?.length) return

  // Filtra por requer_empregados
  const aplicaveis = templates.filter(
    (t) => !t.requer_empregados || temEmpregados
  )

  // Busca feriados nacionais do ano
  const inicioAno = `${ano}-01-01`
  const fimAno = `${ano}-12-31`
  const { data: feriadosRows } = await supabase
    .from('feriados')
    .select('data')
    .gte('data', inicioAno)
    .lte('data', fimAno)
    .eq('tipo', 'nacional')

  const feriados = new Set<string>(feriadosRows?.map((f) => f.data) ?? [])

  const obrigacoes: {
    cliente_id: string
    template_id: string
    data_vencimento: string
    status: 'pendente'
  }[] = []

  function dentroJanela(data: Date): boolean {
    if (dataInicio && data < dataInicio) return false
    if (dataFim   && data > dataFim)    return false
    return true
  }

  for (const t of aplicaveis) {
    if (t.frequencia === 'mensal') {
      for (let mes = 1; mes <= 12; mes++) {
        const dia = t.dia_vencimento ?? 1
        // Vencimento é no mês SEGUINTE à competência
        const mesVencimento = mes === 12 ? 1 : mes + 1
        const anoVencimento = mes === 12 ? ano + 1 : ano
        const raw = new Date(anoVencimento, mesVencimento - 1, dia)
        const ajustada = ajustarData(raw, t.regra_ajuste, feriados)
        if (!dentroJanela(ajustada)) continue
        obrigacoes.push({
          cliente_id: clienteId,
          template_id: t.id,
          data_vencimento: toISODate(ajustada),
          status: 'pendente',
        })
      }
    } else if (t.frequencia === 'anual' && t.mes_vencimento && t.dia_vencimento) {
      const raw = new Date(ano, t.mes_vencimento - 1, t.dia_vencimento)
      const ajustada = ajustarData(raw, t.regra_ajuste, feriados)
      if (!dentroJanela(ajustada)) continue
      obrigacoes.push({
        cliente_id: clienteId,
        template_id: t.id,
        data_vencimento: toISODate(ajustada),
        status: 'pendente',
      })
    }
  }

  if (obrigacoes.length) {
    await supabase.from('obrigacoes_cliente').insert(obrigacoes)
  }
}
