export type Plan = 'trial' | 'essencial' | 'profissional' | 'agencia' | 'beta'
export type TaxRegime = 'simples' | 'mei' // lucro_presumido e lucro_real: fase 2 (sem seed de obrigações no DB)
export type Frequency = 'monthly' | 'quarterly' | 'annual'
export type AdjustmentRule = 'postpone' | 'advance'
export type ObligationStatus = 'pending' | 'completed' | 'overdue'
export type AlertType = '7d' | '3d' | '1d'
export type HolidayType = 'national' | 'state' | 'municipal'

export interface Office {
  id: string
  user_id: string
  name: string
  state: string
  plan: Plan
  created_at: string
}

export interface Client {
  id: string
  office_id: string
  cnpj: string
  name: string
  tax_regime: TaxRegime
  has_employees: boolean
  created_at: string
}

export type ClientWithEmail = Pick<Client, 'id' | 'name' | 'cnpj' | 'tax_regime' | 'has_employees'> & {
  email?: string | null
}

export interface ObligationTemplate {
  id: string
  name: string
  acronym: string
  tax: TaxRegime[]
  frequency: Frequency
  requires_employees: boolean
  due_day: number | null
  due_month: number | null
  adjustment_rule: AdjustmentRule
  dependency: string | null
  created_at: string
}

export interface ClientObligation {
  id: string
  client_id: string
  template_id: string
  due_date: string // ISO date: YYYY-MM-DD
  status: ObligationStatus
  completed_by: string | null
  completed_at: string | null
  note: string | null
  created_at: string
  // joins opcionais
  obligation_templates?: ObligationTemplate
  clients?: Client
}

export interface AlertLog {
  id: string
  obligation_id: string
  type: AlertType
  sent_at: string
}

export interface Holiday {
  id: string
  date: string // ISO date: YYYY-MM-DD
  description: string
  type: HolidayType
  state: string | null
  municipality_ibge: string | null
}
