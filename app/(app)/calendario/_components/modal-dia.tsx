'use client'

import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { ModalConcluir } from '../../painel/_components/modal-concluir'
import type { ObrigacaoCalendario } from '../page'

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function getDias(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dueDate + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function urgenciaPrioridade(item: ObrigacaoCalendario): number {
  const dias = getDias(item.due_date)
  if (item.status === 'overdue' || dias < 0) return 0
  if (dias === 0) return 1
  if (dias <= 3) return 2
  if (dias <= 7) return 3
  return 4
}

function UrgenciaLabel({ prioridade, dias }: { prioridade: number; dias: number }) {
  if (prioridade === 0) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (prioridade === 1) return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (prioridade === 2) return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {dias} {dias === 1 ? 'DIA' : 'DIAS'}</span>
  if (prioridade === 3) return <span className="text-[11px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {dias} DIAS</span>
  return <span className="text-[11px] font-bold text-muted-foreground/50 tracking-wide">EM {dias} DIAS</span>
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function ModalDia({
  date,
  items,
  open,
  onOpenChange,
}: {
  date: string
  items: ObrigacaoCalendario[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dateLabel = date
    ? (() => {
        const d = new Date(date + 'T00:00:00')
        return `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`
      })()
    : ''

  // Agrupar por cliente
  const porCliente = new Map<string, { nome: string; cnpj: string; obs: ObrigacaoCalendario[] }>()
  for (const item of items) {
    if (!porCliente.has(item.clientId)) {
      porCliente.set(item.clientId, { nome: item.clientName, cnpj: item.clientCnpj, obs: [] })
    }
    porCliente.get(item.clientId)!.obs.push(item)
  }

  // Ordenar clientes pela pior urgência
  const grupos = Array.from(porCliente.values()).sort((a, b) => {
    const piorA = Math.min(...a.obs.map(urgenciaPrioridade))
    const piorB = Math.min(...b.obs.map(urgenciaPrioridade))
    return piorA - piorB
  })

  const totalClientes = grupos.length
  const popupRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">· Calendário</p>
              <Dialog.Title className="font-heading text-xl font-bold text-foreground leading-tight">
                Vencimentos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                {dateLabel}
                {items.length > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{items.length} {items.length === 1 ? 'obrigação' : 'obrigações'}</span>
                    {totalClientes > 1 && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{totalClientes} clientes</span>
                      </>
                    )}
                  </>
                )}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Grupos por cliente */}
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar py-2">
            {grupos.map((grupo, gi) => {
              const piorPrioridade = Math.min(...grupo.obs.map(urgenciaPrioridade))
              const piorItem = grupo.obs.find(o => urgenciaPrioridade(o) === piorPrioridade)!
              const piorDias = getDias(piorItem.due_date)

              return (
                <div key={grupo.nome} className={cn('px-6 py-4', gi > 0 && 'border-t border-border')}>
                  {/* Header do cliente */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p className="font-heading text-[15px] font-semibold text-foreground truncate">
                        {grupo.nome}
                      </p>
                      {grupo.cnpj && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {formatCNPJ(grupo.cnpj)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <UrgenciaLabel prioridade={piorPrioridade} dias={piorDias} />
                    </div>
                  </div>

                  {/* Obrigações */}
                  <div className="rounded-xl overflow-hidden border border-border bg-muted">
                    {grupo.obs.map((item, oi) => {
                      const prioridade = urgenciaPrioridade(item)
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'group flex items-center justify-between px-4 py-3',
                            oi > 0 && 'border-t border-border'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(
                              'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                              chipColor(item.acronym)
                            )}>
                              {item.acronym || '—'}
                            </span>
                            <span className="text-sm text-muted-foreground truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4">
                            <ModalConcluir
                              obligationId={item.id}
                              obligationName={item.name}
                              clientName={item.clientName}
                              dueDate={item.due_date}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
