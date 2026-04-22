'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { PortalInvite } from '@/emails/portal-invite'

export async function inviteToPortal(clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!office) return { error: 'Escritório não encontrado.' }

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, portal_enabled')
    .eq('id', clientId)
    .eq('office_id', office.id)
    .single()

  if (!client) return { error: 'Cliente não encontrado.' }
  if (!client.email) return { error: 'Este cliente não tem e-mail cadastrado. Adicione o e-mail antes de convidar.' }
  if (client.portal_enabled) return { error: 'Este cliente já tem acesso ao portal.' }

  const token = crypto.randomUUID()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prazogestor.tresbits.com'
  const inviteUrl = `${siteUrl}/portal/aceitar-convite?token=${token}`

  const { error: updateError } = await supabase
    .from('clients')
    .update({
      portal_invite_token: token,
      portal_invite_sent_at: new Date().toISOString(),
    })
    .eq('id', clientId)

  if (updateError) return { error: 'Erro ao gerar o convite. Tente novamente.' }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const html = await render(
    PortalInvite({ officeName: office.name, clientName: client.name, inviteUrl })
  )

  const { error: emailError } = await resend.emails.send({
    from: `${office.name} via PrazoGestor <avisos@prazogestor.tresbits.com>`,
    to: client.email,
    subject: `Convite para o portal — ${office.name}`,
    html,
  })

  if (emailError) {
    console.error('Resend error (portal invite):', emailError)
    await supabase
      .from('clients')
      .update({ portal_invite_token: null, portal_invite_sent_at: null })
      .eq('id', clientId)
    return { error: 'Erro ao enviar o e-mail. Tente novamente.' }
  }

  revalidatePath(`/clientes/${clientId}/detalhes`)
  return { success: true }
}

export async function portalLogin(_: unknown, formData: FormData) {
  const email    = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Preencha o e-mail e a senha.' }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) return { error: 'E-mail ou senha incorretos.' }

  // Verifica que a conta é de um portal user — evita que contadores entrem aqui
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Erro ao autenticar. Tente novamente.' }

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('portal_user_id', user.id)
    .eq('portal_enabled', true)
    .single()

  if (!client) {
    await supabase.auth.signOut()
    return { error: 'Conta não encontrada no portal. Use o link de convite enviado pelo seu escritório.' }
  }

  redirect('/portal')
}

export async function acceptPortalInvite(_: unknown, formData: FormData) {
  const token    = (formData.get('token') as string).trim()
  const password = (formData.get('password') as string)

  if (!token)    return { error: 'Token inválido.' }
  if (!password || password.length < 6) return { error: 'A senha precisa ter no mínimo 6 caracteres.' }

  // Busca o cliente pelo token usando service role (sem RLS)
  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select('id, name, email, portal_enabled, portal_invite_sent_at')
    .eq('portal_invite_token', token)
    .single()

  if (!client) return { error: 'Convite inválido ou já utilizado.' }
  if (client.portal_enabled) return { error: 'Este convite já foi aceito. Acesse o portal pelo link de login.' }

  // Valida expiração — 7 dias
  if (client.portal_invite_sent_at) {
    const sent = new Date(client.portal_invite_sent_at)
    const expired = (Date.now() - sent.getTime()) > 7 * 24 * 60 * 60 * 1000
    if (expired) return { error: 'Este convite expirou. Solicite um novo convite ao seu escritório.' }
  }

  if (!client.email) return { error: 'Configuração inválida: cliente sem e-mail.' }

  // Cria o usuário via admin (service role)
  const { data: authData, error: createError } = await service.auth.admin.createUser({
    email: client.email,
    password,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message?.toLowerCase().includes('already registered')) {
      return { error: 'Este e-mail já tem uma conta. Acesse o portal pelo link de login.' }
    }
    console.error('Error creating portal user:', createError)
    return { error: 'Erro ao criar a conta. Tente novamente.' }
  }

  const portalUserId = authData.user.id

  // Vincula o usuário ao cliente e ativa o portal
  const { error: updateError } = await service
    .from('clients')
    .update({
      portal_user_id: portalUserId,
      portal_enabled: true,
      portal_invite_token: null,
      portal_invite_sent_at: null,
    })
    .eq('id', client.id)

  if (updateError) {
    console.error('Error activating portal:', updateError)
    // Desfaz criação do usuário para evitar conta órfã
    await service.auth.admin.deleteUser(portalUserId)
    return { error: 'Erro ao ativar o portal. Tente novamente.' }
  }

  // Faz login automático com a conta recém-criada
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: client.email,
    password,
  })

  if (signInError) {
    // Conta criada mas falhou o login — redireciona para o login do portal
    redirect('/portal/login')
  }

  redirect('/portal')
}
