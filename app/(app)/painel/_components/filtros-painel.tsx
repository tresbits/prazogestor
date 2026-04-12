'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const FILTROS = [
  { value: 'semana', label: '7 dias' },
  { value: 'mes', label: '30 dias' },
  { value: '90', label: '90 dias' },
] as const

export function FiltrosPainel({
  filtroAtivo,
  clientes,
  clienteIdAtivo,
}: {
  filtroAtivo: string | undefined
  clientes: { id: string; name: string }[]
  clienteIdAtivo: string | undefined
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/painel?${params.toString()}`)
  }

  // default visual: 30 dias
  const filtroDisplay = filtroAtivo ?? ('mes' as string)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtros de período */}
      <div className="flex gap-1 bg-muted rounded-full p-1">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setParam('filtro', f.value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm transition-colors',
              filtroDisplay === f.value
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtro por cliente */}
      {clientes.length > 0 && (
        <Select
          value={clienteIdAtivo ?? '__all__'}
          onValueChange={(val) => setParam('cliente_id', val === '__all__' ? undefined : val ?? undefined)}
        >
          <SelectTrigger className="w-48" size="sm">
            <SelectValue>
              {clienteIdAtivo
                ? (clientes.find(c => c.id === clienteIdAtivo)?.name ?? 'Cliente')
                : 'Todos os clientes'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os clientes</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
