'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarioNav({
  year,
  month,
  monthLabel,
  filter,
}: {
  year: number
  month: number
  monthLabel: string
  filter?: string
}) {
  const router = useRouter()

  function navegar(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }
    const mesStr = `${newYear}-${String(newMonth).padStart(2, '0')}`
    const q = filter ? `&q=${encodeURIComponent(filter)}` : ''
    router.push(`/calendario?mes=${mesStr}${q}`)
  }

  const hoje = new Date()
  const eMesAtual = year === hoje.getFullYear() && month === hoje.getMonth() + 1

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navegar(-1)}
        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="font-heading text-[15px] font-semibold text-foreground min-w-[180px] text-center">
        {monthLabel}
      </span>

      <button
        onClick={() => navegar(1)}
        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!eMesAtual && (
        <button
          onClick={() => router.push(filter ? `/calendario?q=${encodeURIComponent(filter)}` : '/calendario')}
          className={cn(
            'ml-2 px-3 py-1.5 rounded-full text-xs font-medium',
            'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          )}
        >
          Hoje
        </button>
      )}
    </div>
  )
}
