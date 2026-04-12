'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ModalDia } from './modal-dia'
import { ModalConcluir } from '../../painel/_components/modal-concluir'
import type { ObrigacaoCalendario } from '../page'
import type { CalendarioView } from './calendario-controls'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function getDias(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dueDate + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function pillClass(status: string, dueDate: string): string {
  const dias = getDias(dueDate)
  const isAtrasado = status === 'overdue' || dias < 0
  const isHoje = dias === 0
  const isUrgente = !isAtrasado && !isHoje && dias <= 3
  const isProximo = !isAtrasado && !isHoje && !isUrgente && dias <= 7
  if (isAtrasado || isHoje) return 'bg-destructive/10 text-destructive'
  if (isUrgente) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  if (isProximo) return 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
  return 'bg-muted text-muted-foreground'
}

function UrgenciaLabel({ status, dueDate }: { status: string; dueDate: string }) {
  const dias = getDias(dueDate)
  const isAtrasado = status === 'overdue' || dias < 0
  const isHoje = dias === 0
  const isUrgente = !isAtrasado && !isHoje && dias <= 3
  const isProximo = !isAtrasado && !isHoje && !isUrgente && dias <= 7
  if (isAtrasado) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (isHoje)     return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (isUrgente)  return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {dias} {dias === 1 ? 'DIA' : 'DIAS'}</span>
  if (isProximo)  return <span className="text-[11px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {dias} DIAS</span>
  return <span className="text-[11px] font-bold text-muted-foreground tracking-wide">EM {dias} DIAS</span>
}

type Celula = { date: string; dia: number; currentMonth: boolean }

function buildCells(ano: number, mes: number): Celula[] {
  const cells: Celula[] = []
  const startDow = new Date(ano, mes - 1, 1).getDay()
  const diasNoMes = new Date(ano, mes, 0).getDate()

  const prevMes = mes === 1 ? 12 : mes - 1
  const prevAno = mes === 1 ? ano - 1 : ano
  const diasPrevMes = new Date(prevAno, prevMes, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const dia = diasPrevMes - i
    cells.push({ date: `${prevAno}-${String(prevMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`, dia, currentMonth: false })
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    cells.push({ date: `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`, dia, currentMonth: true })
  }

  const nextMes = mes === 12 ? 1 : mes + 1
  const nextAno = mes === 12 ? ano + 1 : ano
  const total = Math.ceil(cells.length / 7) * 7
  let nextDia = 1
  while (cells.length < total) {
    cells.push({ date: `${nextAno}-${String(nextMes).padStart(2, '0')}-${String(nextDia).padStart(2, '0')}`, dia: nextDia, currentMonth: false })
    nextDia++
  }
  return cells
}

export function CalendarioGrid({
  daysMap,
  year,
  month,
  view,
}: {
  daysMap: Record<string, ObrigacaoCalendario[]>
  year: number
  month: number
  view: CalendarioView
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeStr = hoje.toISOString().split('T')[0]

  const cells = buildCells(year, month)
  const weeks: Celula[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  function handleClick(date: string) {
    const items = daysMap[date] ?? []
    if (!items.length) return
    setSelectedDate(date)
    setModalOpen(true)
  }

  const selectedItems = selectedDate ? (daysMap[selectedDate] ?? []) : []

  // Dias com itens ordenados para a view lista
  const diasComItens = cells
    .filter(c => c.currentMonth && (daysMap[c.date]?.length ?? 0) > 0)

  return (
    <>
      {/* ── View: Grade ── */}
      {view === 'grade' && (
        <div>
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map(cell => {
              const items = daysMap[cell.date] ?? []
              const isHoje = cell.date === hojeStr
              const hasItems = items.length > 0
              const preview = items.slice(0, 2)
              const extras = items.length - 2

              return (
                <div
                  key={cell.date}
                  onClick={() => handleClick(cell.date)}
                  className={cn(
                    'rounded-xl min-h-[100px] p-2 flex flex-col gap-1 shadow-card',
                    cell.currentMonth ? 'bg-card' : 'bg-muted/30 dark:bg-muted/10',
                    !cell.currentMonth && 'opacity-50',
                    hasItems && 'cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all',
                    isHoje && 'ring-2 ring-foreground/30'
                  )}
                >
                  <span className={cn(
                    'text-[11px] font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0',
                    isHoje ? 'bg-foreground text-background font-bold' : 'text-muted-foreground'
                  )}>
                    {cell.dia}
                  </span>
                  {preview.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate',
                        pillClass(item.status, item.due_date)
                      )}
                    >
                      <span className="font-bold shrink-0">{item.acronym || '—'}</span>
                      <span className="truncate opacity-70">{item.clientName}</span>
                    </div>
                  ))}
                  {extras > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium px-1 mt-auto">
                      + {extras} mais
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── View: Lista ── */}
      {view === 'lista' && (
        <div className="space-y-3">
          {diasComItens.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhum vencimento neste mês.
            </p>
          )}
          {diasComItens.map(cell => {
            const items = daysMap[cell.date] ?? []
            const isHoje = cell.date === hojeStr
            const d = new Date(cell.date + 'T00:00:00')
            const diaSemana = DIAS_SEMANA[d.getDay()]
            const mesLabel = MESES_CURTOS[d.getMonth()]

            return (
              <div key={cell.date} className="bg-card rounded-[16px] shadow-card overflow-hidden">
                {/* Header do dia */}
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

                {/* Itens */}
                <div className="divide-y divide-border/40">
                  {items.map(item => {
                    const dias = getDias(item.due_date)
                    const isAtrasado = item.status === 'overdue' || dias < 0
                    const isHojeItem  = dias === 0
                    const isUrgente  = !isAtrasado && !isHojeItem && dias <= 3
                    const isProximo  = !isAtrasado && !isHojeItem && !isUrgente && dias <= 7

                    return (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between px-5 py-3"
                      >
                        <div className="min-w-0">
                          <span className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide mb-1',
                            isAtrasado || isHojeItem ? 'bg-destructive/10 text-destructive'
                              : isUrgente            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : isProximo            ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
                              :                        'bg-muted text-muted-foreground'
                          )}>
                            {item.acronym || '—'}
                          </span>
                          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.clientName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                          <UrgenciaLabel status={item.status} dueDate={item.due_date} />
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
      )}

      <ModalDia
        date={selectedDate ?? ''}
        items={selectedItems}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
