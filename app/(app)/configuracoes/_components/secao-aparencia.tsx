'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { SunMoon } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPCOES = [
  { value: 'light',  label: 'Claro'   },
  { value: 'dark',   label: 'Escuro'  },
  { value: 'system', label: 'Sistema' },
] as const

export function SecaoAparencia() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const temaAtivo = mounted ? theme : undefined

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SunMoon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Aparência</h2>
      </div>

      <div className="flex items-center rounded-full border border-border overflow-hidden">
        {OPCOES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium transition-colors',
              temaAtivo === value
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
