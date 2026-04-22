'use client'

import { useActionState, useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X, Pencil } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'
import type { ClientWithEmail } from '@/types'
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
    if (state && 'success' in state && state.success) {
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
            'w-[calc(100%-2rem)] max-w-xl max-h-[calc(100vh-2rem)] flex flex-col',
            'bg-glass backdrop-blur-xl',
            'border-[0.5px] border-glass',
            'rounded-[20px]',
            'shadow-[0_32px_80px_rgba(0,0,0,0.18)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97]',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">· Cliente</p>
              <Dialog.Title className="font-heading text-xl font-bold text-foreground leading-tight">
                Editar Cliente
              </Dialog.Title>
              <Dialog.Description className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
                {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={action} className="flex flex-col flex-1 min-h-0">
            <input type="hidden" name="client_id" value={client.id} />

            <div className="px-6 pb-4 overflow-y-auto flex-1">
              <ClienteFormFields
                cnpjForLookup={client.cnpj}
                defaultValues={{
                  name: client.name,
                  tax_regime: client.tax_regime,
                  has_employees: client.has_employees ? 'true' : 'false',
                  email: client.email ?? undefined,
                  contact_name: client.contact_name ?? undefined,
                  contact_phone: client.contact_phone ?? undefined,
                  contact_email_is_contact: client.contact_email_is_contact ?? false,
                  has_address: client.has_address ?? false,
                  address_street: client.address_street ?? undefined,
                  address_number: client.address_number ?? undefined,
                  address_complement: client.address_complement ?? undefined,
                  address_neighborhood: client.address_neighborhood ?? undefined,
                  address_city: client.address_city ?? undefined,
                  address_state: client.address_state ?? undefined,
                  address_zip: client.address_zip ?? undefined,
                }}
              />
              {state && 'error' in state && (
                <div className="mt-4">
                  <FormError message={state.error} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 shrink-0">
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
