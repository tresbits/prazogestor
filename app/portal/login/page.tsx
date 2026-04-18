import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/app/(auth)/_components/auth-shell'
import { LoginForm } from './_components/login-form'

export default async function PortalLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('portal_user_id', user.id)
      .eq('portal_enabled', true)
      .single()

    if (client) redirect('/portal')
  }

  return (
    <AuthShell
      panelTitle={<>Portal do<br />Cliente</>}
      panelTagline="Acompanhe suas obrigações fiscais com prazos e valores atualizados pelo seu escritório contábil."
    >
      <LoginForm />
    </AuthShell>
  )
}
