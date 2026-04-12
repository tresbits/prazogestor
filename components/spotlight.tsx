'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchClients, type ClientSearch } from '@/app/actions/busca'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples',
  mei: 'MEI',
  lucro_presumido: 'Presumido',
  lucro_real: 'Lucro Real',
}

function getIniciais(nome: string): string {
  return (
    nome.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('') ||
    nome.slice(0, 2).toUpperCase()
  )
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function Spotlight() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ClientSearch[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Abre via evento customizado (TopNav)
  useEffect(() => {
    function handleOpen() { setOpen(true) }
    window.addEventListener('spotlight:open', handleOpen)
    return () => window.removeEventListener('spotlight:open', handleOpen)
  }, [])

  // ⌘K / Ctrl+K global
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Foca o input ao abrir, reseta ao fechar
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Busca debounced
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      setSelectedIndex(0)
      return
    }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await searchClients(query)
        setResults(data)
        setSelectedIndex(0)
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function getDestino(name: string) {
    if (pathname === '/clientes') return `/clientes?q=${encodeURIComponent(name)}`
    if (pathname === '/calendario') {
      const mes = searchParams.get('mes')
      return `/calendario?${mes ? `mes=${mes}&` : ''}q=${encodeURIComponent(name)}`
    }
    return `/painel?q=${encodeURIComponent(name)}`
  }

  function handleSelect(cliente: ClientSearch) {
    setOpen(false)
    router.push(getDestino(cliente.name))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (results[selectedIndex]) handleSelect(results[selectedIndex])
        break
    }
  }

  const queryLen = query.trim().length
  const showHint = queryLen > 0 && queryLen < 3
  const showResults = results.length > 0
  const showEmpty = queryLen >= 3 && !isPending && results.length === 0
  const hasContent = showResults || showEmpty || showHint

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ paddingTop: '18vh' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Container */}
      <div
        className={cn(
          'relative w-full max-w-lg mx-4 h-fit',
          'bg-background/90 backdrop-blur-3xl',
          'border-[0.5px] border-white/20 dark:border-white/10',
          'rounded-[20px]',
          'shadow-[0_32px_80px_rgba(0,0,0,0.40)]',
          'animate-in fade-in-0 zoom-in-95 duration-150'
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className={cn(
          'flex items-center gap-3 px-5 py-4',
          hasContent && 'border-b border-border/40'
        )}>
          {isPending
            ? <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
            : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar cliente…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Resultados */}
        {showResults && (
          <div className="py-1.5 max-h-[320px] overflow-y-auto no-scrollbar">
            {results.map((cliente, i) => (
              <button
                key={cliente.id}
                onClick={() => handleSelect(cliente)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
                  i === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shrink-0 border border-border/40">
                  <span className="text-[10px] font-bold text-foreground">{getIniciais(cliente.name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{cliente.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {formatCNPJ(cliente.cnpj)}
                    <span className="mx-1.5 opacity-40">·</span>
                    {REGIME_LABEL[cliente.tax_regime] ?? cliente.tax_regime}
                  </p>
                </div>
                {i === selectedIndex && (
                  <kbd className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                    ↵
                  </kbd>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Hint mínimo de caracteres */}
        {showHint && (
          <div className="px-5 py-5 text-center">
            <p className="text-sm text-muted-foreground">
              Digite mais {3 - queryLen} {3 - queryLen === 1 ? 'caractere' : 'caracteres'} para buscar.
            </p>
          </div>
        )}

        {/* Estado vazio */}
        {showEmpty && (
          <div className="px-5 py-7 text-center">
            <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        )}

        {/* Footer com hints */}
        <div className={cn(
          'flex items-center justify-between px-5 py-2.5',
          hasContent && 'border-t border-border/40'
        )}>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 select-none">
            <span><kbd className="font-mono">↑↓</kbd> navegar</span>
            <span><kbd className="font-mono">↵</kbd> selecionar</span>
            <span><kbd className="font-mono">esc</kbd> fechar</span>
          </div>
          <span className="text-[10px] text-muted-foreground/50 select-none">
            {pathname === '/clientes' ? 'Filtrar clientes' : pathname === '/calendario' ? 'Filtrar calendário' : 'Ir para painel'}
          </span>
        </div>
      </div>
    </div>
  )
}
