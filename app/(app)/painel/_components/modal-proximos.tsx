'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalConcluir } from './modal-concluir'

type ObrigacaoItem = {
  id: string
  data_vencimento: string
  status: string
  sigla: string
  nome: string
}

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function UrgenciaLabel({ dias, status }: { dias: number; status: string }) {
  const isAtrasado = status === 'atrasado' || dias < 0
  const isHoje    = dias === 0
  const isUrgente = !isAtrasado && !isHoje && dias <= 3
  const isProximo = !isAtrasado && !isHoje && !isUrgente && dias <= 7

  if (isAtrasado) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (isHoje)     return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (isUrgente)  return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {dias} {dias === 1 ? 'DIA' : 'DIAS'}</span>
  if (isProximo)  return <span className="text-[11px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {dias} DIAS</span>
  return <span className="text-[11px] font-bold text-muted-foreground tracking-wide">EM {dias} DIAS</span>
}

export function ModalProximos({
  clienteNome,
  obrigacoes,
  extrasCount,
}: {
  clienteNome: string
  obrigacoes: ObrigacaoItem[]
  extrasCount: number
}) {
  const [open, setOpen] = useState(false)

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
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md max-h-[85vh]',
            'flex flex-col',
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
          <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
            <div>
              <Dialog.Title className="font-heading text-[17px] font-semibold text-foreground leading-tight">
                Próximos Vencimentos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-0.5 truncate max-w-[280px]">
                {clienteNome}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* List */}
          <div className="px-6 pb-2 flex-1 overflow-y-auto min-h-0 no-scrollbar">
            {obrigacoes.map((o, i) => {
              const dias = getDiasRestantes(o.data_vencimento)
              const isAtrasado = o.status === 'atrasado' || dias < 0
              const isHoje     = dias === 0
              const isUrgente  = !isAtrasado && !isHoje && dias <= 3
              const isProximo  = !isAtrasado && !isHoje && !isUrgente && dias <= 7

              return (
                <div
                  key={o.id}
                  className={cn(
                    'group flex items-center justify-between py-3',
                    i > 0 && 'border-t border-border/40'
                  )}
                >
                  <div className="min-w-0">
                    <span className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide mb-1',
                      isAtrasado || isHoje ? 'bg-destructive/10 text-destructive'
                        : isUrgente        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : isProximo        ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
                        :                    'bg-muted text-muted-foreground'
                    )}>
                      {o.sigla || '—'}
                    </span>
                    <p className="text-sm font-semibold text-foreground truncate">{o.nome}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <UrgenciaLabel dias={dias} status={o.status} />
                    <ModalConcluir
                      obrigacaoId={o.id}
                      nomeObrigacao={o.nome}
                      clienteNome={clienteNome}
                      dataVencimento={o.data_vencimento}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-border/40 shrink-0">
            <Dialog.Close
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'transition-colors'
              )}
            >
              Fechar
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
