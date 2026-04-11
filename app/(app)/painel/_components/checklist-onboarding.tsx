'use client'

import { useTransition, useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, X, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dispensarChecklist } from '@/app/actions/configuracoes'

const LS_KEY = 'prazogestor:checklist-minimizado'

type Passo = {
  label: string
  descricao: string
  concluido: boolean
  href?: string
}

export function ChecklistOnboarding({
  totalClientes,
  alertasAtivo,
}: {
  totalClientes: number
  alertasAtivo: boolean
}) {
  const [minimizado, setMinimizado] = useState(false)
  const [pending, startTransition] = useTransition()

  // Lê estado minimizado do localStorage após hidratação
  useEffect(() => {
    setMinimizado(localStorage.getItem(LS_KEY) === '1')
  }, [])

  const passos: Passo[] = [
    {
      label: 'Criar o escritório',
      descricao: 'Nome e estado configurados.',
      concluido: true,
    },
    {
      label: 'Cadastrar o primeiro cliente',
      descricao: 'Vencimentos gerados automaticamente ao cadastrar.',
      concluido: totalClientes >= 1,
      href: totalClientes < 1 ? '/clientes' : undefined,
    },
    {
      label: 'Cadastrar pelo menos 3 clientes',
      descricao: 'Veja o painel ganhar vida com múltiplos clientes.',
      concluido: totalClientes >= 3,
      href: totalClientes < 3 ? '/clientes' : undefined,
    },
    {
      label: 'Ativar alertas por e-mail',
      descricao: 'Receba avisos 7, 3 e 1 dia antes de cada vencimento.',
      concluido: alertasAtivo,
      href: !alertasAtivo ? '/configuracoes' : undefined,
    },
  ]

  const concluidos = passos.filter(p => p.concluido).length
  const total = passos.length
  const progresso = Math.round((concluidos / total) * 100)

  function handleMinimizar() {
    localStorage.setItem(LS_KEY, '1')
    setMinimizado(true)
  }

  function handleExpandir() {
    localStorage.removeItem(LS_KEY)
    setMinimizado(false)
  }

  function handleDispensar() {
    localStorage.removeItem(LS_KEY)
    startTransition(() => dispensarChecklist())
  }

  // Estado minimizado — chip discreto
  if (minimizado) {
    return (
      <button
        onClick={handleExpandir}
        className="animate-in fade-in-0 zoom-in-95 duration-200 flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-border bg-card shadow-card text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        <ListChecks className="h-3.5 w-3.5" />
        <span>Primeiros passos</span>
        <span className="font-semibold text-foreground">{concluidos}/{total}</span>
      </button>
    )
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-card rounded-2xl border border-border shadow-card p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="font-heading text-[15px] font-semibold text-foreground">
            Primeiros passos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {concluidos} de {total} concluídos
          </p>
        </div>
        <button
          onClick={handleMinimizar}
          className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Minimizar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Passos */}
      <div className="space-y-1">
        {passos.map((passo) => {
          const inner = (
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              passo.concluido
                ? 'opacity-50'
                : passo.href
                  ? 'hover:bg-muted cursor-pointer'
                  : ''
            )}>
              <div className={cn(
                'shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                passo.concluido
                  ? 'bg-foreground'
                  : 'border-2 border-muted-foreground/30'
              )}>
                {passo.concluido && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium leading-tight',
                  passo.concluido ? 'line-through text-muted-foreground' : 'text-foreground'
                )}>
                  {passo.label}
                </p>
                {!passo.concluido && (
                  <p className="text-xs text-muted-foreground mt-0.5">{passo.descricao}</p>
                )}
              </div>
              {!passo.concluido && passo.href && (
                <ChevronRight className="shrink-0 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )

          return passo.href && !passo.concluido ? (
            <Link key={passo.label} href={passo.href}>{inner}</Link>
          ) : (
            <div key={passo.label}>{inner}</div>
          )
        })}
      </div>

      {/* Footer — dispensar permanentemente */}
      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <button
          onClick={handleDispensar}
          disabled={pending}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          Não exibir novamente
        </button>
      </div>
    </div>
  )
}
