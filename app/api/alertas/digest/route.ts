import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { createServiceClient } from '@/lib/supabase/service'
import { AlertaDigest, type ObrigacaoDigest } from '@/emails/alerta-digest'

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Busca todos os alertas não enviados com dados completos
  const { data: alertas, error } = await supabase
    .from('alertas_log')
    .select(`
      id,
      tipo,
      obrigacao_id,
      obrigacoes_cliente (
        data_vencimento,
        obrigacoes_template ( sigla, nome ),
        clientes (
          nome,
          escritorios ( id, nome, alertas_email_ativo, user_id )
        )
      )
    `)
    .is('email_enviado_em', null)

  if (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
  }

  if (!alertas || alertas.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0, escritorios: 0 })
  }

  // Agrupa por escritório
  type AlertaAgrupado = {
    escritorioId: string
    escritorioNome: string
    userId: string
    alertasEmailAtivo: boolean
    itens: Array<{ logId: string } & ObrigacaoDigest>
  }

  const porEscritorio = new Map<string, AlertaAgrupado>()

  for (const alerta of alertas) {
    const ob = Array.isArray(alerta.obrigacoes_cliente)
      ? alerta.obrigacoes_cliente[0]
      : alerta.obrigacoes_cliente
    const template = ob && (Array.isArray(ob.obrigacoes_template)
      ? ob.obrigacoes_template[0]
      : ob.obrigacoes_template)
    const cliente = ob && (Array.isArray(ob.clientes)
      ? ob.clientes[0]
      : ob.clientes)
    const escritorio = cliente && (Array.isArray(cliente.escritorios)
      ? cliente.escritorios[0]
      : cliente.escritorios)

    if (!ob || !template || !cliente || !escritorio) continue

    if (!porEscritorio.has(escritorio.id)) {
      porEscritorio.set(escritorio.id, {
        escritorioId: escritorio.id,
        escritorioNome: escritorio.nome,
        userId: escritorio.user_id,
        alertasEmailAtivo: escritorio.alertas_email_ativo,
        itens: [],
      })
    }

    porEscritorio.get(escritorio.id)!.itens.push({
      logId: alerta.id,
      tipo: alerta.tipo as '7d' | '3d' | '1d',
      sigla: template.sigla,
      nome: template.nome,
      clienteNome: cliente.nome,
      dataVencimento: formatarData(ob.data_vencimento),
    })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prazogestor.tresbits.com'

  let totalEnviados = 0
  let totalEscritorios = 0

  for (const grupo of porEscritorio.values()) {
    if (!grupo.alertasEmailAtivo) continue

    // Busca e-mail do usuário
    const { data: authUser } = await supabase.auth.admin.getUserById(grupo.userId)
    const email = authUser?.user?.email
    if (!email) continue

    const total = grupo.itens.length
    const temAmanha = grupo.itens.some(i => i.tipo === '1d')

    const subject = total === 1
      ? `⚠ ${grupo.itens[0].sigla} · ${grupo.itens[0].clienteNome} vence ${grupo.itens[0].tipo === '1d' ? 'amanhã' : `em ${grupo.itens[0].tipo === '3d' ? '3' : '7'} dias`}`
      : `⚠ ${total} vencimentos ${temAmanha ? 'urgentes' : 'próximos'} · PrazoGestor`

    const html = await render(
      AlertaDigest({
        escritorioNome: grupo.escritorioNome,
        obrigacoes: grupo.itens,
        urlPainel: `${siteUrl}/painel`,
        urlDescadastrar: `${siteUrl}/api/alertas/descadastrar?id=${grupo.escritorioId}`,
      })
    )

    const { error: resendError } = await resend.emails.send({
      from: 'PrazoGestor <alertas@prazogestor.tresbits.com>',
      to: email,
      subject,
      html,
    })

    if (resendError) {
      console.error(`Resend error para escritório ${grupo.escritorioId}:`, resendError)
      continue
    }

    // Marca todas as linhas do escritório como enviadas
    const logIds = grupo.itens.map(i => i.logId)
    await supabase
      .from('alertas_log')
      .update({ email_enviado_em: new Date().toISOString() })
      .in('id', logIds)

    totalEnviados += total
    totalEscritorios++
  }

  return NextResponse.json({
    ok: true,
    enviados: totalEnviados,
    escritorios: totalEscritorios,
  })
}
