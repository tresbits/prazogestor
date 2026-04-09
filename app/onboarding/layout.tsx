import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="text-center mb-6">
        <p className="font-bold text-gray-900 text-lg">PrazoGestor</p>
        <p className="text-xs text-gray-400">Vamos configurar sua conta</p>
      </div>
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  )
}
