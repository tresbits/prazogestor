'use server'

import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientObligations, type ObligationEmailItem } from '@/emails/client-obligations'

export async function sendClientEmail(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId        = formData.get('client_id') as string
  const recipientEmail  = (formData.get('recipient_email') as string).trim()
  const message         = (formData.get('message') as string).trim()
  const saveEmail       = formData.get('save_email') === 'true'
  const obligationIds   = formData.getAll('obligation_ids') as string[]

  if (!recipientEmail || !message) return { error: 'Preencha o e-mail do destinatário e a mensagem.' }
  if (obligationIds.length === 0)  return { error: 'Selecione ao menos uma obrigação.' }

  // Verifica que o cliente pertence ao escritório deste usuário
  const { data: office } = await supabase
    .from('offices')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!office) return { error: 'Escritório não encontrado.' }

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj')
    .eq('id', clientId)
    .eq('office_id', office.id)
    .single()

  if (!client) return { error: 'Cliente não encontrado.' }

  // Busca as obrigações selecionadas
  const { data: obligations } = await supabase
    .from('client_obligations')
    .select('id, due_date, status, obligation_templates ( acronym, name )')
    .in('id', obligationIds)
    .eq('client_id', clientId)

  if (!obligations || obligations.length === 0) return { error: 'Obrigações não encontradas.' }

  const items: ObligationEmailItem[] = obligations.map(o => {
    const t = Array.isArray(o.obligation_templates) ? o.obligation_templates[0] : o.obligation_templates
    return {
      id: o.id,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      due_date: o.due_date,
      status: o.status,
    }
  })

  // Ordena: vencidos primeiro, depois por data
  items.sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (a.status !== 'overdue' && b.status === 'overdue') return 1
    return a.due_date.localeCompare(b.due_date)
  })

  // Renderiza e envia
  const resend = new Resend(process.env.RESEND_API_KEY)

  const html = await render(
    ClientObligations({
      officeName: office.name,
      clientName: client.name,
      message,
      obligations: items,
    })
  )

  const { error: resendError } = await resend.emails.send({
    from: `${office.name} via PrazoGestor <avisos@prazogestor.tresbits.com>`,
    to: recipientEmail,
    subject: `Obrigações fiscais pendentes — ${client.name}`,
    html,
  })

  if (resendError) {
    console.error('Resend error:', resendError)
    return { error: 'Erro ao enviar o e-mail. Tente novamente.' }
  }

  // Salva email no cadastro do cliente, se solicitado
  if (saveEmail) {
    await supabase
      .from('clients')
      .update({ email: recipientEmail })
      .eq('id', clientId)
      .eq('office_id', office.id)
  }

  // Registra log
  await supabase.from('client_email_log').insert({
    client_id: clientId,
    office_id: office.id,
    sent_to: recipientEmail,
    obligations_count: items.length,
  })

  return { success: true }
}

export async function saveClientEmailTemplate(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const template = (formData.get('client_email_template') as string).trim()

  const { error } = await supabase
    .from('offices')
    .update({ client_email_template: template })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar o template. Tente novamente.' }
  return { success: true }
}
