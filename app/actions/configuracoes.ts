'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function atualizarEscritorio(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nome = (formData.get('nome') as string).trim()
  const estado = formData.get('estado') as string

  if (!nome || !estado) return { error: 'Preencha todos os campos.' }

  const { error } = await supabase
    .from('escritorios')
    .update({ nome, estado })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function toggleAlertasEmail(ativo: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('escritorios')
    .update({ alertas_email_ativo: ativo })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar preferência.' }
  return { success: true }
}

export async function enviarResetSenha() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback?next=/configuracoes`,
  })

  if (error) return { error: 'Erro ao enviar e-mail. Tente novamente.' }
  return { success: true }
}

export async function dispensarChecklist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('escritorios')
    .update({ onboarding_dispensado: true })
    .eq('user_id', user.id)

  revalidatePath('/painel')
}

export async function excluirConta() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Exclui o escritório (cascade remove clientes e obrigações via FK)
  await supabase.from('escritorios').delete().eq('user_id', user.id)
  await supabase.auth.signOut()
  redirect('/login')
}
