'use client'

import { useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ObligationRow } from '@/components/obligation-row'

type ObligationItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function ModalProximos({
  clientName,
  clientCnpj,
  obligations,
  extrasCount,
}: {
  clientName: string
  clientCnpj: string
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
            'w-[calc(100%-2rem)] max-w-xl max-h-[85vh] flex flex-col',
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">· Painel</p>
              <Dialog.Title className="font-heading text-xl font-bold text-foreground leading-tight">
                Próximos Vencimentos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {obligations.length} {obligations.length === 1 ? 'obrigação' : 'obrigações'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar py-2">
            <div className="px-6 py-4">
              <div className="mb-3">
                <p className="font-heading text-[15px] font-semibold text-foreground truncate">{clientName}</p>
                {clientCnpj && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{formatCNPJ(clientCnpj)}</p>
                )}
              </div>
              <div className="rounded-xl overflow-hidden border border-border bg-muted divide-y divide-border">
                {obligations.map(o => (
                  <ObligationRow
                    key={o.id}
                    id={o.id} acronym={o.acronym} name={o.name}
                    due_date={o.due_date} status={o.status} clientName={clientName}
                    className="px-4 py-3"
                  />
                ))}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
