'use client'

import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ObligationRow } from '@/components/obligation-row'
import { MESES_PT } from '@/components/calendario/calendar-utils'
import type { PrazosOb } from '../page'

export function ModalDiaPrazos({
  date,
  items,
  clientName,
  open,
  onOpenChange,
}: {
  date: string
  items: PrazosOb[]
  clientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)

  const dateLabel = date
    ? (() => {
        const d = new Date(date + 'T00:00:00')
        return `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`
      })()
    : ''

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
            'w-[calc(100%-2rem)] max-w-sm max-h-[85vh] flex flex-col',
            'bg-glass backdrop-blur-xl',
            'border-[0.5px] border-glass',
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">· Prazos</p>
              <Dialog.Title className="font-heading text-xl font-bold text-foreground leading-tight">
                Vencimentos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {dateLabel}
                {items.length > 0 && (
                  <span className="ml-1.5 opacity-60">· {items.length} {items.length === 1 ? 'obrigação' : 'obrigações'}</span>
                )}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
            <div className="px-6 py-3 divide-y divide-border/40">
              {items.map(item => (
                <ObligationRow
                  key={item.id}
                  id={item.id} acronym={item.acronym} name={item.name}
                  due_date={item.due_date} status={item.status} clientName={clientName}
                  value={item.value} completedAt={item.completed_at}
                  className="py-3"
                />
              ))}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
