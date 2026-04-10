'use client'

import { useState } from 'react'
import { LayoutGrid, AlignJustify } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  filtro,
}: {
  diasMap: Record<string, ObrigacaoCalendario[]>
  ano: number
  mes: number
  mesLabel: string
  filtro?: string
}) {
  const [view, setView] = useState<CalendarioView>('grade')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Filtro client-side: mantém só dias com obrigações do cliente buscado
  const diasMapFiltrado: Record<string, ObrigacaoCalendario[]> = filtro
    ? Object.fromEntries(
        Object.entries(diasMap)
          .map(([dia, obs]) => [
            dia,
            obs.filter(o => o.clienteNome.toLowerCase().includes(filtro.toLowerCase())),
          ])
          .filter(([, obs]) => (obs as ObrigacaoCalendario[]).length > 0)
      )
    : diasMap

  // Nome real do cliente encontrado (para exibir no banner)
  const clienteEncontrado = filtro
    ? Object.values(diasMapFiltrado).flat()[0]?.clienteNome ?? null
    : null

  // URL para limpar filtro preservando o mês
  const mesParam = searchParams.get('mes')
  const limparHref = mesParam ? `${pathname}?mes=${mesParam}` : pathname

  return (
    <div className="space-y-5">
      {/* Nav + toggle na mesma linha */}
      <div className="flex items-center justify-between">
        <CalendarioNav ano={ano} mes={mes} mesLabel={mesLabel} filtro={filtro} />

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

      {/* Banner do cliente filtrado */}
      {filtro && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-muted/60 border border-border/40">
          <div className="flex-1 min-w-0">
            {clienteEncontrado ? (
              <>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Filtrando por cliente
                </p>
                <p className="text-[15px] font-semibold text-foreground truncate mt-0.5">
                  {clienteEncontrado}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum vencimento encontrado para{' '}
                <span className="font-semibold text-foreground">"{filtro}"</span>{' '}
                em {mesLabel}.
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

      <CalendarioGrid diasMap={diasMapFiltrado} ano={ano} mes={mes} view={view} />
    </div>
  )
}
