'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function PortalHeader({
  clientName,
  userEmail,
}: {
  clientName: string
  userEmail: string
}) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + empresa */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <span className="text-background text-[11px] font-bold tracking-tight">P</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground leading-none">PrazoGestor</p>
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              {clientName}
            </p>
          </div>
        </div>

        {/* User + sair */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-[11px] text-muted-foreground truncate max-w-[160px]">
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
