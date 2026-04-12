'use client'

import { useTransition } from 'react'
import { completeObligation } from '@/app/actions/obrigacoes'
import { cn } from '@/lib/utils'

type ObligationRow = {
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

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgency(days: number, status: string) {
  if (status === 'overdue' || days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days <= 3) return 'urgent'
  return 'normal'
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function LinhaObrigacao({ obrigacao: o }: { obrigacao: ObligationRow }) {
  const [pending, startTransition] = useTransition()
  const template = unwrap(o.obligation_templates)
  const client = unwrap(o.clients)
  const days = getDaysRemaining(o.due_date)
  const urgency = getUrgency(days, o.status)

  const urgencyStyles = {
    overdue: 'border-l-4 border-l-destructive bg-destructive/5',
    today:   'border-l-4 border-l-destructive bg-destructive/5',
    urgent:  'border-l-4 border-l-amber-500 bg-amber-500/5',
    normal:  'border-l-4 border-l-transparent bg-card',
  }

  const daysLabel = {
    overdue: 'Atrasado',
    today:   'Hoje',
    urgent:  `${days}d`,
    normal:  `${days}d`,
  }

  const daysColor = {
    overdue: 'text-destructive font-semibold',
    today:   'text-destructive font-semibold',
    urgent:  'text-amber-500 font-semibold',
    normal:  'text-muted-foreground',
  }

  return (
    <div className={cn(
      'flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-4',
      urgencyStyles[urgency]
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {template?.acronym}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {template?.name}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {client?.name}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm text-foreground">{formatDate(o.due_date)}</p>
        <p className={cn('text-xs', daysColor[urgency])}>
          {daysLabel[urgency]}
        </p>
      </div>

      <form action={async (fd) => { await completeObligation(fd) }}>
        <input type="hidden" name="obligation_id" value={o.id} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
        >
          {pending ? '…' : 'Concluir'}
        </button>
      </form>
    </div>
  )
}
