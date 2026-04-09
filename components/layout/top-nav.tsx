'use client'

import { Search, Bell } from 'lucide-react'

export function TopNav() {
  return (
    <header
      className="fixed top-4 z-30 flex items-center justify-between px-4 py-2.5
        bg-background/80 dark:bg-[rgba(26,26,26,0.80)]
        backdrop-blur-2xl saturate-200
        border border-white/20 dark:border-white/10
        rounded-full
        shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
      style={{ left: 'calc(13rem + 2rem)', right: '2rem' }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 bg-muted/70 rounded-full px-4 py-1.5 w-72">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          placeholder="Buscar cliente ou imposto…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-[17px] w-[17px]" />
        </button>
        <button className="w-8 h-8 rounded-full bg-foreground text-background text-[11px] font-semibold flex items-center justify-center select-none">
          PG
        </button>
      </div>
    </header>
  )
}
