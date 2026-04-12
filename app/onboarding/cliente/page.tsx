import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClienteForm } from '@/components/onboarding/cliente-form'

export default async function OnboardingClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('offices')
    .select('id, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')
  if (escritorio.onboarding_completed) redirect('/painel')

  return <ClienteForm />
}
