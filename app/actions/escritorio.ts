'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function criarEscritorio(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const nome = (formData.get('nome') as string).trim()
  const estado = formData.get('estado') as string

  if (!nome || !estado) {
    return { error: 'Preencha todos os campos.' }
  }

  const { error } = await supabase.from('escritorios').insert({
    user_id: user.id,
    nome,
    estado,
    plano: 'trial',
  })

  if (error) {
    if (error.code === '23505') return { error: 'Este escritório já está cadastrado.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  redirect('/painel')
}
