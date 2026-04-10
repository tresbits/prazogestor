import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarioControls } from './_components/calendario-controls'

type ObRow = {
  id: string
  data_vencimento: string
  status: string
  obrigacoes_template: { sigla: string; nome: string }[] | { sigla: string; nome: string } | null
  clientes: { id: string; nome: string }[] | { id: string; nome: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

export type ObrigacaoCalendario = {
  id: string
  data_vencimento: string
  status: string
  sigla: string
  nome: string
  clienteId: string
  clienteNome: string
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const OB_SELECT = `id, data_vencimento, status, obrigacoes_template ( sigla, nome ), clientes!inner ( id, nome, escritorio_id )`

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; q?: string }>
}) {
  const params = await searchParams

  let ano: number
  let mes: number

  if (params.mes && /^\d{4}-\d{2}$/.test(params.mes)) {
    const [y, m] = params.mes.split('-').map(Number)
    ano = y
    mes = m
  } else {
    const hoje = new Date()
    ano = hoje.getFullYear()
    mes = hoje.getMonth() + 1
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding')

  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
  const ultimoDiaNum = new Date(ano, mes, 0).getDate()
  const ultimoDia = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaNum).padStart(2, '0')}`

  const { data: rows } = await supabase
    .from('obrigacoes_cliente')
    .select(OB_SELECT)
    .eq('clientes.escritorio_id', escritorio.id)
    .gte('data_vencimento', primeiroDia)
    .lte('data_vencimento', ultimoDia)
    .neq('status', 'concluido')
    .order('data_vencimento', { ascending: true })

  const diasMap: Record<string, ObrigacaoCalendario[]> = {}

  for (const row of (rows ?? []) as ObRow[]) {
    const t = unwrap(row.obrigacoes_template)
    const c = unwrap(row.clientes)
    if (!c) continue
    const item: ObrigacaoCalendario = {
      id: row.id,
      data_vencimento: row.data_vencimento,
      status: row.status,
      sigla: t?.sigla ?? '',
      nome: t?.nome ?? '',
      clienteId: c.id,
      clienteNome: c.nome,
    }
    if (!diasMap[row.data_vencimento]) diasMap[row.data_vencimento] = []
    diasMap[row.data_vencimento].push(item)
  }

  const mesLabel = `${MESES_PT[mes - 1]} ${ano}`

  return (
    <div className="space-y-5">
      <div className='p-2'>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none">Calendário</h1>
        {/* <p className="text-sm text-muted-foreground">{mesLabel}</p> */}
      </div>
      <CalendarioControls diasMap={diasMap} ano={ano} mes={mes} mesLabel={mesLabel} filtro={params.q?.trim()} />
    </div>
  )
}
