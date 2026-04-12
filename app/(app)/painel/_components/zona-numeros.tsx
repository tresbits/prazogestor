'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalGlobal, type ObItem } from './modal-global'

function NumberBlock({
  count,
  label,
  color,
  onClick,
}: {
  count: number
  label: string
  color: 'destructive' | 'amber'
  onClick: () => void
}) {
  const numberClass = color === 'destructive' ? 'text-destructive' : 'text-amber-500'

  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className={cn(
        'flex-1 flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl border border-border',
        'bg-card shadow-card transition-all duration-150',
        count > 0
          ? 'hover:border-foreground/20 hover:shadow-md cursor-pointer active:scale-[0.98]'
          : 'opacity-40 cursor-default'
      )}
    >
      <span className={cn('text-3xl font-mono font-bold leading-none tabular-nums', numberClass)}>
        {String(count).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  )
}

export function ZonaNumeros({
  vencidos,
  hoje,
  proximos7,
}: {
  vencidos: ObItem[]
  hoje: ObItem[]
  proximos7: ObItem[]
}) {
  const [modal, setModal] = useState<'vencidos' | 'hoje' | '7dias' | null>(null)
  const allZero = vencidos.length === 0 && hoje.length === 0 && proximos7.length === 0

  return (
    <>
      {allZero ? (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-card border border-border shadow-card mb-8">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Tudo em dia</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nenhum vencimento nos próximos 7 dias.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 mb-8">
          <NumberBlock
            count={vencidos.length}
            label="Vencidos"
            color="destructive"
            onClick={() => setModal('vencidos')}
          />
          <NumberBlock
            count={hoje.length}
            label="Vencem hoje"
            color="destructive"
            onClick={() => setModal('hoje')}
          />
          <NumberBlock
            count={proximos7.length}
            label="Próx. 7 dias"
            color="amber"
            onClick={() => setModal('7dias')}
          />
        </div>
      )}

      <ModalGlobal
        title="Obrigações Vencidas"
        items={vencidos}
        open={modal === 'vencidos'}
        onOpenChange={(o) => !o && setModal(null)}
      />
      <ModalGlobal
        title="Vencem Hoje"
        items={hoje}
        open={modal === 'hoje'}
        onOpenChange={(o) => !o && setModal(null)}
      />
      <ModalGlobal
        title="Próximos 7 Dias"
        items={proximos7}
        open={modal === '7dias'}
        onOpenChange={(o) => !o && setModal(null)}
      />
    </>
  )
}
