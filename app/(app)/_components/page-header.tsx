import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── PageBreadcrumb ───────────────────────────────────────────────────────────

interface PageBreadcrumbProps {
  parent: { label: string; href: string }
  current: string
}

export function PageBreadcrumb({ parent, current }: PageBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5">
      <Link href={parent.href}>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          {parent.label}
        </span>
      </Link>
      <span className="font-mono text-[11px] text-muted-foreground/40">/</span>
      <span className="font-mono text-[11px] uppercase tracking-widest text-foreground">
        {current}
      </span>
    </nav>
  )
}

// ─── PageTitle ────────────────────────────────────────────────────────────────

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn(
      'font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight',
      className
    )}>
      {children}
    </h1>
  )
}

// ─── MetricPill ───────────────────────────────────────────────────────────────

type MetricPillVariant = 'default' | 'subtle' | 'destructive' | 'warning'

interface MetricPillProps {
  children: React.ReactNode
  variant?: MetricPillVariant
}

const PILL_VARIANTS: Record<MetricPillVariant, string> = {
  default:     'bg-muted text-muted-foreground font-medium',
  subtle:      'bg-card border border-border text-foreground font-medium',
  destructive: 'bg-destructive/10 text-destructive font-semibold',
  warning:     'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold',
}

export function MetricPill({ children, variant = 'default' }: MetricPillProps) {
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-[11px] font-mono',
      PILL_VARIANTS[variant]
    )}>
      {children}
    </span>
  )
}
