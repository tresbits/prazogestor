'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

export function TopNav() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = searchParams.get('q')

  function handleClick() {
    window.dispatchEvent(new Event('spotlight:open'))
  }

  return (
    <header
      className="fixed top-4 z-30 left-4 right-4 md:left-[15rem] md:right-8 flex items-center px-4 py-2.5
        bg-background/80 dark:bg-[rgba(26,26,26,0.80)]
        backdrop-blur-2xl saturate-200
        border border-white/20 dark:border-white/10
        rounded-full
        shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]
        hover:border-foreground/20 transition-colors"
      role="button"
      aria-label="Abrir busca"
      onClick={handleClick}
    >
      {q ? (
        /* ── Estado com filtro ativo ── */
        <div className="flex items-center gap-2.5 w-full">
          <Search className="h-3.5 w-3.5 text-foreground shrink-0" />
          <span className="text-sm text-foreground flex-1 truncate select-none">{q}</span>
          <Link
            href={pathname}
            onClick={e => e.stopPropagation()}
            className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Limpar filtro"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* ── Estado padrão ── */
        <div className="flex items-center gap-2.5 w-full select-none cursor-pointer">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground flex-1">Buscar cliente…</span>
          <kbd className="hidden sm:flex items-center text-[10px] text-muted-foreground/50 font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
            ⌘K
          </kbd>
        </div>
      )}
    </header>
  )
}
