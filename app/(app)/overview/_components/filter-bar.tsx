'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const REGIMES = [
  { key: '',                label: 'Todos' },
  { key: 'simples',         label: 'Simples' },
  { key: 'mei',             label: 'MEI' },
  { key: 'lucro_presumido', label: 'Lucro Presumido' },
  { key: 'lucro_real',      label: 'Lucro Real' },
]

const ALL = 'todos'

export interface FilterCurrent {
  cliente: string
  regime: string
  obrigacao: string
  periodo: string
}

interface FilterBarProps {
  clients: { id: string; name: string }[]
  periods: { key: string; label: string }[]
  current: FilterCurrent
  pathname: string
}

// Searchable empresa dropdown — search state is internal, never affects URL until an item is picked
function ClienteSelect({ clients, value, onChange }: {
  clients: { id: string; name: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients

  const label = value
    ? (clients.find(c => c.id === value)?.name ?? 'Todas as empresas')
    : 'Todas as empresas'

  return (
    <Select
      value={value || ALL}
      onValueChange={v => { setSearch(''); onChange(v === ALL ? '' : (v ?? '')) }}
    >
      <SelectTrigger size="sm" className="w-52">
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Inline search input — stopPropagation prevents Base UI from hijacking keystrokes */}
        <div
          className="px-3 py-1.5 border-b border-border/40"
          onKeyDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <input
            autoFocus
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Buscar empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <SelectItem value={ALL}>Todas as empresas</SelectItem>
        {filtered.map(c => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-[12px] text-muted-foreground">Nenhuma empresa encontrada.</p>
        )}
      </SelectContent>
    </Select>
  )
}

export function FilterBar({ clients, periods, current, pathname }: FilterBarProps) {
  const router = useRouter()

  function update(key: keyof FilterCurrent, value: string) {
    const next: FilterCurrent = { ...current, [key]: value }
    const params = new URLSearchParams()
    if (next.cliente)   params.set('cliente', next.cliente)
    if (next.regime)    params.set('regime', next.regime)
    if (next.obrigacao) params.set('obrigacao', next.obrigacao)
    if (next.periodo)   params.set('periodo', next.periodo)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-2.5">
      {/* Período */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {periods.map(p => (
          <Button
            key={p.key}
            size="sm"
            variant={current.periodo === p.key ? 'default' : 'ghost'}
            onClick={() => update('periodo', p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Regime */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {REGIMES.map(r => (
          <Button
            key={r.key}
            size="sm"
            variant={current.regime === r.key ? 'default' : 'ghost'}
            onClick={() => update('regime', r.key)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Empresa */}
      <ClienteSelect
        clients={clients}
        value={current.cliente}
        onChange={v => update('cliente', v)}
      />
    </div>
  )
}
