'use client'

import { useTransition, useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, X, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dismissChecklist } from '@/app/actions/configuracoes'

const LS_KEY = 'prazogestor:checklist-minimizado'

type Step = {
  label: string
  descricao: string
  done: boolean
  href?: string
}

export function ChecklistOnboarding({
  totalClients,
  alertsEnabled,
}: {
  totalClients: number
  alertsEnabled: boolean
}) {
  const [minimized, setMinimized] = useState(false)
  const [pending, startTransition] = useTransition()

  // Lê estado minimizado do localStorage após hidratação
  useEffect(() => {
    setMinimized(localStorage.getItem(LS_KEY) === '1')
  }, [])

  const steps: Step[] = [
    {
      label: 'Criar o escritório',
      descricao: 'Nome e estado configurados.',
      done: true,
    },
    {
      label: 'Cadastrar o primeiro cliente',
      descricao: 'Vencimentos gerados automaticamente ao cadastrar.',
      done: totalClients >= 1,
      href: totalClients < 1 ? '/clientes' : undefined,
    },
    {
      label: 'Cadastrar pelo menos 3 clientes',
      descricao: 'Veja o painel ganhar vida com múltiplos clientes.',
      done: totalClients >= 3,
      href: totalClients < 3 ? '/clientes' : undefined,
    },
    {
      label: 'Ativar alertas por e-mail',
      descricao: 'Receba avisos 7, 3 e 1 dia antes de cada vencimento.',
      done: alertsEnabled,
      href: !alertsEnabled ? '/configuracoes' : undefined,
    },
  ]

  const completed = steps.filter(s => s.done).length
  const total = steps.length
  const progress = Math.round((completed / total) * 100)

  function handleMinimize() {
    localStorage.setItem(LS_KEY, '1')
    setMinimized(true)
  }

  function handleExpand() {
    localStorage.removeItem(LS_KEY)
    setMinimized(false)
  }

  function handleDismiss() {
    localStorage.removeItem(LS_KEY)
    startTransition(() => dismissChecklist())
  }

  // Estado minimizado — chip discreto
  if (minimized) {
    return (
      <button
        onClick={handleExpand}
        className="animate-in fade-in-0 zoom-in-95 duration-200 flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-border bg-card shadow-card text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        <ListChecks className="h-3.5 w-3.5" />
        <span>Primeiros passos</span>
        <span className="font-semibold text-foreground">{completed}/{total}</span>
      </button>
    )
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-card rounded-2xl border border-border shadow-card p-4 md:p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="font-heading text-[15px] font-semibold text-foreground">
            Primeiros passos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completed} de {total} concluídos
          </p>
        </div>
        <button
          onClick={handleMinimize}
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
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Passos */}
      <div className="space-y-1">
        {steps.map((step) => {
          const inner = (
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              step.done
                ? 'opacity-50'
                : step.href
                  ? 'hover:bg-muted cursor-pointer'
                  : ''
            )}>
              <div className={cn(
                'shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                step.done
                  ? 'bg-foreground'
                  : 'border-2 border-muted-foreground/30'
              )}>
                {step.done && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium leading-tight',
                  step.done ? 'line-through text-muted-foreground' : 'text-foreground'
                )}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.descricao}</p>
                )}
              </div>
              {!step.done && step.href && (
                <ChevronRight className="shrink-0 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )

          return step.href && !step.done ? (
            <Link key={step.label} href={step.href}>{inner}</Link>
          ) : (
            <div key={step.label}>{inner}</div>
          )
        })}
      </div>

      {/* Footer — dispensar permanentemente */}
      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <button
          onClick={handleDismiss}
          disabled={pending}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          Não exibir novamente
        </button>
      </div>
    </div>
  )
}
