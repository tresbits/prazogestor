'use client'

import { useActionState, useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X, Pencil } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'
import type { Client } from '@/types'

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'mei', label: 'MEI' },
]

export function ModalEditarCliente({
  client,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  client: Client
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
            'w-full max-w-md',
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

          {/* Form */}
          <form action={action}>
            <input type="hidden" name="client_id" value={client.id} />

            <div className="px-6 space-y-4 pb-4">
              {/* Nome */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
                  Nome / Razão Social
                </label>
                <input
                  name="name"
                  defaultValue={client.name}
                  required
                  className={cn(
                    'w-full px-3 py-2 rounded-xl text-sm',
                    'bg-muted/60 border border-border/60',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring/40',
                    'transition-colors'
                  )}
                />
              </div>

              {/* Regime + Funcionários */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
                    Regime
                  </label>
                  <select
                    name="tax_regime"
                    defaultValue={client.tax_regime}
                    className={cn(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-muted/60 border border-border/60',
                      'text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring/40',
                      'transition-colors appearance-none cursor-pointer'
                    )}
                  >
                    {REGIME_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
                    Funcionários
                  </label>
                  <select
                    name="has_employees"
                    defaultValue={client.has_employees ? 'true' : 'false'}
                    className={cn(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-muted/60 border border-border/60',
                      'text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring/40',
                      'transition-colors appearance-none cursor-pointer'
                    )}
                  >
                    <option value="false">Sem funcionários</option>
                    <option value="true">Com funcionários</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
            </div>

            {/* Footer */}
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
