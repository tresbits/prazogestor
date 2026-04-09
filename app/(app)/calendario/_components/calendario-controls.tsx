'use client'

import { useState } from 'react'
import { LayoutGrid, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CalendarioNav } from './calendario-nav'
import { CalendarioGrid } from './calendario-grid'
import type { ObrigacaoCalendario } from '../page'

export type CalendarioView = 'grade' | 'lista'

export function CalendarioControls({
  diasMap,
  ano,
  mes,
  mesLabel,
}: {
  diasMap: Record<string, ObrigacaoCalendario[]>
  ano: number
  mes: number
  mesLabel: string
}) {
  const [view, setView] = useState<CalendarioView>('grade')

  return (
    <div className="space-y-5">
      {/* Nav + toggle na mesma linha */}
      <div className="flex items-center justify-between">
        <CalendarioNav ano={ano} mes={mes} mesLabel={mesLabel} />

        <div className="flex items-center gap-0.5 bg-muted rounded-full p-1">
          <button
            onClick={() => setView('grade')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              view === 'grade'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Visualização em grade"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView('lista')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              view === 'lista'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Visualização em lista"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CalendarioGrid diasMap={diasMap} ano={ano} mes={mes} view={view} />
    </div>
  )
}
