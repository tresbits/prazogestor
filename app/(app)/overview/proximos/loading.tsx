import type { CSSProperties } from 'react'

function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`} style={style} />
}

export default function ProximosLoading() {
  return (
    <div className="mx-auto space-y-6">
      <Skeleton className="h-4 w-20" />

      <div className="space-y-1">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Filter bar skeleton */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          {[80, 100, 120, 90, 110].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-2">
          {[60, 70, 50, 100, 75].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl shadow-card px-4 py-1 space-y-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-t border-border/40 first:border-0">
            <Skeleton className="h-5 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}
