'use client'

import { cn } from '@/lib/utils'
import { ModalConcluir } from './modal-concluir'
import { ModalAtrasados } from './modal-atrasados'
import { ModalProximos } from './modal-proximos'

type ObligationItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
}

type CardClienteProps = {
  clientId: string
  clientName: string
  cnpj: string
  taxRegime: string
  obligations: ObligationItem[]
  totalPending: number
  overdueObligations: ObligationItem[]
}

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples',
  mei: 'MEI',
  lucro_presumido: 'Presumido',
  lucro_real: 'Lucro Real',
}

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '—'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase()
}

function UrgencyLabel({ days, status }: { days: number; status: string }) {
  const isOverdue = status === 'overdue' || days < 0
  const isToday   = days === 0
  const isUrgent  = !isOverdue && !isToday && days <= 3
  const isClose   = !isOverdue && !isToday && !isUrgent && days <= 7

  if (isOverdue) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (isToday)   return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (isUrgent)  return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {days} {days === 1 ? 'DIA' : 'DIAS'}</span>
  if (isClose)   return <span className="text-[11px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {days} DIAS</span>
  return <span className="text-[11px] font-bold text-muted-foreground tracking-wide">EM {days} DIAS</span>
}

function ObligationRow({
  obligation: o,
  clientName,
}: {
  obligation: ObligationItem
  clientName: string
}) {
  const days = getDaysRemaining(o.due_date)
  const isOverdue = o.status === 'overdue' || days < 0
  const isToday   = days === 0
  const isUrgent  = !isOverdue && !isToday && days <= 3
  const isClose   = !isOverdue && !isToday && !isUrgent && days <= 7

  return (
    <div className="group flex items-center justify-between py-3 border-t border-border/40 first:border-t-0">
      <div className="min-w-0">
        <span className={cn(
          'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide mb-1',
          isOverdue || isToday ? 'bg-destructive/10 text-destructive'
            : isUrgent          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : isClose           ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
            :                     'bg-muted text-muted-foreground'
        )}>
          {o.acronym || '—'}
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{o.name}</p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
        <UrgencyLabel days={days} status={o.status} />
        <ModalConcluir
          obligationId={o.id}
          obligationName={o.name}
          clientName={clientName}
          dueDate={o.due_date}
        />
      </div>
    </div>
  )
}

export function CardCliente({
  clientId, clientName, cnpj, taxRegime, obligations, totalPending, overdueObligations,
}: CardClienteProps) {
  const hasOverdue      = overdueObligations.length > 0
  const previewOverdue  = overdueObligations.slice(0, 1)
  const extrasOverdue   = overdueObligations.length - 1

  // 3 próximos quando há vencidos, 4 quando não há
  const previewSize = hasOverdue ? 3 : 4
  const preview = obligations.slice(0, previewSize)
  const extras  = totalPending - preview.length

  return (
    <div className="bg-card rounded-[16px] shadow-card p-6 flex flex-col gap-0">
      {/* Header — tonal edge-to-edge + avatar */}
      <div className="-mx-6 -mt-6 px-6 py-4 rounded-t-[16px] bg-muted/50 flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-foreground">{getInitials(clientName)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[15px] font-semibold text-foreground leading-tight truncate">
            {clientName}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {formatCNPJ(cnpj)}
          </span>
        </div>
        <span className="text-[10px] bg-card px-2.5 py-1 rounded-full text-foreground font-bold shrink-0">
          {REGIME_LABEL[taxRegime] ?? taxRegime.toUpperCase()}
        </span>
      </div>

      {/* Seção VENCIDOS — pill container */}
      {hasOverdue && (
        <div className="mt-4 bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2 [&>div:first-child]:pt-0">
          {previewOverdue.map(o => (
            <ObligationRow key={o.id} obligation={o} clientName={clientName} />
          ))}
          {extrasOverdue > 0 && (
            <ModalAtrasados
              clientName={clientName}
              obligations={overdueObligations}
              extrasCount={extrasOverdue}
            />
          )}
        </div>
      )}

      {/* Lista de próximos — container neutro */}
      <div className="mt-4 flex-1 rounded-xl px-3 py-2 [&>div:first-child]:pt-0 [&>div]:border-t-0">
        {preview.map(o => (
          <ObligationRow key={o.id} obligation={o} clientName={clientName} />
        ))}
      </div>

      {/* Footer — ver mais */}
      {extras > 0 && (
        <div className="-mx-6 -mb-6 mt-auto px-6 py-3 bg-muted/50 rounded-b-[16px] text-center">
          <ModalProximos
            clientName={clientName}
            obligations={obligations.slice(previewSize)}
            extrasCount={extras}
          />
        </div>
      )}
    </div>
  )
}
