'use client'

import { useState, useTransition } from 'react'
import { Pencil, Mail, UserPlus, Check, Loader2, Phone, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalEditarCliente } from '@/app/(app)/clientes/_components/modal-editar-cliente'
import { ModalEnviarEmail } from '@/components/clientes/modal-enviar-email'
import { inviteToPortal } from '@/app/actions/portal'
import { PageBreadcrumb, PageTitle, MetricPill } from '@/app/(app)/_components/page-header'
import { PrazosCalendarioView } from './prazos-calendario-view'
import type { ClientWithEmail } from '@/types'
import type { PrazosOb } from '../page'

type ObrigacaoEmail = {
  id: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  completed_at: string | null
  completed_by: string | null
  value: number | null
  acronym: string
  name: string
  dias: number
}

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

export function PrazosCliente({
  client,
  daysMap,
  year,
  month,
  monthLabel,
  atrasados,
  proximaSemana,
  pendentes,
  concluidos,
  officeTemplate,
  allObligations,
}: {
  client: ClientWithEmail
  daysMap: Record<string, PrazosOb[]>
  year: number
  month: number
  monthLabel: string
  atrasados: number
  proximaSemana: number
  pendentes: number
  concluidos: number
  officeTemplate: string | null
  allObligations: ObrigacaoEmail[]
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [invitePending, startInviteTransition] = useTransition()
  const [inviteResult, setInviteResult] = useState<{ success?: boolean; error?: string } | null>(null)

  function handleInvite() {
    setInviteResult(null)
    startInviteTransition(async () => {
      const result = await inviteToPortal(client.id)
      setInviteResult(result)
    })
  }

  const inviteSentAt = client.portal_invite_sent_at
    ? new Date(client.portal_invite_sent_at)
    : null
  const inviteSentRecently = inviteSentAt
    ? (Date.now() - inviteSentAt.getTime()) < 7 * 24 * 60 * 60 * 1000
    : false

  const cnpjFormatado = client.cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )

  const obligationsForEmail = allObligations.filter(o => o.status !== 'completed')

  // ── Portal action state ──────────────────────────────────────────────────────
  function PortalAction() {
    if (client.portal_enabled) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
          <Check className="h-3 w-3" />
          Portal ativo
        </span>
      )
    }

    if (!client.email) {
      return (
        <button
          disabled
          title="Adicione um e-mail ao cadastro do cliente para habilitar o convite"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Convidar para portal
        </button>
      )
    }

    if ((inviteResult?.success || inviteSentRecently) && !inviteResult?.error) {
      return (
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          Convite enviado
          <button
            onClick={handleInvite}
            disabled={invitePending}
            className="underline underline-offset-2 hover:text-foreground transition-colors disabled:opacity-40"
          >
            {invitePending ? 'Reenviando…' : 'Reenviar'}
          </button>
        </span>
      )
    }

    return (
      <button
        onClick={handleInvite}
        disabled={invitePending}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium',
          'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
          'transition-colors disabled:opacity-40'
        )}
      >
        {invitePending
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <UserPlus className="h-3.5 w-3.5" />
        }
        {invitePending ? 'Enviando…' : 'Convidar para portal'}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb parent={{ label: 'Clientes', href: '/clientes' }} current="Detalhes" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <PageTitle>{client.name}</PageTitle>
            <div className="flex flex-wrap gap-2 uppercase">
              <MetricPill variant="subtle">{cnpjFormatado}</MetricPill>
              <MetricPill variant="subtle">{REGIME_LABEL[client.tax_regime] ?? client.tax_regime}</MetricPill>
              <MetricPill variant="subtle">{client.has_employees ? 'Com funcionários' : 'Sem funcionários'}</MetricPill>
            </div>
          </div>
          <div className="flex items-start gap-1 shrink-0 mt-1">
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
            <div className="w-px h-4 bg-border/60 mx-1 mt-1.5" />
            <PortalAction />
          </div>
        </div>
        {inviteResult?.error && (
          <p className="text-[11px] text-destructive mt-1">{inviteResult.error}</p>
        )}

        {/* Contact + Address card */}
        {(() => {
          const hasContact = !!(client.contact_name || client.contact_phone || client.email)
          const hasAddress = !!(client.has_address && client.address_street)

          const addressLine1 = [
            client.address_street && client.address_number
              ? `${client.address_street}, ${client.address_number}`
              : client.address_street,
            client.address_complement,
          ].filter(Boolean).join(' · ')
          const addressLine3 = [
            client.address_city,
            client.address_state,
            client.address_zip
              ? `${client.address_zip.slice(0, 5)}-${client.address_zip.slice(5)}`
              : null,
          ].filter(Boolean).join(' · ')

          return (
            <div className="bg-glass backdrop-blur-xl border-[0.5px] border-glass rounded-[16px] px-5 py-4">
              <div className="flex flex-col md:flex-row gap-4 md:gap-0">

                <div className={cn('flex flex-col gap-2', 'md:pr-5')}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Contato
                  </p>
                  {hasContact ? (
                    <>
                      {client.contact_name && (
                        <div className="flex items-center gap-2 text-[13px]">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{client.contact_name}</span>
                        </div>
                      )}
                      {client.contact_phone && (
                        <div className="flex items-center gap-2 text-[13px] text-foreground/80">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {client.contact_phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-[13px] text-foreground/80">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {client.email}
                          {client.contact_email_is_contact && (
                            <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                              Contato direto
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Não informado
                    </button>
                  )}
                </div>

                <div className={cn('flex flex-col gap-2', 'md:pl-5 md:border-l border-border/40')}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Endereço
                  </p>
                  {hasAddress ? (
                    <div className="flex items-start gap-2 text-[13px] text-foreground/80">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-px" />
                      <div className="flex flex-col gap-0.5">
                        {addressLine1 && <span>{addressLine1}</span>}
                        {client.address_neighborhood && <span>{client.address_neighborhood}</span>}
                        {addressLine3 && <span>{addressLine3}</span>}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Não informado
                    </button>
                  )}
                </div>

              </div>
            </div>
          )
        })()}

        {/* Status das obrigações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { count: atrasados,     label: 'Atrasadas',   color: atrasados > 0     ? 'border-destructive text-destructive'                       : 'border-border text-muted-foreground' },
            { count: proximaSemana, label: 'Esta semana', color: proximaSemana > 0 ? 'border-amber-500 text-amber-500'                            : 'border-border text-muted-foreground' },
            { count: pendentes,     label: 'Pendentes',   color: pendentes > 0     ? 'border-foreground/30 text-foreground'                       : 'border-border text-muted-foreground' },
            { count: concluidos,    label: 'Concluídas',  color: concluidos > 0    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'   : 'border-border text-muted-foreground' },
          ].map(({ count, label, color }) => (
            <div key={label} className={cn(
              'bg-glass backdrop-blur-xl border-[0.5px] border-glass rounded-[16px] px-4 py-4 flex flex-col items-center gap-1.5 border-t-2',
              color,
              count === 0 && 'opacity-40'
            )}>
              <span className={cn('text-3xl font-mono font-bold leading-none tabular-nums', color.split(' ')[1])}>
                {String(count).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium text-center">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Separador calendário */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/50 translate-y-px" />
          <p className="font-mono text-[14px] uppercase tracking-widest text-foreground/70 font-semibold">
            Calendário de obrigações
          </p>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      <PrazosCalendarioView
        daysMap={daysMap}
        year={year}
        month={month}
        monthLabel={monthLabel}
        clientId={client.id}
        clientName={client.name}
      />

      <ModalEditarCliente
        client={client}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
