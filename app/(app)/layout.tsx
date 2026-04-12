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

  const { data: office } = await supabase
    .from('offices')
    .select('name, state, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!office) redirect('/onboarding/escritorio')
  if (!office.onboarding_completed) redirect('/onboarding/cliente')

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        officeName={office?.name ?? ''}
        officeState={office?.state ?? ''}
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
