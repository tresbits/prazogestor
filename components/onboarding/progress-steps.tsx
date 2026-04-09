import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Seu escritório' },
  { n: 2, label: 'Primeiro cliente' },
  { n: 3, label: 'Calendário' },
]

export function ProgressSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-sm mx-auto mb-8">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
              step.n < current  && 'bg-foreground border-foreground text-background',
              step.n === current && 'bg-background border-foreground text-foreground',
              step.n > current  && 'bg-background border-border text-muted-foreground',
            )}>
              {step.n < current ? '✓' : step.n}
            </div>
            <span className={cn(
              'text-xs whitespace-nowrap',
              step.n === current ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'h-0.5 flex-1 -mt-5 mx-1 transition-colors',
              step.n < current ? 'bg-foreground' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
