'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, List, Check, Clock, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { concluirObrigacoes, adiarObrigacoes } from '@/app/actions/obrigacoes'
import { ObligationRow, RowCheckbox } from '@/components/obligation-row'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ObItem = {
  id: string
  due_date: string
  status: string
  value: number | null
  acronym: string
  name: string
  clientId: string
  clientName: string
  clientCnpj: string
  taxRegime: string
  dias: number
}

export interface ProximosFilters {
  cliente: string
  regime: string
  periodo: string
}

interface ProximosViewProps {
  items: ObItem[]
  clients: { id: string; name: string }[]
  periods: { key: string; label: string }[]
  current: ProximosFilters
}

type ClientGroup = {
  clientId: string
  clientName: string
  clientCnpj: string
  items: ObItem[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

const REGIME_OPTIONS = [
  { key: '',                label: 'Todos os regimes' },
  { key: 'simples',         label: 'Simples Nacional' },
  { key: 'mei',             label: 'MEI' },
  { key: 'lucro_presumido', label: 'Lucro Presumido' },
  { key: 'lucro_real',      label: 'Lucro Real' },
]

const REGIME_SENTINEL = 'todos'

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

// ─── Toolbar sub-components ───────────────────────────────────────────────────

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
      value={value || 'todos'}
      onValueChange={v => { setSearch(''); onChange(v === 'todos' ? '' : (v ?? '')) }}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
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
        <SelectItem value="todos">Todas as empresas</SelectItem>
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

// ─── Grid sub-components ──────────────────────────────────────────────────────

function GroupCard({ group, selected, toggle, toggleGroup }: {
  group: ClientGroup
  selected: Set<string>
  toggle: (id: string) => void
  toggleGroup: (ids: string[]) => void
}) {
  const ids = group.items.map(i => i.id)
  const checkedCount = ids.filter(id => selected.has(id)).length
  const allChecked   = checkedCount === ids.length
  const someChecked  = checkedCount > 0 && !allChecked

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border/40 cursor-pointer"
        onClick={() => toggleGroup(ids)}
      >
        <RowCheckbox checked={allChecked} indeterminate={someChecked} onChange={() => toggleGroup(ids)} />
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-foreground">{group.clientName}</span>
          <span className="ml-2 text-[10px] font-mono text-muted-foreground/60">
            {formatCNPJ(group.clientCnpj)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {group.items.map(item => (
          <ObligationRow
            key={item.id}
            id={item.id} acronym={item.acronym} name={item.name}
            due_date={item.due_date} status={item.status} clientName={item.clientName}
            value={item.value}
            selected={selected.has(item.id)} onToggle={() => toggle(item.id)}
            className="px-4 py-2.5"
          />
        ))}
      </div>
    </div>
  )
}

function FloatingBar({ count, isPending, onConcluir, onAdiar, onClear }: {
  count: number
  isPending: boolean
  onConcluir: () => void
  onAdiar: () => void
  onClear: () => void
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg">
      <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_32px_0_rgb(0,0,0,0.12)] px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-foreground shrink-0">
          {count} selecionada{count !== 1 ? 's' : ''}
        </span>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Button size="sm" variant="default" onClick={onConcluir} disabled={isPending}>
            <Check /> Confirmar pagamento
          </Button>
          <Button size="sm" variant="outline" onClick={onAdiar} disabled={isPending}>
            <Clock /> Adiar 7 dias
          </Button>
        </div>
        <Button size="icon-sm" variant="ghost" onClick={onClear} disabled={isPending}>
          <X />
        </Button>
      </div>
    </div>
  )
}

function ListPagination({ page, totalPages, onPage }: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onPage(page - 1)} disabled={page <= 1}>
        <ChevronLeft />
      </Button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e-${i}`} className="flex h-7 w-7 items-center justify-center text-[12px] text-muted-foreground">…</span>
          : <Button key={p} size="icon-sm" variant={p === page ? 'default' : 'ghost'} onClick={() => onPage(p)}>{p}</Button>
      )}
      <Button variant="ghost" size="icon-sm" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
        <ChevronRight />
      </Button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProximosView({ items, clients, periods, current }: ProximosViewProps) {
  const [selected, setSelected]           = useState<Set<string>>(new Set())
  const [groupBy, setGroupBy]             = useState<'empresa' | 'lista'>('empresa')
  const [page, setPage]                   = useState(1)
  const [isPending, startTransition]      = useTransition()
  const router = useRouter()

  // ── Filter updates (URL) ──────────────────────────────────────────────────
  function updateFilter(key: keyof ProximosFilters, value: string) {
    const next = { ...current, [key]: value }
    const params = new URLSearchParams()
    if (next.cliente) params.set('cliente', next.cliente)
    if (next.regime)  params.set('regime',  next.regime)
    if (next.periodo) params.set('periodo', next.periodo)
    router.replace(`/overview/proximos?${params.toString()}`)
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleGroup(ids: string[]) {
    setSelected(prev => {
      const allSel = ids.every(id => prev.has(id))
      const n = new Set(prev)
      allSel ? ids.forEach(id => n.delete(id)) : ids.forEach(id => n.add(id))
      return n
    })
  }

  // ── Actions ────────────────────────────────────────────────────────────────
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

  // ── Grouping ───────────────────────────────────────────────────────────────
  const groups: ClientGroup[] = []
  const seen = new Map<string, ClientGroup>()
  for (const item of items) {
    let g = seen.get(item.clientId)
    if (!g) {
      g = { clientId: item.clientId, clientName: item.clientName, clientCnpj: item.clientCnpj, items: [] }
      seen.set(item.clientId, g)
      groups.push(g)
    }
    g.items.push(item)
  }

  // ── Lista pagination ───────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const listaItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ── Derived labels for selects ─────────────────────────────────────────────
  const periodoLabel = periods.find(p => p.key === current.periodo)?.label ?? 'Período'
  const regimeLabel  = REGIME_OPTIONS.find(r => r.key === current.regime)?.label ?? 'Regime'

  return (
    <div className="space-y-4">

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-20 z-20">
        <div className="bg-card rounded-2xl shadow-card px-3 py-2.5 flex items-center gap-2 flex-wrap">

          {/* View toggle */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={groupBy === 'empresa' ? 'default' : 'ghost'}
              onClick={() => setGroupBy('empresa')}
            >
              <Building2 /> Por empresa
            </Button>
            <Button
              size="sm"
              variant={groupBy === 'lista' ? 'default' : 'ghost'}
              onClick={() => { setGroupBy('lista'); setPage(1) }}
            >
              <List /> Lista
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border shrink-0 mx-0.5" />

          {/* Período */}
          <Select value={current.periodo} onValueChange={v => v && updateFilter('periodo', v)}>
            <SelectTrigger size="sm" className="w-auto min-w-[120px]">
              <SelectValue>{periodoLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Regime */}
          <Select
            value={current.regime || REGIME_SENTINEL}
            onValueChange={v => v && updateFilter('regime', v === REGIME_SENTINEL ? '' : v)}
          >
            <SelectTrigger size="sm" className="w-auto min-w-[100px]">
              <SelectValue>{regimeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REGIME_OPTIONS.map(r => (
                <SelectItem key={r.key || REGIME_SENTINEL} value={r.key || REGIME_SENTINEL}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Empresa */}
          <ClienteSelect
            clients={clients}
            value={current.cliente}
            onChange={v => updateFilter('cliente', v)}
          />
        </div>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <p className="py-16 text-sm text-center text-muted-foreground">
          Nenhuma obrigação para os filtros selecionados.
        </p>
      )}

      {/* ── Grid ── */}
      {items.length > 0 && groupBy === 'empresa' && (
        <div className="space-y-3">
          {groups.map(group => (
            <GroupCard
              key={group.clientId}
              group={group}
              selected={selected}
              toggle={toggle}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>
      )}

      {items.length > 0 && groupBy === 'lista' && (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border/40">
          {listaItems.map(item => (
            <ObligationRow
              key={item.id}
              id={item.id} acronym={item.acronym} name={item.name}
              due_date={item.due_date} status={item.status} clientName={item.clientName}
              value={item.value} clientCnpj={item.clientCnpj} showClientName
              selected={selected.has(item.id)} onToggle={() => toggle(item.id)}
              className="px-4 py-2.5"
            />
          ))}
        </div>
      )}

      {/* ── Pagination (lista only) ── */}
      {groupBy === 'lista' && (
        <ListPagination
          page={safePage}
          totalPages={totalPages}
          onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />
      )}

      {/* ── Floating action bar ── */}
      {selected.size > 0 && (
        <FloatingBar
          count={selected.size}
          isPending={isPending}
          onConcluir={handleConcluir}
          onAdiar={handleAdiar}
          onClear={() => setSelected(new Set())}
        />
      )}
    </div>
  )
}
