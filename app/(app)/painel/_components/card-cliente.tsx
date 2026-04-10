'use client'

import { cn } from '@/lib/utils'
import { ModalConcluir } from './modal-concluir'
import { ModalAtrasados } from './modal-atrasados'
import { ModalProximos } from './modal-proximos'

type ObrigacaoItem = {
  id: string
  data_vencimento: string
  status: string
  sigla: string
  nome: string
}

type CardClienteProps = {
  clienteId: string
  clienteNome: string
  cnpj: string
  regime: string
  obrigacoes: ObrigacaoItem[]
  totalPendente: number
  obrigacoesAtrasadas: ObrigacaoItem[]
}

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples',
  mei: 'MEI',
  lucro_presumido: 'Presumido',
  lucro_real: 'Lucro Real',
}

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function formatarCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '—'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function getIniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || nome.slice(0, 2).toUpperCase()
}

function UrgenciaLabel({ dias, status }: { dias: number; status: string }) {
  const isAtrasado = status === 'atrasado' || dias < 0
  const isHoje    = dias === 0
  const isUrgente = !isAtrasado && !isHoje && dias <= 3
  const isProximo = !isAtrasado && !isHoje && !isUrgente && dias <= 7

  if (isAtrasado) return <span className="text-[11px] font-bold text-destructive tracking-wide">VENCIDO</span>
  if (isHoje)     return <span className="text-[11px] font-bold text-destructive tracking-wide">HOJE</span>
  if (isUrgente)  return <span className="text-[11px] font-bold text-amber-500 tracking-wide">EM {dias} {dias === 1 ? 'DIA' : 'DIAS'}</span>
  if (isProximo)  return <span className="text-[11px] font-bold text-yellow-500 dark:text-yellow-400 tracking-wide">EM {dias} DIAS</span>
  return <span className="text-[11px] font-bold text-muted-foreground tracking-wide">EM {dias} DIAS</span>
}

function LinhaObrigacao({
  obrigacao: o,
  clienteNome,
}: {
  obrigacao: ObrigacaoItem
  clienteNome: string
}) {
  const dias = getDiasRestantes(o.data_vencimento)
  const isAtrasado = o.status === 'atrasado' || dias < 0
  const isHoje     = dias === 0
  const isUrgente  = !isAtrasado && !isHoje && dias <= 3
  const isProximo  = !isAtrasado && !isHoje && !isUrgente && dias <= 7

  return (
    <div className="group flex items-center justify-between py-3 border-t border-border/40 first:border-t-0">
      <div className="min-w-0">
        <span className={cn(
          'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide mb-1',
          isAtrasado || isHoje ? 'bg-destructive/10 text-destructive'
            : isUrgente        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : isProximo        ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
            :                    'bg-muted text-muted-foreground'
        )}>
          {o.sigla || '—'}
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{o.nome}</p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
        <UrgenciaLabel dias={dias} status={o.status} />
        <ModalConcluir
          obrigacaoId={o.id}
          nomeObrigacao={o.nome}
          clienteNome={clienteNome}
          dataVencimento={o.data_vencimento}
        />
      </div>
    </div>
  )
}

export function CardCliente({
  clienteId, clienteNome, cnpj, regime, obrigacoes, totalPendente, obrigacoesAtrasadas,
}: CardClienteProps) {
  const temAtrasados   = obrigacoesAtrasadas.length > 0
  const previewAtrasado = obrigacoesAtrasadas.slice(0, 1)
  const extrasAtrasados = obrigacoesAtrasadas.length - 1

  // Opção B: 3 próximos quando há vencidos, 4 quando não há
  const previewSize = temAtrasados ? 3 : 4
  const preview = obrigacoes.slice(0, previewSize)
  const extras  = totalPendente - preview.length

  return (
    <div className="bg-card rounded-[16px] shadow-card p-6 flex flex-col gap-0">
      {/* Header — tonal edge-to-edge + avatar */}
      <div className="-mx-6 -mt-6 px-6 py-4 rounded-t-[16px] bg-muted/50 flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-foreground">{getIniciais(clienteNome)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[15px] font-semibold text-foreground leading-tight truncate">
            {clienteNome}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {formatarCNPJ(cnpj)}
          </span>
        </div>
        <span className="text-[10px] bg-card px-2.5 py-1 rounded-full text-foreground font-bold shrink-0">
          {REGIME_LABEL[regime] ?? regime.toUpperCase()}
        </span>
      </div>

      {/* Seção VENCIDOS — pill container */}
      {temAtrasados && (
        <div className="mt-4 bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2 [&>div:first-child]:pt-0">
          {previewAtrasado.map(o => (
            <LinhaObrigacao key={o.id} obrigacao={o} clienteNome={clienteNome} />
          ))}
          {extrasAtrasados > 0 && (
            <ModalAtrasados
              clienteNome={clienteNome}
              obrigacoes={obrigacoesAtrasadas}
              extrasCount={extrasAtrasados}
            />
          )}
        </div>
      )}

      {/* Lista de próximos — container neutro */}
      <div className="mt-4 flex-1 rounded-xl px-3 py-2 [&>div:first-child]:pt-0 [&>div]:border-t-0">
        {preview.map(o => (
          <LinhaObrigacao key={o.id} obrigacao={o} clienteNome={clienteNome} />
        ))}
      </div>

      {/* Footer — ver mais */}
      {extras > 0 && (
        <div className="-mx-6 -mb-6 mt-auto px-6 py-3 bg-muted/50 rounded-b-[16px] text-center">
          <ModalProximos
            clienteNome={clienteNome}
            obrigacoes={obrigacoes.slice(previewSize)}
            extrasCount={extras}
          />
        </div>
      )}
    </div>
  )
}
