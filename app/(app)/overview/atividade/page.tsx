import { redirect } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterBar } from '../_components/filter-bar'
import { getAtividadeRange } from '../_lib/periods'
import { PageBreadcrumb, PageTitle, MetricPill } from '../../_components/page-header'
import { cn } from '@/lib/utils'

const PERIODS = [
  { key: 'mes',         label: 'Este mês' },
  { key: 'mes_passado', label: 'Mês passado' },
  { key: '3meses',      label: 'Últimos 3 meses' },
  { key: 'trimestre',   label: 'Este trimestre' },
  { key: 'ano',         label: 'Este ano' },
]

const OB_SELECT = `
  id, due_date, status, value, completed_at, completed_by,
  obligation_templates ( acronym, name ),
  clients!inner ( id, name, tax_regime, office_id )
`

type ObRow = {
  id: string
  due_date: string
  status: string
  value: number | null
  completed_at: string | null
  completed_by: string | null
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  clients: { id: string; name: string; tax_regime: string; office_id: string }[]
    | { id: string; name: string; tax_regime: string; office_id: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

function formatDate(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

const REGIME_LABEL: Record<string, string> = {
  simples:          'Simples Nacional',
  mei:              'MEI',
  lucro_presumido:  'Lucro Presumido',
  lucro_real:       'Lucro Real',
}

export default async function AtividadePage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; regime?: string; obrigacao?: string; periodo?: string }>
}) {
  const { cliente = '', regime = '', obrigacao = '', periodo = 'mes' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!office) return null

  const { start, end } = getAtividadeRange(periodo)

  let query = supabase
    .from('client_obligations')
    .select(OB_SELECT)
    .eq('clients.office_id', office.id)
    .eq('status', 'completed')
    .gte('completed_at', start + 'T00:00:00')
    .lte('completed_at', end + 'T23:59:59')
    .order('completed_at', { ascending: false })
    .limit(500)

  if (cliente) query = query.eq('client_id', cliente)
  if (regime)  query = query.eq('clients.tax_regime', regime)

  const { data: raw } = await query

  // All clients for filter dropdown
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('office_id', office.id)
    .order('name')

  const rows = ((raw as ObRow[] | null) ?? []).map(o => {
    const t = unwrap(o.obligation_templates)
    const c = unwrap(o.clients)
    return {
      id: o.id,
      due_date: o.due_date,
      value: o.value,
      completed_at: o.completed_at,
      completed_by: o.completed_by,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      clientId: c?.id ?? '',
      clientName: c?.name ?? '',
      taxRegime: c?.tax_regime ?? '',
    }
  }).filter(o => o.clientId)

  // Unique templates for filter dropdown
  const templateMap = new Map<string, string>()
  for (const o of rows) {
    if (o.acronym) templateMap.set(o.acronym, o.name)
  }
  const uniqueObligations = Array.from(templateMap.entries())
    .map(([acronym, name]) => ({ acronym, name }))
    .sort((a, b) => a.acronym.localeCompare(b.acronym))

  // Apply obrigacao filter (after deriving options)
  const filtered = obrigacao ? rows.filter(o => o.acronym === obrigacao) : rows

  // Total value of filtered set
  const totalValue = filtered.reduce((sum, o) => sum + (o.value ?? 0), 0)

  const current = { cliente, regime, obrigacao, periodo }

  return (
    <div className="mx-auto space-y-6">

      <PageBreadcrumb parent={{ label: 'Overview', href: '/overview' }} current="Atividade" />

      <div className="space-y-4">
        <PageTitle>Atividade</PageTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <MetricPill>
            {filtered.length} obrigação{filtered.length !== 1 ? 'ões' : ''} concluída{filtered.length !== 1 ? 's' : ''}
          </MetricPill>
          {totalValue > 0 && (
            <MetricPill>
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </MetricPill>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        clients={allClients ?? []}
        periods={PERIODS}
        current={current}
        pathname="/overview/atividade"
      />

      {/* List */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="py-16 text-sm text-center text-muted-foreground">
            Nenhuma obrigação concluída para os filtros selecionados.
          </p>
        ) : (
          <div className="px-4 py-1">
            {filtered.map((o, i) => (
              <Link
                key={o.id}
                href={`/clientes/${o.clientId}/detalhes`}
                className={cn(
                  'flex items-center gap-3 py-3 group',
                  i > 0 && 'border-t border-border/40'
                )}
              >
                <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate leading-tight group-hover:underline">
                    {o.clientName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {o.acronym ? `${o.acronym} · ` : ''}{o.name}
                    {o.taxRegime && (
                      <span className="ml-1.5 text-muted-foreground/50">
                        · {REGIME_LABEL[o.taxRegime] ?? o.taxRegime}
                      </span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  {o.value != null && (
                    <span className="text-[12px] font-mono font-semibold text-foreground">
                      {o.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                    {o.completed_at
                      ? formatDate(o.completed_at.split('T')[0])
                      : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
