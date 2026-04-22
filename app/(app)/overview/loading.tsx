function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`} />
}

export default function OverviewLoading() {
  return (
    <div className="mx-auto space-y-6">

      {/* Hero + value */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="md:w-72 shrink-0 bg-card rounded-2xl shadow-card px-5 py-4 space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-48" />
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl shadow-card px-4 py-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Upcoming + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(col => (
          <div key={col} className="bg-card rounded-2xl shadow-card px-4 py-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton className="h-5 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}
