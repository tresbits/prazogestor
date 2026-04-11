import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createServiceClient } from '@/lib/supabase/service'
import { AlertaVencimento } from '@/emails/alerta-vencimento'

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export async function POST(request: Request) {
  // Verificar secret do webhook
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  // Supabase Database Webhook envia { type, table, record, old_record }
  if (payload.type !== 'INSERT' || payload.table !== 'alertas_log') {
    return NextResponse.json({ ok: true })
  }

  const alerta = payload.record as {
    id: string
    obrigacao_id: string
    tipo: '7d' | '3d' | '1d'
  }

  const supabase = createServiceClient()

  // Busca dados completos da obrigação → cliente → escritório
  const { data: obrigacao } = await supabase
    .from('obrigacoes_cliente')
    .select(`
      data_vencimento,
      obrigacoes_template ( sigla, nome ),
      clientes (
        nome, cnpj,
        escritorios ( id, nome, alertas_email_ativo, user_id )
      )
    `)
    .eq('id', alerta.obrigacao_id)
    .single()

  if (!obrigacao) {
    return NextResponse.json({ error: 'Obrigação não encontrada' }, { status: 404 })
  }

  const template = Array.isArray(obrigacao.obrigacoes_template)
    ? obrigacao.obrigacoes_template[0]
    : obrigacao.obrigacoes_template

  const cliente = Array.isArray(obrigacao.clientes)
    ? obrigacao.clientes[0]
    : obrigacao.clientes

  const escritorio = Array.isArray(cliente?.escritorios)
    ? cliente?.escritorios[0]
    : cliente?.escritorios

  if (!template || !cliente || !escritorio) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 422 })
  }

  // Verificar preferência de alertas por e-mail
  if (!escritorio.alertas_email_ativo) {
    return NextResponse.json({ ok: true, motivo: 'alertas desativados' })
  }

  // Buscar e-mail do usuário via auth.users (requer service role)
  const { data: authUser } = await supabase.auth.admin.getUserById(escritorio.user_id)
  const email = authUser?.user?.email

  if (!email) {
    return NextResponse.json({ error: 'E-mail não encontrado' }, { status: 422 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prazogestor.tresbits.com'

  const html = await render(
    AlertaVencimento({
      escritorioNome: escritorio.nome,
      clienteNome: cliente.nome,
      clienteCnpj: cliente.cnpj,
      obrigacaoSigla: template.sigla,
      obrigacaoNome: template.nome,
      dataVencimento: formatarData(obrigacao.data_vencimento),
      tipoAlerta: alerta.tipo,
      urlPainel: `${siteUrl}/painel`,
      urlDescadastrar: `${siteUrl}/api/alertas/descadastrar?id=${escritorio.id}`,
    })
  )

  const { error: resendError } = await resend.emails.send({
    from: 'PrazoGestor <alertas@prazogestor.tresbits.com>',
    to: email,
    subject: `⚠ ${template.sigla} · ${cliente.nome} vence em ${formatarData(obrigacao.data_vencimento)}`,
    html,
  })

  if (resendError) {
    console.error('Resend error:', resendError)
    return NextResponse.json({ error: 'Falha no envio' }, { status: 500 })
  }

  // Marcar como enviado
  await supabase
    .from('alertas_log')
    .update({ email_enviado_em: new Date().toISOString() })
    .eq('id', alerta.id)

  return NextResponse.json({ ok: true })
}
