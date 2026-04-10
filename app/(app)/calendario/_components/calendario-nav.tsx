'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarioNav({
  ano,
  mes,
  mesLabel,
  filtro,
}: {
  ano: number
  mes: number
  mesLabel: string
  filtro?: string
}) {
  const router = useRouter()

  function navegar(delta: number) {
    let novoMes = mes + delta
    let novoAno = ano
    if (novoMes > 12) { novoMes = 1; novoAno++ }
    if (novoMes < 1) { novoMes = 12; novoAno-- }
    const mesStr = `${novoAno}-${String(novoMes).padStart(2, '0')}`
    const q = filtro ? `&q=${encodeURIComponent(filtro)}` : ''
    router.push(`/calendario?mes=${mesStr}${q}`)
  }

  const hoje = new Date()
  const eMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth() + 1

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
        {mesLabel}
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
          onClick={() => router.push(filtro ? `/calendario?q=${encodeURIComponent(filtro)}` : '/calendario')}
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
