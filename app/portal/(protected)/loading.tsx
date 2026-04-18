function MesCard({ rows }: { rows: number }) {
  return (
    <div className="bg-card rounded-[16px] shadow-card overflow-hidden animate-pulse">
      <div className="px-4 py-3 bg-muted/40 border-b border-border/40">
        <div className="h-3 w-16 bg-muted rounded-full" />
      </div>
      <div className="px-4 py-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-t border-border/40 first:border-t-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-5 w-10 bg-muted rounded-full shrink-0" />
              <div className="h-3.5 bg-muted/70 rounded-full w-40" />
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
              <div className="h-3.5 w-20 bg-muted rounded-full" />
              <div className="h-2.5 w-14 bg-muted/60 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header do cliente */}
      <div className="bg-card rounded-[20px] shadow-card overflow-hidden animate-pulse">
        <div className="px-6 py-5 bg-muted/50 space-y-2">
          <div className="h-7 w-56 bg-muted rounded-full" />
          <div className="h-3 w-36 bg-muted/60 rounded-full" />
        </div>
        <div className="px-6 py-3 flex items-center gap-3 border-t border-border/40">
          <div className="h-6 w-28 bg-muted rounded-full" />
          <div className="h-6 w-20 bg-muted/60 rounded-full" />
          <div className="h-6 w-20 bg-muted/60 rounded-full" />
        </div>
      </div>

      {/* Meses */}
      <MesCard rows={3} />
      <MesCard rows={2} />
      <MesCard rows={4} />
    </div>
  )
}
