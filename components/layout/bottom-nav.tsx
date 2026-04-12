'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/painel',        label: 'Painel',      icon: LayoutDashboard },
  { href: '/clientes',      label: 'Clientes',    icon: Users },
  { href: '/calendario',    label: 'Calendário',  icon: CalendarDays },
  { href: '/configuracoes', label: 'Config',      icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden bg-sidebar/95 backdrop-blur-xl border-t border-border safe-area-pb">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', active ? 'stroke-[2.5]' : 'stroke-2')} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
