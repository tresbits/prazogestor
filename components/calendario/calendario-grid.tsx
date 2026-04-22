'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  buildCells, getDias, cellUrgency, badgeClass,
  DIAS_SEMANA, DIAS_SEMANA_MOB, MESES_CURTOS,
} from './calendar-utils'

export type CalendarioView = 'grade' | 'lista'

type CalendarioItem = { id: string; due_date: string; status: string }

interface CalendarioGridProps<T extends CalendarioItem> {
  daysMap: Record<string, T[]>
  year: number
  month: number
  view: CalendarioView
  /** Content rendered inside each grade cell (desktop pills) */
  renderGradeItem: (item: T) => ReactNode
  /** Row rendered inside each day section (lista view) */
  renderListaItem: (item: T) => ReactNode
  /** Called when a non-empty grade cell is clicked */
  onCellClick?: (date: string, items: T[]) => void
}

export function CalendarioGrid<T extends CalendarioItem>({
  daysMap,
  year,
  month,
  view,
  renderGradeItem,
  renderListaItem,
  onCellClick,
}: CalendarioGridProps<T>) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeStr = hoje.toISOString().split('T')[0]

  const cells = buildCells(year, month)

  const diasComItens = cells.filter(c => c.currentMonth && (daysMap[c.date]?.length ?? 0) > 0)

  return (
    <>
      {/* ── Grade ── */}
      {view === 'grade' && (
        <div>
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map((d, i) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest py-2">
                <span className="hidden md:inline">{d}</span>
                <span className="md:hidden">{DIAS_SEMANA_MOB[i]}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {cells.map(cell => {
              const items = daysMap[cell.date] ?? []
              const isHoje   = cell.date === hojeStr
              const hasItems = items.length > 0
              const preview  = items.slice(0, 2)
              const extras   = items.length - 2
              const urgency  = hasItems ? cellUrgency(items) : 'normal'

              return (
                <div
                  key={cell.date}
                  onClick={() => hasItems && onCellClick?.(cell.date, items)}
                  className={cn(
                    'rounded-xl p-1.5 md:p-2 flex flex-col gap-1 shadow-card',
                    'min-h-[48px] md:min-h-[100px]',
                    cell.currentMonth ? 'bg-card' : 'bg-muted/30 dark:bg-muted/10',
                    !cell.currentMonth && 'opacity-50',
                    hasItems && onCellClick && 'cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all',
                    isHoje && 'ring-2 ring-foreground/30'
                  )}
                >
                  <span className={cn(
                    'text-[11px] font-medium w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full shrink-0',
                    isHoje ? 'bg-foreground text-background font-bold' : 'text-muted-foreground'
                  )}>
                    {cell.dia}
                  </span>

                  {/* Mobile: badge com cor de urgência */}
                  {hasItems && (
                    <div className="md:hidden mt-auto flex justify-center">
                      <span className={cn(
                        'text-[9px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full',
                        badgeClass(urgency)
                      )}>
                        {items.length}
                      </span>
                    </div>
                  )}

                  {/* Desktop: pills */}
                  {preview.map(item => (
                    <div key={item.id} className="hidden md:block">
                      {renderGradeItem(item)}
                    </div>
                  ))}
                  {extras > 0 && (
                    <span className="hidden md:block text-[10px] text-muted-foreground font-medium px-1 mt-auto">
                      + {extras} mais
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Lista ── */}
      {view === 'lista' && (
        <div className="space-y-3">
          {diasComItens.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhum vencimento neste mês.
            </p>
          )}
          {diasComItens.map(cell => {
            const items  = daysMap[cell.date] ?? []
            const isHoje = cell.date === hojeStr
            const d      = new Date(cell.date + 'T00:00:00')
            const diaSemana = DIAS_SEMANA[d.getDay()]
            const mesLabel  = MESES_CURTOS[d.getMonth()]

            return (
              <div key={cell.date} className="bg-card rounded-[16px] shadow-card overflow-hidden">
                <div className={cn(
                  'px-5 py-3 flex items-center gap-2',
                  isHoje ? 'bg-foreground/5' : 'bg-muted/50'
                )}>
                  <span className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shrink-0',
                    isHoje ? 'bg-foreground text-background' : 'bg-card text-foreground'
                  )}>
                    {cell.dia}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-[13px] font-semibold text-foreground capitalize">
                      {diaSemana}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {mesLabel}
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {items.length} {items.length === 1 ? 'vencimento' : 'vencimentos'}
                  </span>
                </div>

                <div className="divide-y divide-border/40">
                  {items.map(item => renderListaItem(item))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
