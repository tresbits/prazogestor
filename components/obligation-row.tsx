'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { ModalConcluir } from '@/app/(app)/painel/_components/modal-concluir'

export interface ObligationRowProps {
  id: string
  acronym: string
  name: string
  due_date: string
  status: string
  clientName: string
  // Content
  value?: number | null
  completedAt?: string | null
  secondaryLabel?: string
  showClientName?: boolean
  clientCnpj?: string
  // Selection mode — when provided, renders checkbox + row click instead of hover-reveal Concluir
  selected?: boolean
  onToggle?: () => void
  className?: string
}

// Exported so group headers (with indeterminate state) can reuse it
export function RowCheckbox({ checked, onChange, indeterminate }: {
  checked: boolean
  onChange: () => void
  indeterminate?: boolean
}) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onChange() }}
      className={cn(
        'shrink-0 h-4 w-4 rounded border transition-colors flex items-center justify-center',
        checked || indeterminate
          ? 'bg-foreground border-foreground text-background'
          : 'border-border bg-background hover:border-foreground/50'
      )}
    >
      {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
      {!checked && indeterminate && <span className="h-0.5 w-2 bg-background rounded-full" />}
    </button>
  )
}

function getDays(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(dueDate + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function UrgencyLabel({ days, status }: { days: number; status: string }) {
  const isOverdue = status === 'overdue' || days < 0
  const isToday   = days === 0
  const isUrgent  = !isOverdue && !isToday && days <= 3
  const isClose   = !isOverdue && !isToday && !isUrgent && days <= 7
  if (isOverdue) return <span className="text-[10px] font-bold text-destructive tracking-wide whitespace-nowrap">VENCIDO</span>
  if (isToday)   return <span className="text-[10px] font-bold text-destructive tracking-wide whitespace-nowrap">HOJE</span>
  if (isUrgent)  return <span className="text-[10px] font-bold text-amber-500 tracking-wide whitespace-nowrap">EM {days} {days === 1 ? 'DIA' : 'DIAS'}</span>
  if (isClose)   return <span className="text-[10px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide whitespace-nowrap">EM {days} DIAS</span>
  return <span className="text-[10px] font-bold text-muted-foreground/50 tracking-wide whitespace-nowrap">EM {days} DIAS</span>
}

export function ObligationRow({
  id, acronym, name, due_date, status, clientName,
  value, completedAt, secondaryLabel,
  showClientName, clientCnpj,
  selected, onToggle,
  className,
}: ObligationRowProps) {
  const days = getDays(due_date)
  const isCompleted = status === 'completed'
  const isSelectionMode = onToggle !== undefined

  return (
    <div
      className={cn(
        'group flex items-center gap-3',
        isSelectionMode
          ? cn('cursor-pointer transition-colors', selected ? 'bg-muted/50' : 'hover:bg-muted/30')
          : cn('justify-between', isCompleted && 'opacity-50'),
        className
      )}
      onClick={isSelectionMode ? onToggle : undefined}
    >
      {/* Checkbox — selection mode only */}
      {isSelectionMode && (
        <RowCheckbox checked={selected ?? false} onChange={onToggle} />
      )}

      {/* Chip */}
      <span className={cn(
        'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
        isCompleted && !isSelectionMode ? 'bg-muted text-muted-foreground' : chipColor(acronym)
      )}>
        {acronym || '—'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showClientName && (
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {clientName}
            {clientCnpj && (
              <span className="ml-2 text-[10px] font-mono text-muted-foreground/60">
                {formatCNPJ(clientCnpj)}
              </span>
            )}
          </p>
        )}
        <p className={cn(
          'truncate leading-tight',
          showClientName ? 'text-[12px] text-muted-foreground' : cn(
            'text-sm',
            isCompleted && !isSelectionMode ? 'text-muted-foreground line-through' : 'text-foreground'
          )
        )}>
          {name}
        </p>
        {secondaryLabel && (
          <p className="text-[11px] text-muted-foreground">{secondaryLabel}</p>
        )}
        {/* Value on left — individual mode only */}
        {!isSelectionMode && value != null && (
          <p className="text-[11px] font-mono text-muted-foreground">
            {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        )}
      </div>

      {/* Right */}
      <div className="shrink-0 flex flex-col items-end gap-0.5 ml-2">
        {isSelectionMode ? (
          <>
            {value != null && (
              <span className="text-[11px] font-mono font-semibold text-foreground">
                {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
            <UrgencyLabel days={days} status={status} />
          </>
        ) : isCompleted ? (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {completedAt ? formatDate(completedAt.split('T')[0]) : 'Concluído'}
          </span>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <UrgencyLabel days={days} status={status} />
            <ModalConcluir
              obligationId={id}
              obligationName={name}
              clientName={clientName}
              dueDate={due_date}
            />
          </div>
        )}
      </div>
    </div>
  )
}
