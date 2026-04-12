import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

function getDiasRestantes(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dueDate + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default async function PrazosClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!office) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime, has_employees')
    .eq('id', id)
    .eq('office_id', office.id)
    .single()

  if (!client) notFound()

  // Obrigações do ano atual em diante
  const anoAtual = new Date().getFullYear()
  const { data: obrigacoesRaw } = await supabase
    .from('client_obligations')
    .select(`
      id, due_date, status, completed_by, completed_at,
      obligation_templates ( acronym, name )
    `)
    .eq('client_id', client.id)
    .gte('due_date', `${anoAtual}-01-01`)
    .order('due_date', { ascending: true })
    .limit(500)

  type ObRow = {
    id: string
    due_date: string
    status: string
    completed_by: string | null
    completed_at: string | null
    obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
  }

  function unwrap<T>(val: T[] | T | null): T | null {
    if (!val) return null
    return Array.isArray(val) ? val[0] ?? null : val
  }

  const obrigacoes = (obrigacoesRaw as ObRow[] ?? []).map(o => {
    const t = unwrap(o.obligation_templates)
    const dias = getDiasRestantes(o.due_date)
    return {
      id: o.id,
      due_date: o.due_date,
      status: o.status as 'pending' | 'completed' | 'overdue',
      completed_at: o.completed_at,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      dias,
      mes: parseInt(o.due_date.split('-')[1]) - 1,
      ano: parseInt(o.due_date.split('-')[0]),
    }
  })

  // Agrupa por mês
  const porMes = new Map<string, typeof obrigacoes>()
  for (const o of obrigacoes) {
    const key = `${o.ano}-${String(o.mes + 1).padStart(2, '0')}`
    const lista = porMes.get(key) ?? []
    lista.push(o)
    porMes.set(key, lista)
  }

  const mesesOrdenados = Array.from(porMes.entries()).sort(([a], [b]) => a.localeCompare(b))

  const pendentes = obrigacoes.filter(o => o.status !== 'completed').length
  const concluidos = obrigacoes.filter(o => o.status === 'completed').length
  const atrasados = obrigacoes.filter(o => o.status === 'overdue' || (o.status !== 'completed' && o.dias < 0)).length

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/painel"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Painel
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-medium text-foreground">{client.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full shrink-0">
            {REGIME_LABEL[client.tax_regime] ?? client.tax_regime}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {atrasados > 0 && (
          <div className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
            {atrasados} atrasado{atrasados > 1 ? 's' : ''}
          </div>
        )}
        <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
          {pendentes} pendente{pendentes !== 1 ? 's' : ''}
        </div>
        <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
          {concluidos} concluído{concluidos !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista por mês */}
      {mesesOrdenados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhuma obrigação gerada para este cliente.
        </div>
      ) : (
        <div className="space-y-4">
          {mesesOrdenados.map(([key, obs]) => {
            const [ano, mes] = key.split('-')
            const label = `${MESES[parseInt(mes) - 1]} ${ano}`
            const temAtrasado = obs.some(o => o.status !== 'completed' && o.dias < 0)

            return (
              <Card key={key}>
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{label}</CardTitle>
                    {temAtrasado && (
                      <span className="text-[11px] text-destructive font-medium">atrasados</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-0.5">
                    {obs.map(o => {
                      const isConcluido = o.status === 'completed'
                      const isAtrasado = !isConcluido && o.dias < 0
                      const isUrgente = !isConcluido && !isAtrasado && o.dias <= 3

                      return (
                        <div
                          key={o.id}
                          className={cn(
                            'flex items-center justify-between gap-3 px-3 py-2 rounded-lg',
                            isConcluido && 'opacity-50',
                            isAtrasado && 'bg-destructive/5',
                            isUrgente && 'bg-amber-500/5',
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn(
                              'text-xs font-semibold shrink-0',
                              isConcluido ? 'text-muted-foreground line-through' : 'text-foreground',
                            )}>
                              {o.acronym}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{o.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatarData(o.due_date)}
                            </span>
                            {isConcluido ? (
                              <span className="text-[11px] text-muted-foreground">Concluído</span>
                            ) : isAtrasado ? (
                              <span className="text-[11px] font-semibold text-destructive">Atrasado</span>
                            ) : o.dias === 0 ? (
                              <span className="text-[11px] font-semibold text-destructive">Hoje</span>
                            ) : isUrgente ? (
                              <span className="text-[11px] font-semibold text-amber-500">{o.dias}d</span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">{o.dias}d</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
