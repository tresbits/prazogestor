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

  const previewSize = hasOverdue ? 1 : 2
  const preview = obligations.slice(0, previewSize)
  const extras  = totalPending - preview.length

  return (
    <div className="bg-card rounded-[16px] shadow-card overflow-hidden flex flex-col">
      {/* Header — tonal */}
      <div className="px-4 py-3 bg-muted/50 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[15px] font-semibold text-foreground leading-tight truncate">
            {clientName}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {formatCNPJ(cnpj)}
          </span>
        </div>
        <span className="text-[10px] bg-background px-2.5 py-1 rounded-full text-foreground font-bold shrink-0">
          {REGIME_LABEL[taxRegime] ?? taxRegime.toUpperCase()}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
        {/* Seção VENCIDOS */}
        {hasOverdue && (
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2 [&>div:first-child]:pt-0">
            {previewOverdue.map(o => (
              <ObligationRow key={o.id} obligation={o} clientName={clientName} />
            ))}
            {extrasOverdue > 0 && (
              <ModalAtrasados
                clientName={clientName}
                clientCnpj={cnpj}
                obligations={overdueObligations}
                extrasCount={extrasOverdue}
              />
            )}
          </div>
        )}

        {/* Lista de próximos */}
        <div className={cn('flex-1 rounded-xl px-3 py-2 [&>div:first-child]:pt-0 [&>div]:border-t-0', hasOverdue && 'mt-3')}>
          {preview.map(o => (
            <ObligationRow key={o.id} obligation={o} clientName={clientName} />
          ))}
        </div>
      </div>

      {/* Footer — ver mais */}
      {extras > 0 && (
        <div className="px-4 py-3 bg-muted/50 border-t border-border/40 text-center">
          <ModalProximos
            clientName={clientName}
            clientCnpj={cnpj}
            obligations={obligations.slice(previewSize)}
            extrasCount={extras}
          />
        </div>
      )}
    </div>
  )
}
