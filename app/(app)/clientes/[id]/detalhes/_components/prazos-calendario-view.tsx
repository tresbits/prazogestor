'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, AlignJustify, Check, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { Button } from '@/components/ui/button'
import { CalendarioNav } from '@/components/calendario/calendario-nav'
import { CalendarioGrid } from '@/components/calendario/calendario-grid'
import { ObligationRow } from '@/components/obligation-row'
import { concluirObrigacoes, adiarObrigacoes } from '@/app/actions/obrigacoes'
import { ModalDiaPrazos } from './modal-dia-prazos'
import type { PrazosOb } from '../page'

export function PrazosCalendarioView({
  daysMap,
  year,
  month,
  monthLabel,
  clientId,
  clientName,
  defaultView = 'lista',
}: {
  daysMap: Record<string, PrazosOb[]>
  year: number
  month: number
  monthLabel: string
  clientId: string
  clientName: string
  defaultView?: 'grade' | 'lista'
}) {
  const [view, setView]               = useState<'grade' | 'lista'>(defaultView)
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [isPending, startTransition]  = useTransition()
  const router = useRouter()

  function buildHref(y: number, m: number): string {
    const mes = `${y}-${String(m).padStart(2, '0')}`
    return `/clientes/${clientId}/detalhes?mes=${mes}`
  }

  function toggle(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function handleConcluir() {
    startTransition(async () => {
      await concluirObrigacoes(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  function handleAdiar() {
    startTransition(async () => {
      await adiarObrigacoes(Array.from(selected), 7)
      setSelected(new Set())
      router.refresh()
    })
  }

  function switchView(v: 'grade' | 'lista') {
    setView(v)
    setSelected(new Set())
  }

  const selectedItems = selectedDate ? (daysMap[selectedDate] ?? []) : []

  return (
    <div className="space-y-5">
      {/* Nav + toggle */}
      <div className="flex items-center justify-between">
        <CalendarioNav year={year} month={month} monthLabel={monthLabel} buildHref={buildHref} />

        <div className="flex items-center gap-0.5 bg-muted rounded-full p-1">
          <button
            onClick={() => switchView('grade')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              view === 'grade' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Visualização em grade"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => switchView('lista')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              view === 'lista' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Visualização em lista"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CalendarioGrid
        daysMap={daysMap}
        year={year}
        month={month}
        view={view}
        renderGradeItem={item => (
          <div className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate',
            chipColor(item.acronym)
          )}>
            <span className="font-bold shrink-0">{item.acronym || '—'}</span>
          </div>
        )}
        renderListaItem={item => (
          <ObligationRow
            key={item.id}
            id={item.id} acronym={item.acronym} name={item.name}
            due_date={item.due_date} status={item.status} clientName={clientName}
            value={item.value} completedAt={item.completed_at}
            selected={selected.has(item.id)} onToggle={() => toggle(item.id)}
            className="px-5 py-3"
          />
        )}
        onCellClick={(date) => {
          setSelectedDate(date)
          setModalOpen(true)
        }}
      />

      <ModalDiaPrazos
        date={selectedDate ?? ''}
        items={selectedItems}
        clientName={clientName}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Barra flutuante de ações em lote */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_32px_0_rgb(0,0,0,0.12)] px-4 py-3">
            <span className="text-[12px] font-mono font-semibold text-foreground shrink-0">
              {selected.size} selecionada{selected.size !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 flex items-center justify-center gap-2">
              <Button size="sm" variant="default" onClick={handleConcluir} disabled={isPending}>
                <Check /> Confirmar pagamento
              </Button>
              <Button size="sm" variant="outline" onClick={handleAdiar} disabled={isPending}>
                <Clock /> Adiar 7 dias
              </Button>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={() => setSelected(new Set())} disabled={isPending}>
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
