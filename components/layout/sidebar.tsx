'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export function Sidebar({
  officeName,
  officeState,
  userEmail,
}: {
  officeName: string
  officeState: string
  userEmail: string
}) {
  const pathname = usePathname()
  const initials = officeName ? getInitials(officeName) : '?'

  return (
    <aside className="w-52 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0">

      {/* Workspace identity */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-[11px] font-bold tracking-wide">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
            {officeName || 'Meu Escritório'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {officeState ? `${officeState} · PrazoGestor` : 'PrazoGestor'}
          </p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-full text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-foreground text-background font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-[15px] w-[15px]" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="h-px bg-border" />

      {/* User footer */}
      <div className="p-3 space-y-0.5">
        <Link
          href="/configuracoes"
          className="flex items-center gap-2.5 px-3 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <div className="shrink-0 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
            {userEmail ? userEmail[0].toUpperCase() : '?'}
          </div>
          <span className="truncate text-[12px]">{userEmail}</span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-[15px] w-[15px]" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
