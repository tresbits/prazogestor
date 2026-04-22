'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import Link from 'next/link'

export type UpcomingOb = {
  id: string
  due_date: string
  status: 'pending' | 'overdue'
  acronym: string
  name: string
  value: number | null
  clientId: string
  clientName: string
  taxRegime: string
  dias: number
}

const REGIMES = [
  { key: 'todos',           label: 'Todos' },
  { key: 'simples',         label: 'Simples' },
  { key: 'mei',             label: 'MEI' },
  { key: 'lucro_presumido', label: 'Lucro Presumido' },
  { key: 'lucro_real',      label: 'Lucro Real' },
]

function formatDate(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

interface UpcomingListProps {
  obligations: UpcomingOb[]
}

export function UpcomingList({ obligations }: UpcomingListProps) {
  const [regime, setRegime] = useState('todos')

  const filtered = regime === 'todos'
    ? obligations
    : obligations.filter(o => o.taxRegime === regime)

  const visible = filtered.slice(0, 5)
  const total   = obligations.length

  // Only show regimes that have obligations
  const activeRegimes = REGIMES.filter(r =>
    r.key === 'todos' || obligations.some(o => o.taxRegime === r.key)
  )

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header + tabs */}
      <div className="px-4 pt-4 pb-0">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Próximos 30 dias
        </p>

        {activeRegimes.length > 2 && (
          <div className="flex items-center gap-1.5 flex-wrap pb-3">
            {activeRegimes.map(r => (
              <button
                key={r.key}
                onClick={() => setRegime(r.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                  regime === r.key
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-4 pb-0">
        {filtered.length === 0 ? (
          <p className="py-6 text-sm text-center text-muted-foreground">
            Nenhuma obrigação nos próximos 30 dias.
          </p>
        ) : (
          visible.map((o, i) => {
            const isOverdue = o.status === 'overdue' || o.dias < 0
            const isToday   = o.dias === 0
            const isUrgent  = !isOverdue && !isToday && o.dias <= 3
            const isClose   = !isOverdue && !isToday && o.dias > 3 && o.dias <= 7

            return (
              <Link
                key={o.id}
                href={`/clientes/${o.clientId}/detalhes`}
                className={cn(
                  'flex items-center justify-between py-2.5 gap-3 group',
                  i > 0 && 'border-t border-border/40'
                )}
              >
                {/* Left */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn(
                    'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                    chipColor(o.acronym)
                  )}>
                    {o.acronym || '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate leading-tight group-hover:underline">
                      {o.clientName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {o.name}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  {o.value != null && (
                    <span className="text-[11px] font-mono font-semibold text-foreground">
                      {o.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  <span className={cn(
                    'text-[10px] whitespace-nowrap',
                    isOverdue || isToday ? 'font-bold text-destructive tracking-wide'
                      : isUrgent         ? 'font-bold text-amber-500 tracking-wide'
                      : isClose          ? 'font-bold text-yellow-500 dark:text-yellow-400 tracking-wide'
                      :                    'text-muted-foreground/70'
                  )}>
                    {isToday   ? 'HOJE'
                      : isOverdue ? 'VENCIDA'
                      : isUrgent  ? `EM ${o.dias} ${o.dias === 1 ? 'DIA' : 'DIAS'}`
                      : isClose   ? `EM ${o.dias} DIAS`
                      : formatDate(o.due_date)}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40">
        <Link
          href="/overview/proximos"
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos · {total} obrigação{total !== 1 ? 'ões' : ''} →
        </Link>
      </div>
    </div>
  )
}
