import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createServiceClient } from '@/lib/supabase/service'
import { AlertaVencimento } from '@/emails/alerta-vencimento'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export async function POST(request: Request) {
  // Verificar secret do webhook
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  // Supabase Database Webhook envia { type, table, record, old_record }
  if (payload.type !== 'INSERT' || payload.table !== 'alert_logs') {
    return NextResponse.json({ ok: true })
  }

  const alert = payload.record as {
    id: string
    obligation_id: string
    type: '7d' | '3d' | '1d'
  }

  const supabase = createServiceClient()

  // Busca dados completos da obrigação → cliente → escritório
  const { data: obligation } = await supabase
    .from('client_obligations')
    .select(`
      due_date,
      obligation_templates ( acronym, name ),
      clients (
        name, cnpj,
        offices ( id, name, email_alerts_enabled, user_id )
      )
    `)
    .eq('id', alert.obligation_id)
    .single()

  if (!obligation) {
    return NextResponse.json({ error: 'Obrigação não encontrada' }, { status: 404 })
  }

  const template = Array.isArray(obligation.obligation_templates)
    ? obligation.obligation_templates[0]
    : obligation.obligation_templates

  const client = Array.isArray(obligation.clients)
    ? obligation.clients[0]
    : obligation.clients

  const office = Array.isArray(client?.offices)
    ? client?.offices[0]
    : client?.offices

  if (!template || !client || !office) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 422 })
  }

  // Verificar preferência de alertas por e-mail
  if (!office.email_alerts_enabled) {
    return NextResponse.json({ ok: true, motivo: 'alertas desativados' })
  }

  // Buscar e-mail do usuário via auth.users (requer service role)
  const { data: authUser } = await supabase.auth.admin.getUserById(office.user_id)
  const email = authUser?.user?.email

  if (!email) {
    return NextResponse.json({ error: 'E-mail não encontrado' }, { status: 422 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prazogestor.tresbits.com'

  const html = await render(
    AlertaVencimento({
      officeName: office.name,
      clientName: client.name,
      clientCnpj: client.cnpj,
      obligationAcronym: template.acronym,
      obligationName: template.name,
      dueDate: formatDate(obligation.due_date),
      alertType: alert.type,
      urlPainel: `${siteUrl}/painel`,
      urlDescadastrar: `${siteUrl}/api/alertas/descadastrar?id=${office.id}`,
    })
  )

  const { error: resendError } = await resend.emails.send({
    from: 'PrazoGestor <alertas@prazogestor.tresbits.com>',
    to: email,
    subject: `⚠ ${template.acronym} · ${client.name} vence em ${formatDate(obligation.due_date)}`,
    html,
  })

  if (resendError) {
    console.error('Resend error:', resendError)
    return NextResponse.json({ error: 'Falha no envio' }, { status: 500 })
  }

  // Marcar como enviado
  await supabase
    .from('alert_logs')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', alert.id)

  return NextResponse.json({ ok: true })
}
