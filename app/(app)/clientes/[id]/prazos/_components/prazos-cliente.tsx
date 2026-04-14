'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Pencil, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalConcluir } from '@/app/(app)/painel/_components/modal-concluir'
import { ModalEditarCliente } from '@/app/(app)/clientes/_components/modal-editar-cliente'
import { ModalEnviarEmail } from '@/components/clientes/modal-enviar-email'
import type { ClientWithEmail } from '@/types'

type Obrigacao = {
  id: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  completed_at: string | null
  completed_by: string | null
  acronym: string
  name: string
  dias: number
}

type GrupoMes = {
  key: string
  label: string
  obrigacoes: Obrigacao[]
}

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function acronymClass(o: Obrigacao): string {
  if (o.status === 'completed') return 'bg-muted text-muted-foreground'
  if (o.status === 'overdue' || o.dias < 0) return 'bg-destructive/10 text-destructive'
  if (o.dias <= 3) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  if (o.dias <= 7) return 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
  return 'bg-muted text-muted-foreground'
}

function UrgencyLabel({ o }: { o: Obrigacao }) {
  if (o.status === 'completed') {
    return (
      <span className="text-[10px] text-muted-foreground">
        {o.completed_at ? formatarData(o.completed_at.split('T')[0]) : 'Concluído'}
      </span>
    )
  }
  if (o.status === 'overdue' || o.dias < 0)
    return <span className="text-[10px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (o.dias === 0)
    return <span className="text-[10px] font-bold text-destructive tracking-wide">HOJE</span>
  if (o.dias <= 3)
    return <span className="text-[10px] font-bold text-amber-500 tracking-wide">EM {o.dias} {o.dias === 1 ? 'DIA' : 'DIAS'}</span>
  if (o.dias <= 7)
    return <span className="text-[10px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {o.dias} DIAS</span>
  return <span className="text-[10px] text-muted-foreground/70">{formatarData(o.due_date)}</span>
}

export function PrazosCliente({
  client,
  grupos,
  atrasados,
  pendentes,
  concluidos,
  officeTemplate,
  allObligations,
}: {
  client: ClientWithEmail
  grupos: GrupoMes[]
  atrasados: number
  pendentes: number
  concluidos: number
  officeTemplate: string | null
  allObligations: Obrigacao[]
}) {
  const [editOpen, setEditOpen] = useState(false)

  const cnpjFormatado = client.cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )

  const obligationsForEmail = allObligations
    .filter(o => o.status !== 'completed')

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Clientes
      </Link>

      {/* Header */}
      <div className="bg-card rounded-[20px] shadow-card overflow-hidden">
        <div className="px-6 py-5 bg-muted/50 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground leading-tight">
              {client.name}
            </h1>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
              {cnpjFormatado}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span className="text-[10px] bg-background px-2.5 py-1 rounded-full text-foreground font-bold">
              {REGIME_LABEL[client.tax_regime] ?? client.tax_regime}
            </span>

            <ModalEnviarEmail
              clientId={client.id}
              clientName={client.name}
              clientEmail={client.email}
              officeTemplate={officeTemplate}
              obligations={obligationsForEmail}
              trigger={
                <button
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Enviar e-mail ao cliente"
                >
                  <Mail className="h-4 w-4" />
                </button>
              }
            />

            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Editar cliente"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-t border-border/40">
          {atrasados > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold">
              {atrasados} atrasado{atrasados !== 1 ? 's' : ''}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px]">
            {pendentes} pendente{pendentes !== 1 ? 's' : ''}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px]">
            {concluidos} concluído{concluidos !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista por mês */}
      {grupos.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Nenhuma obrigação gerada para este cliente.
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map(({ key, label, obrigacoes: obs }) => {
            const temAtrasado = obs.some(o => o.status !== 'completed' && o.dias < 0)

            return (
              <div key={key} className="bg-card rounded-[16px] shadow-card overflow-hidden">
                {/* Header do mês */}
                <div className="px-4 py-3 bg-muted/40 border-b border-border/40 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                    {label}
                  </span>
                  {temAtrasado && (
                    <span className="text-[10px] font-semibold text-destructive">· atrasados</span>
                  )}
                </div>

                {/* Linhas */}
                <div className="px-4 py-1">
                  {obs.map((o, i) => (
                    <div
                      key={o.id}
                      className={cn(
                        'group flex items-center justify-between py-3',
                        i > 0 && 'border-t border-border/40',
                        o.status === 'completed' && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                          acronymClass(o)
                        )}>
                          {o.acronym || '—'}
                        </span>
                        <span className={cn(
                          'text-sm truncate',
                          o.status === 'completed'
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        )}>
                          {o.name}
                        </span>
                      </div>

                      <div className="shrink-0 ml-4 relative flex items-center min-w-[58px] justify-end">
                        {o.status !== 'completed' ? (
                          <>
                            <span className="whitespace-nowrap transition-opacity group-hover:opacity-0">
                              <UrgencyLabel o={o} />
                            </span>
                            <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ModalConcluir
                                obligationId={o.id}
                                obligationName={o.name}
                                clientName={client.name}
                                dueDate={o.due_date}
                              />
                            </div>
                          </>
                        ) : (
                          <UrgencyLabel o={o} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ModalEditarCliente
        client={client}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
