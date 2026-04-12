'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { completeObligation } from '@/app/actions/obrigacoes'
import { cn } from '@/lib/utils'
import { FormError } from '@/components/ui/form-error'

type ModalConcluirProps = {
  obligationId: string
  obligationName: string
  clientName: string
  dueDate: string
}

export function ModalConcluir({
  obligationId,
  obligationName,
  clientName,
  dueDate,
}: ModalConcluirProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('obligation_id', obligationId)
      const result = await completeObligation(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  const dueDateTime = new Date(dueDate + 'T00:00:00')
  const dueFormatted = dueDateTime.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          'px-3 py-1 bg-foreground text-background text-[10px] font-bold rounded-full',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'active:scale-95'
        )}
      >
        Concluir
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
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-sm',
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
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Concluir Obrigação
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                Confirmar a conclusão desta obrigação?
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Details */}
          <div className="px-6 pb-4 space-y-2">
            <div className="bg-muted/60 rounded-xl p-4 space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Obrigação</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{obligationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Cliente</p>
                  <p className="text-sm text-foreground mt-0.5 truncate">{clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Vencimento</p>
                  <p className="text-sm text-foreground mt-0.5">{dueFormatted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {error && (
            <div className="px-6 pb-3">
              <FormError message={error} />
            </div>
          )}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
            <Dialog.Close
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'transition-colors'
              )}
            >
              Cancelar
            </Dialog.Close>
            <button
              onClick={handleSubmit}
              disabled={pending}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                'bg-foreground text-background',
                'hover:opacity-90 active:scale-95',
                'transition-all disabled:opacity-40'
              )}
            >
              {pending ? 'Concluindo…' : 'Confirmar Conclusão'}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
