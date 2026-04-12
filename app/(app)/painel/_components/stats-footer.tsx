type StatsFooterProps = {
  critical: number
  next7days: number
  completedToday: number
}

export function StatsFooter({ critical, next7days, completedToday }: StatsFooterProps) {
  return (
    <div
      className="fixed bottom-8 z-30 flex items-center gap-0
        bg-background/85 dark:bg-[rgba(26,26,26,0.85)]
        backdrop-blur-2xl saturate-200
        border border-white/20 dark:border-white/10
        rounded-[12px]
        shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
      style={{ left: 'calc(13rem + 2rem)', right: '2rem' }}
    >
      <div className="flex flex-col px-8 py-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Pendências Críticas
        </span>
        <span className="text-2xl font-mono font-bold text-destructive mt-0.5">
          {String(critical).padStart(2, '0')}
        </span>
      </div>

      <div className="w-px h-10 bg-border/60" />

      <div className="flex flex-col px-8 py-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Próximos 7 Dias
        </span>
        <span className="text-2xl font-mono font-bold text-amber-500 mt-0.5">
          {String(next7days).padStart(2, '0')}
        </span>
      </div>

      <div className="w-px h-10 bg-border/60" />

      <div className="flex flex-col px-8 py-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Concluídos Hoje
        </span>
        <span className="text-2xl font-mono font-bold text-foreground mt-0.5">
          {String(completedToday).padStart(2, '0')}
        </span>
      </div>

      <div className="ml-auto px-6 py-4 flex items-center">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-mono whitespace-nowrap">
          Período · 30 dias
        </span>
      </div>
    </div>
  )
}
