import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
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

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!escritorio) redirect('/onboarding')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome, cnpj, regime, tem_empregados')
    .eq('id', id)
    .eq('escritorio_id', escritorio.id)
    .single()

  if (!cliente) notFound()

  // Obrigações do ano atual em diante
  const anoAtual = new Date().getFullYear()
  const { data: obrigacoesRaw } = await supabase
    .from('obrigacoes_cliente')
    .select(`
      id, data_vencimento, status, concluido_por, concluido_em,
      obrigacoes_template ( sigla, nome )
    `)
    .eq('cliente_id', cliente.id)
    .gte('data_vencimento', `${anoAtual}-01-01`)
    .order('data_vencimento', { ascending: true })
    .limit(500)

  type ObRow = {
    id: string
    data_vencimento: string
    status: string
    concluido_por: string | null
    concluido_em: string | null
    obrigacoes_template: { sigla: string; nome: string }[] | { sigla: string; nome: string } | null
  }

  function unwrap<T>(val: T[] | T | null): T | null {
    if (!val) return null
    return Array.isArray(val) ? val[0] ?? null : val
  }

  const obrigacoes = (obrigacoesRaw as ObRow[] ?? []).map(o => {
    const t = unwrap(o.obrigacoes_template)
    const dias = getDiasRestantes(o.data_vencimento)
    return {
      id: o.id,
      data_vencimento: o.data_vencimento,
      status: o.status as 'pendente' | 'concluido' | 'atrasado',
      concluido_em: o.concluido_em,
      sigla: t?.sigla ?? '',
      nome: t?.nome ?? '',
      dias,
      mes: parseInt(o.data_vencimento.split('-')[1]) - 1,
      ano: parseInt(o.data_vencimento.split('-')[0]),
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

  const pendentes = obrigacoes.filter(o => o.status !== 'concluido').length
  const concluidos = obrigacoes.filter(o => o.status === 'concluido').length
  const atrasados = obrigacoes.filter(o => o.status === 'atrasado' || (o.status !== 'concluido' && o.dias < 0)).length

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
            <h1 className="font-heading text-xl font-medium text-foreground">{cliente.nome}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{cliente.cnpj}</p>
          </div>
          <Badge variant="secondary" className="rounded-full shrink-0">
            {REGIME_LABEL[cliente.regime] ?? cliente.regime}
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
            const temAtrasado = obs.some(o => o.status !== 'concluido' && o.dias < 0)

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
                      const isConcluido = o.status === 'concluido'
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
                              {o.sigla}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{o.nome}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatarData(o.data_vencimento)}
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
