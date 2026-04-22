import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

function getDias(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dueDate + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarValor(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type ObRow = {
  id: string
  due_date: string
  status: string
  completed_at: string | null
  value: number | null
  obligation_templates:
    | { acronym: string; name: string }[]
    | { acronym: string; name: string }
    | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const service = createServiceClient()

  const { data: client } = await service
    .from('clients')
    .select('id, name, cnpj, tax_regime')
    .eq('portal_user_id', user.id)
    .eq('portal_enabled', true)
    .single()

  if (!client) redirect('/portal/login')

  const anoAtual = new Date().getFullYear()

  // Obrigações do ano atual
  const { data: obRaw } = await service
    .from('client_obligations')
    .select('id, due_date, status, completed_at, value, obligation_templates ( acronym, name )')
    .eq('client_id', client.id)
    .gte('due_date', `${anoAtual}-01-01`)
    .order('due_date', { ascending: true })
    .limit(500)

  // Obrigações atrasadas de anos anteriores
  const { data: atrasadasAntRaw } = await service
    .from('client_obligations')
    .select('id, due_date, status, completed_at, value, obligation_templates ( acronym, name )')
    .eq('client_id', client.id)
    .lt('due_date', `${anoAtual}-01-01`)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(100)

  const mapOb = (o: ObRow) => {
    const t = unwrap(o.obligation_templates)
    return {
      id: o.id,
      due_date: o.due_date,
      status: o.status as 'pending' | 'completed' | 'overdue',
      completed_at: o.completed_at,
      value: o.value ?? null,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      dias: getDias(o.due_date),
    }
  }

  const obrigacoes = [...((atrasadasAntRaw as ObRow[]) ?? []), ...((obRaw as ObRow[]) ?? [])].map(mapOb)

  // Agrupa por mês
  const porMes = new Map<string, typeof obrigacoes>()
  for (const o of obrigacoes) {
    const [ano, mes] = o.due_date.split('-')
    const key = `${ano}-${mes}`
    const lista = porMes.get(key) ?? []
    lista.push(o)
    porMes.set(key, lista)
  }

  const grupos = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, obs]) => {
      const [ano, mes] = key.split('-')
      return { key, label: `${MESES[parseInt(mes) - 1]} ${ano}`, obrigacoes: obs }
    })

  const atrasadas  = obrigacoes.filter(o => o.status !== 'completed' && (o.status === 'overdue' || o.dias < 0)).length
  const pendentes  = obrigacoes.filter(o => o.status === 'pending' && o.dias >= 0).length
  const concluidas = obrigacoes.filter(o => o.status === 'completed').length

  const cnpjFmt = client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

  return (
    <div className="space-y-6">
      {/* Header do cliente */}
      <div className="bg-card rounded-[20px] shadow-card overflow-hidden">
        <div className="px-6 py-5 bg-muted/50">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground leading-tight">
            {client.name}
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
            {cnpjFmt}
          </p>
        </div>

        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-t border-border/40">
          <span className="text-[10px] bg-background px-2.5 py-1 rounded-full text-foreground font-bold border border-border/40">
            {REGIME_LABEL[client.tax_regime] ?? client.tax_regime}
          </span>
          {atrasadas > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold">
              {atrasadas} atrasada{atrasadas !== 1 ? 's' : ''}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px]">
            {pendentes} pendente{pendentes !== 1 ? 's' : ''}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px]">
            {concluidas} concluída{concluidas !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista por mês */}
      {grupos.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Nenhuma obrigação registrada para {anoAtual}.
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map(({ key, label, obrigacoes: obs }) => {
            const temAtrasado = obs.some(o => o.status !== 'completed' && o.dias < 0)

            return (
              <div key={key} className="bg-card rounded-[16px] shadow-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b border-border/40 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                    {label}
                  </span>
                  {temAtrasado && (
                    <span className="text-[10px] font-semibold text-destructive">· atrasadas</span>
                  )}
                </div>

                <div className="px-4 py-1">
                  {obs.map((o, i) => {
                    const isOverdue    = o.status !== 'completed' && (o.status === 'overdue' || o.dias < 0)
                    const isToday      = o.status !== 'completed' && o.dias === 0
                    const isUrgent     = o.status === 'pending' && o.dias > 0 && o.dias <= 3
                    const isClose      = o.status === 'pending' && o.dias > 3 && o.dias <= 7
                    const isCompleted  = o.status === 'completed'

                    return (
                      <div
                        key={o.id}
                        className={cn(
                          'flex items-center justify-between py-3',
                          i > 0 && 'border-t border-border/40',
                          isCompleted && 'opacity-50'
                        )}
                      >
                        {/* Esquerda: badge + nome */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn(
                            'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                            isCompleted ? 'bg-muted text-muted-foreground' : chipColor(o.acronym)
                          )}>
                            {o.acronym || '—'}
                          </span>
                          <span className={cn(
                            'text-sm truncate',
                            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                          )}>
                            {o.name}
                          </span>
                        </div>

                        {/* Direita: valor + status/data */}
                        <div className="shrink-0 ml-4 flex flex-col items-end gap-0.5">
                          {o.value != null && (
                            <span className={cn(
                              'text-[12px] font-mono font-semibold',
                              isCompleted ? 'text-muted-foreground' : 'text-foreground'
                            )}>
                              {formatarValor(o.value)}
                            </span>
                          )}
                          <span className={cn(
                            'text-[10px] whitespace-nowrap',
                            isOverdue || isToday   ? 'font-bold text-destructive tracking-wide'
                              : isUrgent           ? 'font-bold text-amber-500 tracking-wide'
                              : isClose            ? 'font-bold text-yellow-500 dark:text-yellow-400 tracking-wide'
                              :                      'text-muted-foreground/70'
                          )}>
                            {isCompleted
                              ? (o.completed_at ? formatarData(o.completed_at.split('T')[0]) : 'Concluída')
                              : isOverdue  ? 'VENCIDA'
                              : isToday    ? 'HOJE'
                              : isUrgent   ? `EM ${o.dias} ${o.dias === 1 ? 'DIA' : 'DIAS'}`
                              : isClose    ? `EM ${o.dias} DIAS`
                              : formatarData(o.due_date)
                            }
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest pt-4">
        Gerenciado pelo seu escritório via PrazoGestor
      </p>
    </div>
  )
}
