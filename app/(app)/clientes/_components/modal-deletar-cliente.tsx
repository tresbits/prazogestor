'use client'

import { useActionState, useEffect, useState } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { X } from 'lucide-react'
import { deletarCliente } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'

export function ModalDeletarCliente({
  clienteId,
  clienteNome,
  onDeleted,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  clienteId: string
  clienteNome: string
  onDeleted?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange ?? setInternalOpen
  const [state, action, pending] = useActionState(deletarCliente, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      onDeleted?.()
    }
  }, [state])

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <AlertDialog.Trigger className="w-full flex items-center gap-2 px-1.5 py-1 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors">
          Excluir
        </AlertDialog.Trigger>
      )}

      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-[12px]',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0',
            'transition-all duration-200'
          )}
        />
        <AlertDialog.Popup
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
              <AlertDialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Excluir Cliente
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground mt-1">
                Esta acção não pode ser revertida. Todas as obrigações associadas serão excluídas.
              </AlertDialog.Description>
            </div>
            <AlertDialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </AlertDialog.Close>
          </div>

          {/* Cliente */}
          <div className="px-6 pb-4">
            <div className="bg-muted/60 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Cliente</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{clienteNome}</p>
            </div>
            {state?.error && (
              <p className="text-sm text-destructive mt-3">{state.error}</p>
            )}
          </div>

          {/* Footer */}
          <form action={action}>
            <input type="hidden" name="cliente_id" value={clienteId} />
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
              <AlertDialog.Close
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'transition-colors'
                )}
              >
                Cancelar
              </AlertDialog.Close>
              <button
                type="submit"
                disabled={pending}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'bg-destructive text-white',
                  'hover:opacity-90 active:scale-95',
                  'transition-all disabled:opacity-40'
                )}
              >
                {pending ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </form>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
