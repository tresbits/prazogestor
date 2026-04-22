'use client'

import { cn } from '@/lib/utils'
import { ModalAtrasados } from './modal-atrasados'
import { ModalProximos } from './modal-proximos'
import { ModalEnviarEmail } from '@/components/clientes/modal-enviar-email'
import { ObligationRow } from '@/components/obligation-row'

type ObligationItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
  value?: number | null
}

type CardClienteProps = {
  clientId: string
  clientName: string
  cnpj: string
  taxRegime: string
  clientEmail?: string | null
  officeTemplate?: string | null
  obligations: ObligationItem[]
  totalPending: number
  overdueObligations: ObligationItem[]
}

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples',
  mei: 'MEI',
  lucro_presumido: 'Presumido',
  lucro_real: 'Lucro Real',
}

function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '—'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function CardCliente({
  clientId, clientName, cnpj, taxRegime, clientEmail, officeTemplate,
  obligations, totalPending, overdueObligations,
}: CardClienteProps) {
  const hasOverdue      = overdueObligations.length > 0
  const previewOverdue  = overdueObligations.slice(0, 1)
  const extrasOverdue   = overdueObligations.length - 1

  const previewSize = hasOverdue ? 1 : 2
  const preview = obligations.slice(0, previewSize)
  const extras  = totalPending - preview.length

  return (
    <div className="bg-card rounded-[16px] shadow-card overflow-hidden flex flex-col">
      {/* Header — tonal */}
      <div className="px-4 py-3 bg-muted/50 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[15px] font-semibold text-foreground leading-tight truncate">
            {clientName}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {formatCNPJ(cnpj)}
          </span>
        </div>
        <span className="text-[10px] bg-background px-2.5 py-1 rounded-full text-foreground font-bold shrink-0">
          {REGIME_LABEL[taxRegime] ?? taxRegime.toUpperCase()}
        </span>
        <ModalEnviarEmail
          clientId={clientId}
          clientName={clientName}
          clientEmail={clientEmail}
          officeTemplate={officeTemplate}
          obligations={[...overdueObligations, ...obligations]}
        />
      </div>

      {/* Conteúdo */}
      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
        {/* Seção VENCIDOS */}
        {hasOverdue && (
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2 [&>div:first-child]:pt-0">
            {previewOverdue.map(o => (
              <ObligationRow
                key={o.id}
                id={o.id} acronym={o.acronym} name={o.name}
                due_date={o.due_date} status={o.status} clientName={clientName}
                value={o.value}
                className="py-3 border-t border-border/40 first:border-t-0"
              />
            ))}
            {extrasOverdue > 0 && (
              <ModalAtrasados
                clientName={clientName}
                clientCnpj={cnpj}
                obligations={overdueObligations}
                extrasCount={extrasOverdue}
              />
            )}
          </div>
        )}

        {/* Lista de próximos */}
        <div className={cn('flex-1 rounded-xl px-3 py-2 [&>div:first-child]:pt-0 [&>div]:border-t-0', hasOverdue && 'mt-3')}>
          {preview.map(o => (
            <ObligationRow
              key={o.id}
              id={o.id} acronym={o.acronym} name={o.name}
              due_date={o.due_date} status={o.status} clientName={clientName}
              value={o.value}
              className="py-3 border-t border-border/40 first:border-t-0"
            />
          ))}
        </div>
      </div>

      {/* Footer — ver mais */}
      {extras > 0 && (
        <div className="px-4 py-3 bg-muted/50 border-t border-border/40 text-center">
          <ModalProximos
            clientName={clientName}
            clientCnpj={cnpj}
            obligations={obligations.slice(previewSize)}
            extrasCount={extras}
          />
        </div>
      )}
    </div>
  )
}
