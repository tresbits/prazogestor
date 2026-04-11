import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EscritorioForm } from '@/components/onboarding/escritorio-form'

export default async function OnboardingEscritorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (escritorio) redirect('/onboarding/cliente')

  return <EscritorioForm />
}
