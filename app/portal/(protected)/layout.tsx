import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalHeader } from './_components/portal-header'

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/login')

  // Busca o cliente vinculado ao portal user — RLS já garante portal_enabled = true
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime')
    .eq('portal_user_id', user.id)
    .eq('portal_enabled', true)
    .single()

  // Se não é um portal user (ex: tentou entrar com conta de escritório)
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
