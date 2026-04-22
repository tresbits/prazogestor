'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createOffice(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  const state = formData.get('state') as string

  if (!name || !state) {
    return { error: 'Preencha todos os campos.' }
  }

  const { error } = await supabase.from('offices').insert({
    user_id: user.id,
    name,
    state,
    plan: 'trial',
  })

  if (error) {
    if (error.code === '23505') return { error: 'Este escritório já está cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  redirect('/overview')
}
