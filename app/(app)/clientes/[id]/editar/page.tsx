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

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!escritorio) redirect('/onboarding')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome, cnpj, regime, tem_empregados')
    .eq('id', id)
    .eq('escritorio_id', escritorio.id)
    .single()

  if (!cliente) notFound()

  return <EditarClienteForm cliente={cliente} />
}
