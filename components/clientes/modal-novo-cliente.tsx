'use client'

import { useActionState, useEffect, useState, useRef, isValidElement } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { createClient } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'
import { FormError } from '@/components/ui/form-error'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'

export function ModalNovoCliente({
  trigger,
}: {
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createClient, null)
  const [cnpj, setCnpj] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      setOpen(false)
      setCnpj('')
      formRef.current?.reset()
    }
  }, [state])

  useEffect(() => {
    if (!open) {
      setCnpj('')
      formRef.current?.reset()
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={trigger as React.ReactElement}
        nativeButton={isValidElement(trigger) && trigger.type === 'button'}
      />

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
                Novo Cliente
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                A razão social é buscada automaticamente pelo CNPJ.
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form ref={formRef} action={action} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 pb-4 overflow-y-auto flex-1">
              <ClienteFormFields
                cnpj={{ value: cnpj, onChange: setCnpj }}
              />
              {state && 'error' in state && state.error && (
                <div className="mt-4">
                  <FormError message={state.error as string} />
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
                {pending ? 'Cadastrando…' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
