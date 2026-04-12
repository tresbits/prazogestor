import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')

  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('office_id', escritorio.id)

  if (!count || count === 0) redirect('/onboarding/cliente')

  redirect('/painel')
}
