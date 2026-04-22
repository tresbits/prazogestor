import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProximosView } from './_components/proximos-view'
import { getUpcomingRange } from '../_lib/periods'
import { PageBreadcrumb, PageTitle, MetricPill } from '../../_components/page-header'
import { cn } from '@/lib/utils'

const PERIODS = [
  { key: 'hoje',      label: 'Hoje' },
  { key: 'semana',    label: 'Esta semana' },
  { key: '15dias',    label: 'Próximos 15 dias' },
  { key: 'mes',       label: 'Este mês' },
  { key: 'trimestre', label: 'Este trimestre' },
]

const OB_SELECT = `
  id, due_date, status, value,
  obligation_templates ( acronym, name ),
  clients!inner ( id, name, cnpj, tax_regime, office_id )
`

type ObRow = {
  id: string
  due_date: string
  status: string
  value: number | null
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  clients: { id: string; name: string; cnpj: string; tax_regime: string; office_id: string }[]
    | { id: string; name: string; cnpj: string; tax_regime: string; office_id: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

function getDays(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function ProximosPage({
  searchParams,
}: {
  searchParams: Promise<{
    cliente?: string
    regime?: string
    periodo?: string
  }>
}) {
  const { cliente = '', regime = '', periodo = 'mes' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices').select('id').eq('user_id', user.id).single()
  if (!office) return null

  const { start, end } = getUpcomingRange(periodo)

  let baseQuery = supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .in('status', ['pending', 'overdue'])
    .gte('due_date', start)
    .lte('due_date', end)
    .order('due_date', { ascending: true })

  if (cliente) baseQuery = baseQuery.eq('client_id', cliente)
  if (regime)  baseQuery = baseQuery.eq('clients.tax_regime', regime)

  const { data: raw } = await baseQuery.limit(500)

  const items = ((raw as ObRow[] | null) ?? []).map(o => {
    const t = unwrap(o.obligation_templates)
    const c = unwrap(o.clients)
    return {
      id: o.id,
      due_date: o.due_date,
      status: o.status,
      value: o.value,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      clientId: c?.id ?? '',
      clientName: c?.name ?? '',
      clientCnpj: c?.cnpj ?? '',
      taxRegime: c?.tax_regime ?? '',
      dias: getDays(o.due_date),
    }
  }).filter(o => o.clientId)

  // Metrics
  const total        = items.length
  const overdueCount = items.filter(o => o.status === 'overdue' || o.dias < 0).length
  const todayCount   = items.filter(o => o.dias === 0).length

  // All clients for filter dropdown
  const { data: allClients } = await supabase
    .from('clients').select('id, name').eq('office_id', office.id).order('name')

  const current = { cliente, regime, periodo }

  return (
    <div className="mx-auto space-y-6">

      <PageBreadcrumb parent={{ label: 'Overview', href: '/overview' }} current="Vencimentos" />

      <div className="space-y-4">
        <PageTitle>Próximos<br />Vencimentos</PageTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <MetricPill>{total} em aberto</MetricPill>
          {overdueCount > 0 && (
            <MetricPill variant="destructive">
              {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}
            </MetricPill>
          )}
          {todayCount > 0 && (
            <MetricPill variant="warning">
              {todayCount} vence hoje
            </MetricPill>
          )}
        </div>
      </div>

      {/* Grid + integrated toolbar */}
      <ProximosView
        items={items}
        clients={allClients ?? []}
        periods={PERIODS}
        current={current}
      />

    </div>
  )
}
