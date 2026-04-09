'use client'

import { useTransition } from 'react'
import { concluirObrigacao } from '@/app/actions/obrigacoes'
import { cn } from '@/lib/utils'

type ObrigacaoRow = {
  id: string
  data_vencimento: string
  status: string
  obrigacoes_template: { sigla: string; nome: string }[] | { sigla: string; nome: string } | null
  clientes: { id: string; nome: string; cnpj: string }[] | { id: string; nome: string; cnpj: string } | null
}

function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? val[0] ?? null : val
}

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgencia(dias: number, status: string) {
  if (status === 'atrasado' || dias < 0) return 'atrasado'
  if (dias === 0) return 'hoje'
  if (dias <= 3) return 'urgente'
  return 'normal'
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function LinhaObrigacao({ obrigacao: o }: { obrigacao: ObrigacaoRow }) {
  const [pending, startTransition] = useTransition()
  const template = unwrap(o.obrigacoes_template)
  const cliente = unwrap(o.clientes)
  const dias = getDiasRestantes(o.data_vencimento)
  const urgencia = getUrgencia(dias, o.status)

  const urgenciaStyles = {
    atrasado: 'border-l-4 border-l-destructive bg-destructive/5',
    hoje: 'border-l-4 border-l-destructive bg-destructive/5',
    urgente: 'border-l-4 border-l-amber-500 bg-amber-500/5',
    normal: 'border-l-4 border-l-transparent bg-card',
  }

  const diasLabel = {
    atrasado: 'Atrasado',
    hoje: 'Hoje',
    urgente: `${dias}d`,
    normal: `${dias}d`,
  }

  const diasColor = {
    atrasado: 'text-destructive font-semibold',
    hoje: 'text-destructive font-semibold',
    urgente: 'text-amber-500 font-semibold',
    normal: 'text-muted-foreground',
  }

  return (
    <div className={cn(
      'flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-4',
      urgenciaStyles[urgencia]
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {template?.sigla}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {template?.nome}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {cliente?.nome}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm text-foreground">{formatarData(o.data_vencimento)}</p>
        <p className={cn('text-xs', diasColor[urgencia])}>
          {diasLabel[urgencia]}
        </p>
      </div>

      <form action={concluirObrigacao}>
        <input type="hidden" name="obrigacao_id" value={o.id} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
        >
          {pending ? '…' : 'Concluir'}
        </button>
      </form>
    </div>
  )
}
