import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditarClienteForm } from './_form'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!office) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime, has_employees')
    .eq('id', id)
    .eq('office_id', office.id)
    .single()

  if (!client) notFound()

  return <EditarClienteForm client={client} />
}
