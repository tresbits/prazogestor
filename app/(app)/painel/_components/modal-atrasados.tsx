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

export function ModalAtrasados({
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
      <Dialog.Trigger className="mt-1 text-[11px] text-destructive/60 hover:text-destructive transition-colors font-medium">
        + {extrasCount} mais vencidos → ver todos
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
                Obrigações Vencidas
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
                const due = new Date(o.due_date + 'T00:00:00')
                const dueFormatted = due.toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <div
                    key={o.id}
                    className={cn(
                      'group flex items-center justify-between px-4 py-3',
                      i > 0 && 'border-t border-border'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-destructive text-white">
                        {o.acronym || '—'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{o.name}</p>
                        <p className="text-[11px] text-muted-foreground">{dueFormatted}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      <ModalConcluir
                        obligationId={o.id}
                        obligationName={o.name}
                        clientName={clientName}
                        dueDate={o.due_date}
                      />
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
