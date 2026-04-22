'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(_: unknown, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  redirect('/overview')
}

export async function signup(_: unknown, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (password.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado.' }
    }
    if (error.message.includes('password') || error.message.includes('weak')) {
      return { error: 'Senha muito fraca. Use pelo menos 6 caracteres.' }
    }
    if (error.message.includes('valid email') || error.message.includes('invalid')) {
      return { error: 'E-mail inválido.' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  redirect('/confirmar')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback?next=/nova-senha`,
  })

  if (error) {
    return { error: 'Erro ao enviar e-mail. Verifique o endereço e tente novamente.' }
  }

  return { success: true }
}
