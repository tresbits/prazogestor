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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
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
