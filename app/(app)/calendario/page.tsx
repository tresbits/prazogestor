import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { monthName } from '@/lib/format'
import { CalendarioControls } from './_components/calendario-controls'
import { PageTitle, MetricPill } from '../_components/page-header'

type ObRow = {
  id: string
  due_date: string
  status: string
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  clients: { id: string; name: string; cnpj: string }[] | { id: string; name: string; cnpj: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

export type ObrigacaoCalendario = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
  clientId: string
  clientName: string
  clientCnpj: string
}

const OB_SELECT = `id, due_date, status, obligation_templates ( acronym, name ), clients!inner ( id, name, cnpj, office_id )`

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; q?: string }>
}) {
  const params = await searchParams

  let year: number
  let month: number

  if (params.mes && /^\d{4}-\d{2}$/.test(params.mes)) {
    const [y, m] = params.mes.split('-').map(Number)
    year = y
    month = m
  } else {
    const today = new Date()
    year = today.getFullYear()
    month = today.getMonth() + 1
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDayNum = new Date(year, month, 0).getDate()
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`

  const { data: rows } = await supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .gte('due_date', firstDay)
    .lte('due_date', lastDay)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })

  const daysMap: Record<string, ObrigacaoCalendario[]> = {}

  for (const row of (rows ?? []) as ObRow[]) {
    const t = unwrap(row.obligation_templates)
    const c = unwrap(row.clients)
    if (!c) continue
    const item: ObrigacaoCalendario = {
      id: row.id,
      due_date: row.due_date,
      status: row.status,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      clientId: c.id,
      clientName: c.name,
      clientCnpj: c.cnpj ?? '',
    }
    if (!daysMap[row.due_date]) daysMap[row.due_date] = []
    daysMap[row.due_date].push(item)
  }

  const monthLabel = `${monthName(month)} ${year}`

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <PageTitle>Calendário</PageTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <MetricPill>{monthLabel}</MetricPill>
        </div>
      </div>
      <CalendarioControls daysMap={daysMap} year={year} month={month} monthLabel={monthLabel} filter={params.q?.trim()} />
    </div>
  )
}
