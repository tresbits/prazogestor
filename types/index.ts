export type Plano = 'trial' | 'essencial' | 'profissional' | 'agencia' | 'beta'
export type Regime = 'simples' | 'mei' // lucro_presumido e lucro_real: fase 2 (sem seed de obrigações no DB)
export type Frequencia = 'mensal' | 'trimestral' | 'anual'
export type RegraAjuste = 'prorroga' | 'antecipa'
export type StatusObrigacao = 'pendente' | 'concluido' | 'atrasado'
export type TipoAlerta = '7d' | '3d' | '1d'
export type TipoFeriado = 'nacional' | 'estadual' | 'municipal'

export interface Escritorio {
  id: string
  user_id: string
  nome: string
  estado: string
  plano: Plano
  created_at: string
}

export interface Cliente {
  id: string
  escritorio_id: string
  cnpj: string
  nome: string
  regime: Regime
  tem_empregados: boolean
  created_at: string
}

export interface ObrigacaoTemplate {
  id: string
  nome: string
  sigla: string
  regimes: Regime[]
  frequencia: Frequencia
  requer_empregados: boolean
  dia_vencimento: number | null
  mes_vencimento: number | null
  regra_ajuste: RegraAjuste
  dependencia: string | null
  created_at: string
}

export interface ObrigacaoCliente {
  id: string
  cliente_id: string
  template_id: string
  data_vencimento: string // ISO date: YYYY-MM-DD
  status: StatusObrigacao
  concluido_por: string | null
  concluido_em: string | null
  nota: string | null
  created_at: string
  // joins opcionais
  obrigacoes_template?: ObrigacaoTemplate
  clientes?: Cliente
}

export interface AlertaLog {
  id: string
  obrigacao_id: string
  tipo: TipoAlerta
  enviado_em: string
}

export interface Feriado {
  id: string
  data: string // ISO date: YYYY-MM-DD
  descricao: string
  tipo: TipoFeriado
  estado: string | null
  municipio_ibge: string | null
}
