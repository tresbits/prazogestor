import type { SupabaseClient } from '@supabase/supabase-js'
import type { TaxRegime } from '@/types'

// Retorna data no formato YYYY-MM-DD sem conversão de timezone
function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function nextBusinessDay(date: Date, holidays: Set<string>): Date {
  const d = new Date(date)
  while (d.getDay() === 0 || d.getDay() === 6 || holidays.has(toISODate(d))) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function previousBusinessDay(date: Date, holidays: Set<string>): Date {
  const d = new Date(date)
  while (d.getDay() === 0 || d.getDay() === 6 || holidays.has(toISODate(d))) {
    d.setDate(d.getDate() - 1)
  }
  return d
}

function adjustDate(
  date: Date,
  rule: 'postpone' | 'advance',
  holidays: Set<string>
): Date {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const isHoliday = holidays.has(toISODate(date))
  if (!isWeekend && !isHoliday) return date
  return rule === 'postpone'
    ? nextBusinessDay(date, holidays)
    : previousBusinessDay(date, holidays)
}

export async function gerarVencimentos(
  supabase: SupabaseClient,
  clientId: string,
  taxRegime: TaxRegime,
  hasEmployees: boolean,
  year: number,
  startDate?: Date, // só gera obrigações a partir desta data (inclusive)
  endDate?: Date,   // só gera obrigações até esta data (inclusive)
) {
  // Busca os templates aplicáveis ao regime do cliente
  const { data: templates, error: tErr } = await supabase
    .from('obligation_templates')
    .select('*')
    .contains('tax', [taxRegime])

  if (tErr || !templates?.length) return

  // Filtra por requires_employees
  const applicable = templates.filter(
    (t) => !t.requires_employees || hasEmployees
  )

  // Busca feriados nacionais do ano
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const { data: holidayRows } = await supabase
    .from('holidays')
    .select('date')
    .gte('date', yearStart)
    .lte('date', yearEnd)
    .eq('type', 'national')

  const holidays = new Set<string>(holidayRows?.map((h) => h.date) ?? [])

  const obligations: {
    client_id: string
    template_id: string
    due_date: string
    status: 'pending'
  }[] = []

  function withinWindow(date: Date): boolean {
    if (startDate && date < startDate) return false
    if (endDate   && date > endDate)   return false
    return true
  }

  for (const t of applicable) {
    if (t.frequency === 'monthly') {
      for (let month = 1; month <= 12; month++) {
        const day = t.due_day ?? 1
        // Vencimento é no mês SEGUINTE à competência
        const dueMonth = month === 12 ? 1 : month + 1
        const dueYear  = month === 12 ? year + 1 : year
        const raw = new Date(dueYear, dueMonth - 1, day)
        const adjusted = adjustDate(raw, t.adjustment_rule, holidays)
        if (!withinWindow(adjusted)) continue
        obligations.push({
          client_id: clientId,
          template_id: t.id,
          due_date: toISODate(adjusted),
          status: 'pending',
        })
      }
    } else if (t.frequency === 'annual' && t.due_month && t.due_day) {
      const raw = new Date(year, t.due_month - 1, t.due_day)
      const adjusted = adjustDate(raw, t.adjustment_rule, holidays)
      if (!withinWindow(adjusted)) continue
      obligations.push({
        client_id: clientId,
        template_id: t.id,
        due_date: toISODate(adjusted),
        status: 'pending',
      })
    }
  }

  if (obligations.length) {
    await supabase.from('client_obligations').insert(obligations)
  }
}
