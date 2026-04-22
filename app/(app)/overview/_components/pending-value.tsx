import { cn } from '@/lib/utils'

interface PendingValueProps {
  totalValue: number
  completedCount: number
  totalCount: number
  className?: string
}

export function PendingValue({ totalValue, completedCount, totalCount, className }: PendingValueProps) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const pendingCount = totalCount - completedCount

  return (
    <div className={cn('bg-card rounded-2xl shadow-card px-5 py-4', className)}>
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Valor Pendente Total
      </p>
      <p className="font-mono text-3xl md:text-4xl font-bold text-foreground leading-none">
        {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
          <span className="font-mono font-semibold text-foreground">
            {pct}% concluído
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
