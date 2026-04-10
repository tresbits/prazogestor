'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

const PAGINAS_BUSCA = ['/painel', '/clientes', '/calendario']

export function SearchBanner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = searchParams.get('q')

  if (!q || !PAGINAS_BUSCA.includes(pathname)) return null

  return (
    <div
      className="fixed z-20 flex items-center gap-2 px-3"
      style={{ top: '68px', left: 'calc(13rem + 2rem)', right: '2rem' }}
    >
      <p className="text-[11px] text-muted-foreground">
        Resultados para{' '}
        <span className="font-semibold text-foreground">"{q}"</span>
      </p>
      <Link
        href={pathname}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
      >
        × limpar filtro
      </Link>
    </div>
  )
}
