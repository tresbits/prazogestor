import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrazosCliente } from './_components/prazos-cliente'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getDiasRestantes(dueDate: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dueDate + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

type ObRow = {
  id: string
  due_date: string
  status: string
  completed_by: string | null
  completed_at: string | null
  value: number | null
  obligation_templates: { acronym: string; name: string }[] | { acronym: string; name: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

export default async function PrazosClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id, client_email_template')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  // Busca o cliente verificando ownership via office_id
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime, has_employees, email, portal_enabled, portal_invite_sent_at')
    .eq('id', id)
    .eq('office_id', office.id)
    .single()

  if (!client) notFound()

  const anoAtual = new Date().getFullYear()
  const { data: obrigacoesRaw } = await supabase
    .from('client_obligations')
    .select('id, due_date, status, completed_by, completed_at, value, obligation_templates ( acronym, name )')
    .eq('client_id', id)
    .gte('due_date', `${anoAtual}-01-01`)
    .order('due_date', { ascending: true })
    .limit(500)

  const obrigacoes = ((obrigacoesRaw as ObRow[]) ?? []).map(o => {
    const t = unwrap(o.obligation_templates)
    return {
      id: o.id,
      due_date: o.due_date,
      status: o.status as 'pending' | 'completed' | 'overdue',
      completed_at: o.completed_at,
      completed_by: o.completed_by,
      value: o.value ?? null,
      acronym: t?.acronym ?? '',
      name: t?.name ?? '',
      dias: getDiasRestantes(o.due_date),
    }
  })

  // Agrupa por mês
  const porMes = new Map<string, typeof obrigacoes>()
  for (const o of obrigacoes) {
    const mes = parseInt(o.due_date.split('-')[1])
    const ano = parseInt(o.due_date.split('-')[0])
    const key = `${ano}-${String(mes).padStart(2, '0')}`
    const lista = porMes.get(key) ?? []
    lista.push(o)
    porMes.set(key, lista)
  }

  const grupos = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, obs]) => {
      const [ano, mes] = key.split('-')
      return { key, label: `${MESES[parseInt(mes) - 1]} ${ano}`, obrigacoes: obs }
    })

  const atrasados = obrigacoes.filter(o => o.status !== 'completed' && (o.status === 'overdue' || o.dias < 0)).length
  const pendentes  = obrigacoes.filter(o => o.status === 'pending' && o.dias >= 0).length
  const concluidos = obrigacoes.filter(o => o.status === 'completed').length

  return (
    <PrazosCliente
      client={client}
      grupos={grupos}
      atrasados={atrasados}
      pendentes={pendentes}
      concluidos={concluidos}
      officeTemplate={office.client_email_template ?? null}
      allObligations={obrigacoes}
    />
  )
}
