'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateOffice(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  const state = formData.get('state') as string

  if (!name || !state) return { error: 'Preencha todos os campos.' }

  const { error } = await supabase
    .from('offices')
    .update({ name, state })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function toggleEmailAlerts(enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('offices')
    .update({ email_alerts_enabled: enabled })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar preferência.' }
  return { success: true }
}

export async function sendPasswordReset() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback?next=/configuracoes`,
  })

  if (error) return { error: 'Erro ao enviar e-mail. Tente novamente.' }
  return { success: true }
}

export async function dismissChecklist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('offices')
    .update({ onboarding_dismissed: true })
    .eq('user_id', user.id)

  revalidatePath('/overview')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Exclui o escritório (cascade remove clientes e obrigações via FK)
  await supabase.from('offices').delete().eq('user_id', user.id)
  await supabase.auth.signOut()
  redirect('/login')
}
