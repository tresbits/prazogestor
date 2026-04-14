'use client'

import { useActionState, useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X, Pencil } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'
import type { Client } from '@/types'
// Client type extended locally for email field
type ClientWithEmail = Client & { email?: string | null }
import { FormError } from '@/components/ui/form-error'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'

export function ModalEditarCliente({
  client,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  client: ClientWithEmail
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange ?? setInternalOpen
  const [state, action, pending] = useActionState(updateClient, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <Dialog.Trigger
          className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Editar cliente"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Dialog.Trigger>
      )}

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
            'w-[calc(100%-2rem)] max-w-md',
            'bg-background/90 backdrop-blur-3xl',
            'border-[0.5px] border-white/20 dark:border-white/10',
            'rounded-[20px]',
            'shadow-[0_32px_80px_rgba(0,0,0,0.18)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97]',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Editar Cliente
              </Dialog.Title>
              <Dialog.Description className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={action}>
            <input type="hidden" name="client_id" value={client.id} />

            <div className="px-6 pb-4">
              <ClienteFormFields
                cnpjForLookup={client.cnpj}
                defaultValues={{
                  name: client.name,
                  tax_regime: client.tax_regime,
                  has_employees: client.has_employees ? 'true' : 'false',
                  email: client.email ?? undefined,
                }}
                showEmailField
              />
              {state?.error && (
                <div className="mt-4">
                  <FormError message={state.error} />
                </div>
              )}
            </div>

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
                type="submit"
                disabled={pending}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'bg-foreground text-background',
                  'hover:opacity-90 active:scale-95',
                  'transition-all disabled:opacity-40'
                )}
              >
                {pending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
