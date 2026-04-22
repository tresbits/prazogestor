import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createServiceClient } from '@/lib/supabase/service'
import { AlertaDigest, type ObrigacaoDigest } from '@/emails/alerta-digest'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Busca todos os alertas não enviados com dados completos
  const { data: alerts, error } = await supabase
    .from('alert_logs')
    .select(`
      id,
      type,
      obligation_id,
      client_obligations (
        due_date,
        obligation_templates ( acronym, name ),
        clients (
          name,
          offices ( id, name, email_alerts_enabled, user_id )
        )
      )
    `)
    .is('email_sent_at', null)

  if (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
  }

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, offices: 0 })
  }

  // Agrupa por escritório
  type GroupedAlert = {
    officeId: string
    officeName: string
    userId: string
    emailAlertsEnabled: boolean
    items: Array<{ logId: string } & ObrigacaoDigest>
  }

  const byOffice = new Map<string, GroupedAlert>()

  for (const alert of alerts) {
    const ob = Array.isArray(alert.client_obligations)
      ? alert.client_obligations[0]
      : alert.client_obligations
    const template = ob && (Array.isArray(ob.obligation_templates)
      ? ob.obligation_templates[0]
      : ob.obligation_templates)
    const client = ob && (Array.isArray(ob.clients)
      ? ob.clients[0]
      : ob.clients)
    const office = client && (Array.isArray(client.offices)
      ? client.offices[0]
      : client.offices)

    if (!ob || !template || !client || !office) continue

    if (!byOffice.has(office.id)) {
      byOffice.set(office.id, {
        officeId: office.id,
        officeName: office.name,
        userId: office.user_id,
        emailAlertsEnabled: office.email_alerts_enabled,
        items: [],
      })
    }

    byOffice.get(office.id)!.items.push({
      logId: alert.id,
      tipo: alert.type as '7d' | '3d' | '1d',
      acronym: template.acronym,
      name: template.name,
      clientName: client.name,
      dueDate: formatDate(ob.due_date),
    })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prazogestor.tresbits.com'

  let totalSent = 0
  let totalOffices = 0

  for (const group of byOffice.values()) {
    if (!group.emailAlertsEnabled) continue

    // Busca e-mail do usuário
    const { data: authUser } = await supabase.auth.admin.getUserById(group.userId)
    const email = authUser?.user?.email
    if (!email) continue

    const total = group.items.length
    const hasUrgent = group.items.some(i => i.tipo === '1d')

    const subject = total === 1
      ? `⚠ ${group.items[0].acronym} · ${group.items[0].clientName} vence ${group.items[0].tipo === '1d' ? 'amanhã' : `em ${group.items[0].tipo === '3d' ? '3' : '7'} dias`}`
      : `⚠ ${total} vencimentos ${hasUrgent ? 'urgentes' : 'próximos'} · PrazoGestor`

    const html = await render(
      AlertaDigest({
        officeName: group.officeName,
        obligations: group.items,
        urlPainel: `${siteUrl}/overview`,
        urlDescadastrar: `${siteUrl}/api/alertas/descadastrar?id=${group.officeId}`,
      })
    )

    const { error: resendError } = await resend.emails.send({
      from: 'PrazoGestor <alertas@prazogestor.tresbits.com>',
      to: email,
      subject,
      html,
    })

    if (resendError) {
      console.error(`Resend error para escritório ${group.officeId}:`, resendError)
      continue
    }

    // Marca todas as linhas do escritório como enviadas
    const logIds = group.items.map(i => i.logId)
    await supabase
      .from('alert_logs')
      .update({ email_sent_at: new Date().toISOString() })
      .in('id', logIds)

    totalSent += total
    totalOffices++
  }

  return NextResponse.json({
    ok: true,
    sent: totalSent,
    offices: totalOffices,
  })
}
