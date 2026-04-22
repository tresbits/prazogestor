import { cn } from '@/lib/utils'

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4']
const QUARTER_ENDS = [
  [3, 31],  // Q1: Mar 31
  [6, 30],  // Q2: Jun 30
  [9, 30],  // Q3: Sep 30
  [12, 31], // Q4: Dec 31
]
const QUARTER_NAMES = [
  'Jan – Mar',
  'Abr – Jun',
  'Jul – Set',
  'Out – Dez',
]

function getQuarterInfo(date: Date) {
  const month = date.getMonth() + 1 // 1-12
  const year = date.getFullYear()
  const qi = Math.floor((month - 1) / 3) // 0-3
  const [endMonth, endDay] = QUARTER_ENDS[qi]
  const endDate = new Date(year, endMonth - 1, endDay)
  endDate.setHours(0, 0, 0, 0)
  const today = new Date(date)
  today.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return {
    label: QUARTER_LABELS[qi],
    name: QUARTER_NAMES[qi],
    year,
    daysLeft: Math.max(0, daysLeft),
    qi,
  }
}

interface HeroHeadlineProps {
  date: Date
  officeName: string
  className?: string
}

export function HeroHeadline({ date, officeName, className }: HeroHeadlineProps) {
  const { label, name, year, daysLeft } = getQuarterInfo(date)

  const greeting = (() => {
    const h = date.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {greeting}, {officeName.split(' ')[0]}
      </p>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-none">
          {label} · {year}
        </h1>
        <span className="text-sm text-muted-foreground font-medium uppercase">
          {name}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {daysLeft === 0
          ? 'Último dia do trimestre'
          : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''} no trimestre`}
      </p>
    </div>
  )
}
