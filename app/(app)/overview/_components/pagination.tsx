'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  pathname: string
  /** Current search params string (without leading ?) to preserve filters */
  searchParamsStr: string
}

export function Pagination({ page, totalPages, pathname, searchParamsStr }: PaginationProps) {
  const router = useRouter()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParamsStr)
    params.set('page', String(p))
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Page window: first, last, current ±1, with ellipsis
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft />
      </Button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-7 w-7 items-center justify-center text-[12px] text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
