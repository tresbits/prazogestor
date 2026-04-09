import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardCliente, CardNovoCliente } from './_components/card-cliente'
import { StatsFooter } from './_components/stats-footer'

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

type ObRow = {
  id: string
  data_vencimento: string
  status: string
  obrigacoes_template: { sigla: string; nome: string }[] | { sigla: string; nome: string } | null
  clientes: { id: string; nome: string; cnpj: string; regime: string; escritorio_id: string }[] | { id: string; nome: string; cnpj: string; regime: string; escritorio_id: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

function mapObRow(o: ObRow) {
  const t = unwrap(o.obrigacoes_template)
  const c = unwrap(o.clientes)
  return {
    id: o.id,
    data_vencimento: o.data_vencimento,
    status: o.status,
    sigla: t?.sigla ?? '',
    nome: t?.nome ?? '',
    clienteId: c?.id ?? '',
    clienteNome: c?.nome ?? '',
    clienteCnpj: c?.cnpj ?? '',
    regime: c?.regime ?? '',
  }
}

const OB_SELECT = `
  id, data_vencimento, status,
  obrigacoes_template ( sigla, nome ),
  clientes!inner ( id, nome, cnpj, regime, escritorio_id )
`

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id, nome')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const fim30 = new Date(hoje)
  fim30.setDate(hoje.getDate() + 30)

  // Query 1: obrigações pendentes nos próximos 30 dias
  const { data: obrigacoesRaw } = await supabase
    .from('obrigacoes_cliente')
    .select(OB_SELECT)
    .eq('clientes.escritorio_id', escritorio.id)
    .in('status', ['pendente', 'atrasado'])
    .gte('data_vencimento', toISO(hoje))
    .lte('data_vencimento', toISO(fim30))
    .order('data_vencimento', { ascending: true })
    .limit(300)

  // Query 2: obrigações realmente atrasadas (data passada)
  const { data: atrasadosRaw } = await supabase
    .from('obrigacoes_cliente')
    .select(OB_SELECT)
    .eq('clientes.escritorio_id', escritorio.id)
    .in('status', ['pendente', 'atrasado'])
    .lt('data_vencimento', toISO(hoje))
    .order('data_vencimento', { ascending: true })
    .limit(200)

  // Concluídos hoje
  const { count: concluidosHoje } = await supabase
    .from('obrigacoes_cliente')
    .select(`id, clientes!inner ( escritorio_id )`, { count: 'exact', head: true })
    .eq('clientes.escritorio_id', escritorio.id)
    .eq('status', 'concluido')
    .gte('concluido_em', `${toISO(hoje)}T00:00:00`)

  // Todos os clientes
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, cnpj, regime')
    .eq('escritorio_id', escritorio.id)
    .order('nome')

  // Mapear e filtrar
  const obrigacoes = ((obrigacoesRaw as ObRow[] | null) ?? [])
    .map(mapObRow)
    .filter(o => o.clienteId)

  const atrasados = ((atrasadosRaw as ObRow[] | null) ?? [])
    .map(mapObRow)
    .filter(o => o.clienteId)

  // Agrupar por cliente
  const porCliente = new Map<string, typeof obrigacoes>()
  for (const o of obrigacoes) {
    const lista = porCliente.get(o.clienteId) ?? []
    lista.push(o)
    porCliente.set(o.clienteId, lista)
  }

  const porClienteAtrasado = new Map<string, typeof atrasados>()
  for (const o of atrasados) {
    const lista = porClienteAtrasado.get(o.clienteId) ?? []
    lista.push(o)
    porClienteAtrasado.set(o.clienteId, lista)
  }

  // Stats
  const criticos = atrasados.length +
    obrigacoes.filter(o => getDiasRestantes(o.data_vencimento) === 0).length

  const proximos7dias = obrigacoes.filter(o => {
    const dias = getDiasRestantes(o.data_vencimento)
    return dias > 0 && dias <= 7
  }).length

  // Clientes com obrigações (pendentes próximos 30 dias OU atrasadas)
  const clientesComObs = (clientes ?? [])
    .filter(c => porCliente.has(c.id) || porClienteAtrasado.has(c.id))
    .map(c => {
      const obs      = porCliente.get(c.id) ?? []
      const atrasadas = porClienteAtrasado.get(c.id) ?? []
      const temCritico = atrasadas.length > 0 ||
        obs.some(o => getDiasRestantes(o.data_vencimento) <= 0)
      return { ...c, obs, atrasadas, temCritico }
    })
    .sort((a, b) => {
      if (a.temCritico && !b.temCritico) return -1
      if (!a.temCritico && b.temCritico) return 1
      return a.nome.localeCompare(b.nome)
    })

  const clientesSemObs = (clientes ?? [])
    .filter(c => !porCliente.has(c.id) && !porClienteAtrasado.has(c.id))

  const agora = new Date()
  const horaAtualStr = agora.toLocaleDateString('pt-BR') + ' ' +
    agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none">
            Próximos Vencimentos
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-sm">
            Obrigações fiscais para os próximos 30 dias.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Última Atualização
          </p>
          <p className="text-sm font-mono font-bold text-foreground">{horaAtualStr}</p>
        </div>
      </div>

      {/* Estado vazio — sem clientes */}
      {!(clientes?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardNovoCliente />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clientesComObs.map(c => (
            <CardCliente
              key={c.id}
              clienteId={c.id}
              clienteNome={c.nome}
              cnpj={c.cnpj}
              regime={c.regime}
              obrigacoes={c.obs.map(o => ({
                id: o.id,
                data_vencimento: o.data_vencimento,
                status: o.status,
                sigla: o.sigla,
                nome: o.nome,
              }))}
              totalPendente={c.obs.length}
              obrigacoesAtrasadas={c.atrasadas.map(o => ({
                id: o.id,
                data_vencimento: o.data_vencimento,
                status: o.status,
                sigla: o.sigla,
                nome: o.nome,
              }))}
            />
          ))}

          {/* Clientes sem vencimentos no período */}
          {clientesSemObs.slice(0, 2).map(c => (
            <div key={c.id} className="bg-card rounded-[16px] p-6 opacity-40">
              <h3 className="font-heading text-[15px] font-semibold text-foreground">
                {c.nome}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                {c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Sem vencimentos nos próximos 30 dias
              </p>
            </div>
          ))}

          <CardNovoCliente />
        </div>
      )}

      <StatsFooter
        criticos={criticos}
        proximos7dias={proximos7dias}
        concluidosHoje={concluidosHoje ?? 0}
      />
    </div>
  )
}
