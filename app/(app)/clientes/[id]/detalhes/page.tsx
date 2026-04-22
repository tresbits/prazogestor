import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrazosCliente } from './_components/prazos-cliente'

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

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

export type PrazosOb = {
  id: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  completed_at: string | null
  value: number | null
  acronym: string
  name: string
}

export default async function PrazosClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string }>
}) {
  const { id } = await params
  const { mes } = await searchParams

  let year: number
  let month: number

  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [y, m] = mes.split('-').map(Number)
    year = y
    month = m
  } else {
    const today = new Date()
    year = today.getFullYear()
    month = today.getMonth() + 1
  }

  const monthLabel = `${MESES_PT[month - 1]} ${year}`

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id, client_email_template')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, cnpj, tax_regime, has_employees, email, portal_enabled, portal_invite_sent_at, contact_name, contact_phone, contact_email_is_contact, has_address, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zip')
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

  // Build daysMap for the selected month
  const daysMap: Record<string, PrazosOb[]> = {}
  for (const o of obrigacoes) {
    const [oYear, oMonth] = o.due_date.split('-').map(Number)
    if (oYear === year && oMonth === month) {
      if (!daysMap[o.due_date]) daysMap[o.due_date] = []
      daysMap[o.due_date].push({
        id: o.id,
        due_date: o.due_date,
        status: o.status,
        completed_at: o.completed_at,
        value: o.value,
        acronym: o.acronym,
        name: o.name,
      })
    }
  }

  const atrasados      = obrigacoes.filter(o => o.status !== 'completed' && (o.status === 'overdue' || o.dias < 0)).length
  const proximaSemana  = obrigacoes.filter(o => o.status === 'pending' && o.dias >= 0 && o.dias <= 7).length
  const pendentes      = obrigacoes.filter(o => o.status === 'pending' && o.dias > 7).length
  const concluidos     = obrigacoes.filter(o => o.status === 'completed').length

  const obligationsForEmail = obrigacoes.filter(o => o.status !== 'completed')

  return (
    <PrazosCliente
      client={client}
      daysMap={daysMap}
      year={year}
      month={month}
      monthLabel={monthLabel}
      atrasados={atrasados}
      proximaSemana={proximaSemana}
      pendentes={pendentes}
      concluidos={concluidos}
      officeTemplate={office.client_email_template ?? null}
      allObligations={obligationsForEmail}
    />
  )
}
