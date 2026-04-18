import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PortalHeader } from './_components/portal-header'

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/login')

  // Service role — bypass RLS para garantir que funciona independente das policies
  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select('id, name, cnpj, tax_regime')
    .eq('portal_user_id', user.id)
    .eq('portal_enabled', true)
    .single()

  if (!client) redirect('/portal/login')

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader
        clientName={client.name}
        userEmail={user.email ?? ''}
      />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  )
}
