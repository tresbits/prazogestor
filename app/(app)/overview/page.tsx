import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HeroHeadline } from './_components/hero-headline'
import { PendingValue } from './_components/pending-value'
import { StatsCards } from './_components/stats-cards'
import { ObligationsTimeline } from './_components/obligations-timeline'
import { ActivityFeed } from './_components/activity-feed'
import type { TimelineOb } from './_components/obligations-timeline'
import type { ActivityItem } from './_components/activity-feed'
import type { StatCard } from './_components/stats-cards'

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function getDays(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

type ObRow = {
  id: string
  due_date: string
  status: string
  value: number | null
  completed_at: string | null
  completed_by: string | null
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  clients: {
    id: string
    name: string
    cnpj: string
    tax_regime: string
    office_id: string
  }[] | {
    id: string
    name: string
    cnpj: string
    tax_regime: string
    office_id: string
  } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

const OB_SELECT = `
  id, due_date, status, value, completed_at, completed_by,
  obligation_templates ( acronym, name ),
  clients!inner ( id, name, cnpj, tax_regime, office_id )
`

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const year = today.getFullYear()
  const month = today.getMonth() // 0-indexed

  // Current fiscal quarter boundaries
  const qi = Math.floor(month / 3) // 0=Q1, 1=Q2, 2=Q3, 3=Q4
  const quarterStart = new Date(year, qi * 3, 1)
  const quarterEnd   = new Date(year, qi * 3 + 3, 0) // last day of last quarter month

  const startOfMonth     = new Date(year, month, 1)
  const startOfLastMonth = new Date(year, month - 1, 1)
  const endOfLastMonth   = new Date(year, month, 0)
  endOfLastMonth.setHours(23, 59, 59, 999)

  // Pending/overdue within current quarter
  const { data: pendingRaw } = await supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .in('status', ['pending', 'overdue'])
    .gte('due_date', toISO(quarterStart))
    .lte('due_date', toISO(quarterEnd))
    .order('due_date', { ascending: true })
    .limit(1000)

  // Completed this month — for activity feed + stats
  const { data: completedRaw } = await supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .eq('status', 'completed')
    .gte('completed_at', startOfMonth.toISOString())
    .order('completed_at', { ascending: false })
    .limit(50)

  // Completed last month (for delta)
  const { data: completedLastMonthRaw } = await supabase
    .from('client_obligations')
    .select('id, clients!inner(office_id)')
    .eq('clients.office_id', office.id)
    .eq('status', 'completed')
    .gte('completed_at', startOfLastMonth.toISOString())
    .lte('completed_at', endOfLastMonth.toISOString())
    .limit(500)

  // Total clients
  const { count: totalClients } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('office_id', office.id)

  // Clients last month (clients that existed before this month, for delta)
  const { count: clientsLastMonth } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('office_id', office.id)
    .lt('created_at', toISO(startOfMonth))

  // --- Compute derived data ---

  const pending = (pendingRaw as ObRow[] | null) ?? []
  const completed = (completedRaw as ObRow[] | null) ?? []

  // Total pending value (only obligations with value)
  const totalValue = pending
    .filter(o => o.value != null)
    .reduce((sum, o) => sum + (o.value ?? 0), 0)

  const completedLastMonthCount = completedLastMonthRaw?.length ?? 0
  const completedThisMonthCount = completed.length

  // Completeness bar: pending (Q2) + completed (this month)
  const totalForBar = pending.length + completed.length
  const completedForBar = completed.length

  // Current month (pending + overdue within the same month/year)
  const upcoming: TimelineOb[] = pending
    .filter(o => {
      const [y, m] = o.due_date.split('-').map(Number)
      return y === year && m === month + 1
    })
    .map(o => {
      const t = unwrap(o.obligation_templates)
      const c = unwrap(o.clients)
      return {
        id: o.id,
        due_date: o.due_date,
        status: o.status as 'pending' | 'overdue',
        acronym: t?.acronym ?? '',
        name: t?.name ?? '',
        value: o.value,
        clientId: c?.id ?? '',
        clientName: c?.name ?? '',
        clientCnpj: c?.cnpj ?? '',
        taxRegime: c?.tax_regime ?? '',
        dias: getDays(o.due_date),
      }
    })
    .filter(o => o.clientId)

  // Activity feed
  const activity: ActivityItem[] = completed
    .filter(o => o.completed_at)
    .slice(0, 15)
    .map(o => {
      const t = unwrap(o.obligation_templates)
      const c = unwrap(o.clients)
      return {
        id: o.id,
        acronym: t?.acronym ?? '',
        name: t?.name ?? '',
        clientId: c?.id ?? '',
        clientName: c?.name ?? '',
        value: o.value,
        completedAt: o.completed_at!,
        completedBy: o.completed_by,
      }
    })
    .filter(o => o.clientId)

  // Stats cards
  const newClientsThisMonth = (totalClients ?? 0) - (clientsLastMonth ?? 0)
  const overdueCount = pending.filter(o => getDays(o.due_date) < 0).length

  const stats: StatCard[] = [
    {
      label: 'Clientes',
      value: totalClients ?? 0,
      delta: newClientsThisMonth > 0 ? newClientsThisMonth : null,
      deltaLabel: newClientsThisMonth === 1 ? 'novo este mês' : 'novos este mês',
    },
    {
      label: 'Pendentes',
      value: pending.length,
      delta: overdueCount > 0 ? -overdueCount : null,
      deltaLabel: overdueCount === 1 ? 'vencida' : 'vencidas',
    },
    {
      label: 'Concluídas este mês',
      value: completedThisMonthCount,
      delta: completedThisMonthCount - completedLastMonthCount,
      deltaLabel: 'vs mês passado',
    },
  ]

  return (
    <div className="mx-auto space-y-6">

      {/* Hero + value row */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <HeroHeadline
            date={now}
            officeName={office.name}
          />
        </div>
        <div className="md:w-72 shrink-0">
          <PendingValue
            totalValue={totalValue}
            completedCount={completedForBar}
            totalCount={totalForBar}
          />
        </div>
      </div>

      {/* Stats */}
      <StatsCards cards={stats} />

      {/* Upcoming + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ObligationsTimeline obligations={upcoming} />
        <ActivityFeed items={activity} />
      </div>

    </div>
  )
}
