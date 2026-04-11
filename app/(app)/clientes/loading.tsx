export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-1.5">
        <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
        <div className="h-3.5 w-28 bg-muted/60 rounded-full animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add card skeleton */}
        <div className="bg-background rounded-[16px] shadow-card min-h-[120px] border-2 border-dashed border-border animate-pulse" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-[16px] shadow-card flex flex-col animate-pulse">
            {/* Tonal header */}
            <div className="px-5 py-4 rounded-t-[16px] bg-muted/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted/80 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded-full w-3/4" />
                <div className="h-2.5 bg-muted/60 rounded-full w-1/2" />
              </div>
            </div>
            {/* Body */}
            <div className="px-5 py-4 space-y-2.5">
              <div className="h-3 bg-muted rounded-full w-full" />
              <div className="h-3 bg-muted rounded-full w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
