import Link from 'next/link'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { monthNameShort, weekdayShort, monthName } from '@/lib/format'

export type TimelineOb = {
  id: string
  due_date: string
  status: 'pending' | 'overdue'
  acronym: string
  name: string
  value: number | null
  clientId: string
  clientName: string
  clientCnpj: string
  taxRegime: string
  dias: number
}

type TimelineGroup = {
  key: string
  due_date: string
  acronyms: string[]
  dias: number
  borderColor: string
  dotColor: string
  urgencyClass: string
  urgencyLabel: string
  clients: { id: string; name: string; cnpj: string }[]
}

function parseDueDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return { day: String(day), weekday: weekdayShort(d), month: monthNameShort(d) }
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function buildGroups(obligations: TimelineOb[]): TimelineGroup[] {
  const map = new Map<string, TimelineGroup>()

  for (const o of obligations) {
    const key = o.due_date

    if (!map.has(key)) {
      const isOverdue = o.dias < 0
      const isToday   = o.dias === 0
      const isUrgent  = !isOverdue && !isToday && o.dias <= 7

      map.set(key, {
        key,
        due_date: o.due_date,
        acronyms: [],
        dias: o.dias,
        borderColor: isOverdue || isToday ? 'border-destructive'
          : isUrgent ? 'border-amber-500'
          : 'border-border/60',
        dotColor: isOverdue || isToday ? 'bg-destructive'
          : isUrgent ? 'bg-amber-500'
          : 'bg-muted-foreground/30',
        urgencyClass: isOverdue || isToday ? 'bg-destructive/10 text-destructive'
          : isUrgent ? 'bg-amber-500/10 text-amber-500'
          : 'bg-muted text-muted-foreground',
        urgencyLabel: isToday ? 'HOJE'
          : isOverdue ? 'VENCIDA'
          : `EM ${o.dias} ${o.dias === 1 ? 'DIA' : 'DIAS'}`,
        clients: [],
      })
    }

    const group = map.get(key)!
    if (!group.acronyms.includes(o.acronym)) group.acronyms.push(o.acronym)
    if (!group.clients.some(c => c.id === o.clientId))
      group.clients.push({ id: o.clientId, name: o.clientName, cnpj: o.clientCnpj })
  }

  return Array.from(map.values()).sort((a, b) => a.dias - b.dias)
}

export function ObligationsTimeline({ obligations }: { obligations: TimelineOb[] }) {
  const groups = buildGroups(obligations)
  const visibleGroups = groups.slice(0, 10)
  const total = obligations.length

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/30">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          Próximas obrigações ({monthName(new Date())})
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {visibleGroups.length === 0 ? (
          <p className="py-8 text-sm text-center text-muted-foreground">
            Nenhuma obrigação pendente.
          </p>
        ) : (
          visibleGroups.map(group => {
            const d = parseDueDate(group.due_date)
            const visible  = group.clients.slice(0, 2)
            const overflow = group.clients.length - visible.length

            return (
              <div key={group.key} className="flex items-start gap-3 px-5 py-4">

                {/* Date column */}
                <div className="w-12 shrink-0 text-right pt-px">
                  <p className="text-[20px] font-bold leading-none text-foreground tabular-nums">
                    {d.day}
                  </p>
                  <p className="text-[9px] font-mono font-semibold text-muted-foreground mt-0.5 uppercase">
                    {d.weekday}
                  </p>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">
                    {d.month}
                  </p>
                </div>

                {/* Dot */}
                <div className="shrink-0 flex justify-center w-5 pt-2">
                  <div className={cn('w-2 h-2 rounded-full ring-2 ring-card', group.dotColor)} />
                </div>

                {/* Card */}
                <div className={cn('flex-1 border-l-[3px] pl-4 min-w-0', group.borderColor)}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1 flex-1">
                      {group.acronyms.map(a => (
                        <span
                          key={a}
                          className={cn('px-2 py-0.5 rounded text-[11px] font-bold tracking-wide', chipColor(a))}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <span className={cn(
                      'shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap',
                      group.urgencyClass
                    )}>
                      {group.urgencyLabel}
                    </span>
                  </div>

                  {/* Clients */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {visible.map(client => (
                      <Link
                        key={client.id}
                        href={`/clientes/${client.id}/detalhes`}
                        className="group/link"
                      >
                        <p className="text-[12px] text-foreground/80 leading-tight group-hover/link:underline">
                          {client.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {formatCNPJ(client.cnpj)}
                        </p>
                      </Link>
                    ))}
                    {overflow > 0 && (
                      <p className="text-[10px] text-muted-foreground/60">
                        +{overflow} {overflow === 1 ? 'cliente' : 'clientes'}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/30">
        <Link
          href="/overview/proximos"
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos · {total} obrigaç{total !== 1 ? 'ões' : 'ão'} →
        </Link>
      </div>
    </div>
  )
}
