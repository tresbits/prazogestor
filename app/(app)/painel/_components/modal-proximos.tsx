'use client'

import { useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalConcluir } from './modal-concluir'

type ObligationItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
}

function getDaysRemaining(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function acronymPillClass(days: number, status: string) {
  const isOverdue = status === 'overdue' || days < 0
  const isToday   = days === 0
  const isUrgent  = !isOverdue && !isToday && days <= 3
  const isClose   = !isOverdue && !isToday && !isUrgent && days <= 7
  if (isOverdue || isToday) return 'bg-destructive text-white'
  if (isUrgent)             return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  if (isClose)              return 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400'
  return 'bg-muted-foreground/15 text-muted-foreground'
}

function UrgencyLabel({ days, status }: { days: number; status: string }) {
  const isOverdue = status === 'overdue' || days < 0
  const isToday   = days === 0
  const isUrgent  = !isOverdue && !isToday && days <= 3
  const isClose   = !isOverdue && !isToday && !isUrgent && days <= 7
  if (isOverdue) return <span className="text-[10px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (isToday)   return <span className="text-[10px] font-bold text-destructive tracking-wide">HOJE</span>
  if (isUrgent)  return <span className="text-[10px] font-bold text-amber-500 tracking-wide">EM {days} {days === 1 ? 'DIA' : 'DIAS'}</span>
  if (isClose)   return <span className="text-[10px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {days} DIAS</span>
  return <span className="text-[10px] font-bold text-muted-foreground/50 tracking-wide">EM {days} DIAS</span>
}

export function ModalProximos({
  clientName,
  obligations,
  extrasCount,
}: {
  clientName: string
  obligations: ObligationItem[]
  extrasCount: number
}) {
  const [open, setOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">
        + {extrasCount} obrigações
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-[12px]',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0',
            'transition-all duration-200'
          )}
        />
        <Dialog.Popup
          ref={popupRef}
          initialFocus={popupRef}
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md max-h-[85vh] flex flex-col',
            'bg-background/90 backdrop-blur-3xl',
            'border-[0.5px] border-white/20 dark:border-white/10',
            'rounded-[20px]',
            'shadow-[0_32px_80px_rgba(0,0,0,0.18)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97]',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]',
            'transition-all duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5 shrink-0 border-b border-border">
            <div>
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Próximos Vencimentos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-0.5 truncate max-w-[280px]">
                {clientName}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* List */}
          <div className="px-6 py-4 flex-1 overflow-y-auto min-h-0 no-scrollbar">
            <div className="rounded-xl overflow-hidden border border-border bg-muted">
              {obligations.map((o, i) => {
                const days = getDaysRemaining(o.due_date)
                return (
                  <div
                    key={o.id}
                    className={cn(
                      'group relative flex items-center justify-between px-4 py-3',
                      i > 0 && 'border-t border-border'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(
                        'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                        acronymPillClass(days, o.status)
                      )}>
                        {o.acronym || '—'}
                      </span>
                      <span className="text-sm text-foreground truncate">{o.name}</span>
                    </div>
                    <div className="shrink-0 ml-4 relative flex items-center">
                      <span className="whitespace-nowrap transition-opacity group-hover:opacity-0">
                        <UrgencyLabel days={days} status={o.status} />
                      </span>
                      <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ModalConcluir
                          obligationId={o.id}
                          obligationName={o.name}
                          clientName={clientName}
                          dueDate={o.due_date}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
