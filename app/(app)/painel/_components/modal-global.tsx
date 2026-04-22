'use client'

import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { ModalConcluir } from './modal-concluir'

export type ObItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
  clientId: string
  clientName: string
  clientCnpj: string
}

function getDias(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((new Date(dueDate + 'T00:00:00').getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function UrgenciaLabel({ status, dueDate }: { status: string; dueDate: string }) {
  const d = getDias(dueDate)
  if (status === 'overdue' || d < 0) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (d === 0) return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (d <= 3) return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {d} {d === 1 ? 'DIA' : 'DIAS'}</span>
  return <span className="text-[11px] font-bold text-amber-500/70 tracking-wide">EM {d} DIAS</span>
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function ModalGlobal({
  title,
  items,
  open,
  onOpenChange,
}: {
  title: string
  items: ObItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)

  const byClient = new Map<string, { name: string; cnpj: string; items: ObItem[] }>()
  for (const item of items) {
    if (!byClient.has(item.clientId)) {
      byClient.set(item.clientId, { name: item.clientName, cnpj: item.clientCnpj, items: [] })
    }
    byClient.get(item.clientId)!.items.push(item)
  }
  const groups = Array.from(byClient.values())

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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">· Painel</p>
              <Dialog.Title className="font-heading text-xl font-bold text-foreground leading-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? 'obrigação' : 'obrigações'}
                {groups.length > 1 && ` · ${groups.length} clientes`}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Grupos por cliente */}
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar py-2">
            {groups.map((group, gi) => (
              <div key={group.name} className={cn('px-6 py-4', gi > 0 && 'border-t border-border')}>
                <div className="mb-3">
                  <p className="font-heading text-[15px] font-semibold text-foreground truncate">
                    {group.name}
                  </p>
                  {group.cnpj && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {formatCNPJ(group.cnpj)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  {group.items.map((item, oi) => (
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
                        <span className="text-sm text-muted-foreground truncate">{item.name}</span>
                      </div>
                      <div className="shrink-0 ml-4 relative flex items-center min-w-[58px] justify-end">
                        <span className="whitespace-nowrap transition-opacity group-hover:opacity-0">
                          <UrgenciaLabel status={item.status} dueDate={item.due_date} />
                        </span>
                        <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ModalConcluir
                            obligationId={item.id}
                            obligationName={item.name}
                            clientName={item.clientName}
                            dueDate={item.due_date}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
