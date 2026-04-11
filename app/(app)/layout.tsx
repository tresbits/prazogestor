import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/top-nav'
import { Spotlight } from '@/components/spotlight'
import { SearchBanner } from '@/components/layout/search-banner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('nome, estado, onboarding_concluido')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')
  if (!escritorio.onboarding_concluido) redirect('/onboarding/cliente')

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        escritorioNome={escritorio?.nome ?? ''}
        escritorioEstado={escritorio?.estado ?? ''}
        userEmail={user.email ?? ''}
      />
      <div className="flex-1 min-w-0">
        <Suspense>
          <TopNav />
        </Suspense>
        <Suspense>
          <SearchBanner />
        </Suspense>
        <main className="pt-24 px-8 pb-8">
          {children}
        </main>
      </div>
      <Spotlight />
    </div>
  )
}
