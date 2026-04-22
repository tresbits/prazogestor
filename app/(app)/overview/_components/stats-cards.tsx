import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatCard {
  label: string
  value: number | string
  delta?: number | null  // positive = up, negative = down, 0/null = neutral
  deltaLabel?: string
  mono?: boolean
}

interface StatsCardsProps {
  cards: StatCard[]
  className?: string
}

function DeltaBadge({ delta, deltaLabel }: { delta: number; deltaLabel?: string }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" />
        {deltaLabel ?? 'igual ao mês anterior'}
      </span>
    )
  }
  const up = delta > 0
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-semibold',
      up ? 'text-foreground' : 'text-destructive'
    )}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}{delta} {deltaLabel ?? 'vs mês anterior'}
    </span>
  )
}

export function StatsCards({ cards, className }: StatsCardsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {cards.map((card) => (
        <div key={card.label} className="bg-card rounded-2xl shadow-card px-4 py-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {card.label}
          </p>
          <p className={cn(
            'text-2xl md:text-3xl font-bold text-foreground leading-none',
            card.mono && 'font-mono'
          )}>
            {card.value}
          </p>
          {card.delta != null && (
            <div className="mt-2">
              <DeltaBadge delta={card.delta} deltaLabel={card.deltaLabel} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
