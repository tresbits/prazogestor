'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Sun className="h-[15px] w-[15px] dark:hidden" />
      <Moon className="h-[15px] w-[15px] hidden dark:block" />
      <span className="dark:hidden">Modo escuro</span>
      <span className="hidden dark:block">Modo claro</span>
    </button>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="px-5 py-6">
        <p className="font-heading font-medium text-[15px] text-foreground">PrazoGestor</p>
        <p className="text-xs text-muted-foreground mt-0.5">by Tresbits</p>
      </div>

      <div className="h-px bg-border mx-0" />

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

      <div className="p-3 space-y-0.5">
        <ThemeToggle />
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
