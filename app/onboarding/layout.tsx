import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="text-center mb-8">
        <p className="font-heading font-semibold text-foreground text-[15px]">PrazoGestor</p>
        <p className="text-xs text-muted-foreground mt-0.5">Vamos configurar sua conta</p>
      </div>
      <div className="w-full max-w-xl mx-auto">
        {children}
      </div>
    </div>
  )
}
