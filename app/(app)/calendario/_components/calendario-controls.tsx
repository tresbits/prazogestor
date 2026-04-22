'use client'

import { useState } from 'react'
import { LayoutGrid, AlignJustify } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { chipColor } from '@/lib/obligation-color'
import { CalendarioNav } from '@/components/calendario/calendario-nav'
import { CalendarioGrid } from '@/components/calendario/calendario-grid'
import { ObligationRow } from '@/components/obligation-row'
import { ModalDia } from './modal-dia'
import type { ObrigacaoCalendario } from '../page'

export type CalendarioView = 'grade' | 'lista'

export function CalendarioControls({
  daysMap,
  year,
  month,
  monthLabel,
  filter,
}: {
  daysMap: Record<string, ObrigacaoCalendario[]>
  year: number
  month: number
  monthLabel: string
  filter?: string
}) {
  const [view, setView] = useState<CalendarioView>('grade')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filteredDaysMap: Record<string, ObrigacaoCalendario[]> = filter
    ? Object.fromEntries(
        Object.entries(daysMap)
          .map(([day, obs]) => [
            day,
            obs.filter(o => o.clientName.toLowerCase().includes(filter.toLowerCase())),
          ])
          .filter(([, obs]) => (obs as ObrigacaoCalendario[]).length > 0)
      )
    : daysMap

  const foundClient = filter
    ? Object.values(filteredDaysMap).flat()[0]?.clientName ?? null
    : null

  const mesParam = searchParams.get('mes')
  const limparHref = mesParam ? `${pathname}?mes=${mesParam}` : pathname

  function buildHref(y: number, m: number): string {
    const mes = `${y}-${String(m).padStart(2, '0')}`
    const q = filter ? `&q=${encodeURIComponent(filter)}` : ''
    return `/calendario?mes=${mes}${q}`
  }

  const selectedItems = selectedDate ? (filteredDaysMap[selectedDate] ?? []) : []

  return (
    <div className="space-y-5">
      {/* Nav + toggle */}
      <div className="flex items-center justify-between">
        <CalendarioNav year={year} month={month} monthLabel={monthLabel} buildHref={buildHref} />

        <div className="flex items-center gap-0.5 bg-muted rounded-full p-1">
          <button
            onClick={() => setView('grade')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              view === 'grade' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Visualização em grade"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView('lista')}
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

      {/* Banner filtro */}
      {filter && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-muted/60 border border-border/40">
          <div className="flex-1 min-w-0">
            {foundClient ? (
              <>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Filtrando por cliente</p>
                <p className="text-[15px] font-semibold text-foreground truncate mt-0.5">{foundClient}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum vencimento encontrado para{' '}
                <span className="font-semibold text-foreground">"{filter}"</span>{' '}
                em {monthLabel}.
              </p>
            )}
          </div>
          <Link
            href={limparHref}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-background hover:bg-muted text-foreground border border-border/40 transition-colors"
          >
            × limpar filtro
          </Link>
        </div>
      )}

      <CalendarioGrid
        daysMap={filteredDaysMap}
        year={year}
        month={month}
        view={view}
        renderGradeItem={item => (
          <div className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate',
            chipColor(item.acronym)
          )}>
            <span className="font-bold shrink-0">{item.acronym || '—'}</span>
            <span className="truncate opacity-70">{item.clientName}</span>
          </div>
        )}
        renderListaItem={item => (
          <ObligationRow
            key={item.id}
            id={item.id} acronym={item.acronym} name={item.name}
            due_date={item.due_date} status={item.status} clientName={item.clientName}
            showClientName
            className="px-5 py-3"
          />
        )}
        onCellClick={(date, items) => {
          setSelectedDate(date)
          setModalOpen(true)
        }}
      />

      <ModalDia
        date={selectedDate ?? ''}
        items={selectedItems}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
