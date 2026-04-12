import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarDays, ShieldCheck, Bell } from 'lucide-react'
import { CardCliente } from './_components/card-cliente'
import { StatsFooter } from './_components/stats-footer'
import { ChecklistOnboarding } from './_components/checklist-onboarding'
import { ModalNovoCliente } from '@/components/clientes/modal-novo-cliente'

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

type ObRow = {
  id: string
  due_date: string
  status: string
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  clients: { id: string; name: string; cnpj: string; tax_regime: string; office_id: string }[] | { id: string; name: string; cnpj: string; tax_regime: string; office_id: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

function mapObRow(o: ObRow) {
  const t = unwrap(o.obligation_templates)
  const c = unwrap(o.clients)
  return {
    id: o.id,
    due_date: o.due_date,
    status: o.status,
    acronym: t?.acronym ?? '',
    name: t?.name ?? '',
    clientId: c?.id ?? '',
    clientName: c?.name ?? '',
    clientCnpj: c?.cnpj ?? '',
    taxRegime: c?.tax_regime ?? '',
  }
}

const OB_SELECT = `
  id, due_date, status,
  obligation_templates ( acronym, name ),
  clients!inner ( id, name, cnpj, tax_regime, office_id )
`

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id, name, email_alerts_enabled, onboarding_dismissed')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const end30 = new Date(today)
  end30.setDate(today.getDate() + 30)

  // Query 1: obrigações pendentes nos próximos 30 dias
  const { data: obligationsRaw } = await supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .in('status', ['pending', 'overdue'])
    .gte('due_date', toISO(today))
    .lte('due_date', toISO(end30))
    .order('due_date', { ascending: true })
    .limit(300)

  // Query 2: obrigações realmente atrasadas (data passada)
  const { data: overdueRaw } = await supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .in('status', ['pending', 'overdue'])
    .lt('due_date', toISO(today))
    .order('due_date', { ascending: true })
    .limit(200)

  // Concluídos hoje
  const { count: completedToday } = await supabase
    .from('client_obligations')
    .select(`id, clients!inner ( office_id )`, { count: 'exact', head: true })
    .eq('clients.office_id', office.id)
    .eq('status', 'completed')
    .gte('completed_at', `${toISO(today)}T00:00:00`)

  // Todos os clientes
  const { data: clients, count: totalClients } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime', { count: 'exact' })
    .eq('office_id', office.id)
    .order('name')

  // Mapear e filtrar
  const obligations = ((obligationsRaw as ObRow[] | null) ?? [])
    .map(mapObRow)
    .filter(o => o.clientId)

  const overdue = ((overdueRaw as ObRow[] | null) ?? [])
    .map(mapObRow)
    .filter(o => o.clientId)

  // Agrupar por cliente
  const byClient = new Map<string, typeof obligations>()
  for (const o of obligations) {
    const list = byClient.get(o.clientId) ?? []
    list.push(o)
    byClient.set(o.clientId, list)
  }

  const byClientOverdue = new Map<string, typeof overdue>()
  for (const o of overdue) {
    const list = byClientOverdue.get(o.clientId) ?? []
    list.push(o)
    byClientOverdue.set(o.clientId, list)
  }

  // Stats
  const critical = overdue.length +
    obligations.filter(o => getDaysRemaining(o.due_date) === 0).length

  const next7days = obligations.filter(o => {
    const days = getDaysRemaining(o.due_date)
    return days > 0 && days <= 7
  }).length

  // Clientes com obrigações (pendentes próximos 30 dias OU atrasadas)
  const clientsWithObs = (clients ?? [])
    .filter(c => byClient.has(c.id) || byClientOverdue.has(c.id))
    .map(c => {
      const obs      = byClient.get(c.id) ?? []
      const overdues = byClientOverdue.get(c.id) ?? []
      const hasCritical = overdues.length > 0 ||
        obs.some(o => getDaysRemaining(o.due_date) <= 0)
      return { ...c, obs, overdues, hasCritical }
    })
    .sort((a, b) => {
      if (a.hasCritical && !b.hasCritical) return -1
      if (!a.hasCritical && b.hasCritical) return 1
      return a.name.localeCompare(b.name)
    })

  const clientsWithoutObs = (clients ?? [])
    .filter(c => !byClient.has(c.id) && !byClientOverdue.has(c.id))

  // Filtro de busca
  const filter = q?.trim().toLowerCase()
  const clientsWithObsFiltered = filter
    ? clientsWithObs.filter(c => c.name.toLowerCase().includes(filter))
    : clientsWithObs
  const clientsWithoutObsFiltered = filter
    ? clientsWithoutObs.filter(c => c.name.toLowerCase().includes(filter))
    : clientsWithoutObs

  const now = new Date()
  const lastUpdatedStr = now.toLocaleDateString('pt-BR') + ' ' +
    now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const showChecklist = !office.onboarding_dismissed && (
    (totalClients ?? 0) < 3 || !office.email_alerts_enabled
  )

  return (
    <div className="pb-36">
      {showChecklist && (
        <ChecklistOnboarding
          totalClients={totalClients ?? 0}
          alertsEnabled={office.email_alerts_enabled}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div className='p-2'>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-none">
            Próximos Vencimentos
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 py-3">
            Obrigações fiscais para os próximos 30 dias.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Última Atualização
          </p>
          <p className="text-sm font-mono font-bold text-foreground">{lastUpdatedStr}</p>
        </div>
      </div>

      {filter && clientsWithObsFiltered.length === 0 && clientsWithoutObsFiltered.length === 0 && (
        <p className="text-sm text-muted-foreground py-8">
          Nenhum cliente encontrado para <span className="font-semibold text-foreground">"{q}"</span>.
        </p>
      )}

      {!clients?.length && (
        <div className="flex flex-col items-center py-16 text-center">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground mb-2">
            Nenhum cliente cadastrado
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-10">
            Cadastre o primeiro cliente e o calendário fiscal será gerado automaticamente.
          </p>

          {/* Benefícios */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full max-w-md">
            {[
              { icon: CalendarDays, label: 'Calendário gerado automaticamente' },
              { icon: ShieldCheck,  label: 'Obrigações por regime tributário' },
              { icon: Bell,         label: 'Alertas 7, 3 e 1 dia antes' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex-1 flex flex-col items-center gap-2 bg-muted/50 border border-border rounded-2xl px-4 py-5"
              >
                <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-muted-foreground text-center leading-snug">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <ModalNovoCliente
            trigger={
              <div className="group w-full max-w-md bg-background rounded-[16px] px-10 py-6 flex flex-col items-center justify-center gap-2
                border-2 border-dashed border-border hover:border-foreground/30
                text-muted-foreground hover:text-foreground
                transition-all duration-200 cursor-pointer">
                <span className="text-3xl font-light group-hover:scale-110 transition-transform duration-200">+</span>
                <p className="text-sm font-medium">Novo cliente</p>
              </div>
            }
          />
        </div>
      )}

      {!!(clients?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clientsWithObsFiltered.map(c => (
            <CardCliente
              key={c.id}
              clientId={c.id}
              clientName={c.name}
              cnpj={c.cnpj}
              taxRegime={c.tax_regime}
              obligations={c.obs.map(o => ({
                id: o.id,
                due_date: o.due_date,
                status: o.status,
                acronym: o.acronym,
                name: o.name,
              }))}
              totalPending={c.obs.length}
              overdueObligations={c.overdues.map(o => ({
                id: o.id,
                due_date: o.due_date,
                status: o.status,
                acronym: o.acronym,
                name: o.name,
              }))}
            />
          ))}

          {/* Clientes sem vencimentos no período */}
          {clientsWithoutObsFiltered.slice(0, 2).map(c => (
            <div key={c.id} className="bg-card rounded-[16px] shadow-card p-6 opacity-40">
              <h3 className="font-heading text-[15px] font-semibold text-foreground">
                {c.name}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                {c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Sem vencimentos nos próximos 30 dias
              </p>
            </div>
          ))}

        </div>
      )}

      <StatsFooter
        critical={critical}
        next7days={next7days}
        completedToday={completedToday ?? 0}
      />
    </div>
  )
}
