export default function Loading() {
  return (
    <div className="pb-36">
      {/* Header skeleton */}
      <div className="flex items-end justify-between mb-10">
        <div className="space-y-2">
          <div className="h-12 w-80 bg-muted rounded-full animate-pulse" />
          <div className="h-4 w-56 bg-muted/60 rounded-full animate-pulse" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-3 w-28 bg-muted/60 rounded-full animate-pulse ml-auto" />
          <div className="h-4 w-20 bg-muted rounded-full animate-pulse ml-auto" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-[16px] shadow-card flex flex-col animate-pulse">
            {/* Tonal header */}
            <div className="px-6 py-4 rounded-t-[16px] bg-muted/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted/80 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded-full w-3/4" />
                <div className="h-2.5 bg-muted/60 rounded-full w-1/2" />
              </div>
            </div>
            {/* Body lines */}
            <div className="p-6 space-y-3">
              <div className="h-3 bg-muted rounded-full w-full" />
              <div className="h-3 bg-muted rounded-full w-5/6" />
              <div className="h-3 bg-muted rounded-full w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
