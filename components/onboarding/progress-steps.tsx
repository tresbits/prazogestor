import { Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Escritório' },
  { n: 2, label: 'Cliente' },
  { n: 3, label: 'Concluído' },
]

export function ProgressSteps({
  current,
  skipped = [],
  completed = false,
}: {
  current: 1 | 2 | 3
  skipped?: number[]
  completed?: boolean
}) {
  return (
    <div className="relative flex justify-between items-start w-full max-w-xs mx-auto mb-10">

      {/* Linhas conectoras */}
      <div className="absolute top-[18px] left-0 right-0 flex px-[18px] pointer-events-none">
        {STEPS.slice(0, -1).map((step) => (
          <div
            key={step.n}
            className={cn(
              'flex-1 h-px transition-colors',
              step.n < current && !skipped.includes(step.n)
                ? 'bg-foreground/40'
                : 'bg-border'
            )}
          />
        ))}
      </div>

      {/* Steps */}
      {STEPS.map((step) => {
        const isSkipped = skipped.includes(step.n)
        const done      = (step.n < current || (completed && step.n === current)) && !isSkipped
        const active    = step.n === current && !completed

        return (
          <div key={step.n} className="relative flex flex-col items-center gap-2 z-10">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              done   && 'bg-foreground text-background',
              active && 'bg-foreground text-background ring-[3px] ring-offset-2 ring-offset-background ring-foreground/20',
              isSkipped && 'bg-muted text-muted-foreground border border-border',
              !done && !active && !isSkipped && 'bg-muted text-muted-foreground',
            )}>
              {done
                ? <Check className="h-4 w-4" strokeWidth={2.5} />
                : isSkipped
                  ? <Clock className="h-4 w-4" strokeWidth={2} />
                  : <span className="text-sm font-bold">{step.n}</span>
              }
            </div>
            <span className={cn(
              'text-[11px] font-medium whitespace-nowrap',
              active    ? 'text-foreground'        : 'text-muted-foreground',
              isSkipped && 'text-muted-foreground/60',
            )}>
              {step.label}
            </span>
          </div>
        )
      })}

    </div>
  )
}
