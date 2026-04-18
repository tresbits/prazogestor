import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { AuthShell } from '@/app/(auth)/_components/auth-shell'
import { LoginForm } from './_components/login-form'

export const dynamic = 'force-dynamic'

export default async function PortalLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const service = createServiceClient()
    const { data: client } = await service
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
