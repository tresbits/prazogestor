'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { excluirConta } from '@/app/actions/configuracoes'
import { cn } from '@/lib/utils'

export function SecaoZonaPerigo() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleExcluir() {
    setPending(true)
    await excluirConta()
  }

  return (
    <div className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-semibold text-destructive">Zona de Perigo</h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        A exclusão de dados é permanente e não pode ser revertida. Todos os clientes e
        prazos cadastrados serão apagados.
      </p>

      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger className="w-full py-2.5 rounded-full text-sm font-medium bg-destructive text-white hover:opacity-90 transition-opacity">
          Excluir todos os dados do escritório
        </AlertDialog.Trigger>

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
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div>
                <AlertDialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                  Excluir conta?
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-muted-foreground mt-1">
                  Todos os dados do escritório — clientes, obrigações e histórico — serão removidos permanentemente. Esta ação não pode ser desfeita.
                </AlertDialog.Description>
              </div>
              <AlertDialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </AlertDialog.Close>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
              <AlertDialog.Close
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                )}
              >
                Cancelar
              </AlertDialog.Close>
              <button
                onClick={handleExcluir}
                disabled={pending}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'bg-destructive text-white hover:opacity-90 active:scale-95',
                  'transition-all disabled:opacity-40'
                )}
              >
                {pending ? 'Excluindo…' : 'Excluir tudo'}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
