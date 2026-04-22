export default function Loading() {
  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="h-3.5 w-32 bg-skeleton rounded-full animate-pulse" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-7 w-56 bg-skeleton rounded-full animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-5 w-36 bg-skeleton/60 rounded-full animate-pulse" />
              <div className="h-5 w-28 bg-skeleton/60 rounded-full animate-pulse" />
              <div className="h-5 w-24 bg-skeleton/60 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 mt-1">
            <div className="w-7 h-7 rounded-full bg-skeleton animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-skeleton animate-pulse" />
            <div className="w-px h-4 bg-border mx-1" />
            <div className="h-7 w-28 rounded-full bg-skeleton animate-pulse" />
          </div>
        </div>

        {/* Contact + Address card */}
        <div className="bg-skeleton/50 rounded-[16px] px-5 py-4 animate-pulse">
          <div className="flex flex-col md:flex-row gap-4 md:gap-0">
            <div className="flex flex-col gap-2 md:pr-5">
              <div className="h-2.5 w-14 bg-skeleton rounded-full" />
              <div className="h-3.5 w-32 bg-skeleton/60 rounded-full" />
              <div className="h-3.5 w-24 bg-skeleton/60 rounded-full" />
            </div>
            <div className="flex flex-col gap-2 md:pl-5">
              <div className="h-2.5 w-14 bg-skeleton rounded-full" />
              <div className="h-3.5 w-48 bg-skeleton/60 rounded-full" />
              <div className="h-3.5 w-36 bg-skeleton/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-skeleton/50 rounded-[16px] px-4 py-4 flex flex-col items-center gap-1.5 animate-pulse">
              <div className="h-8 w-10 bg-skeleton rounded-full" />
              <div className="h-2.5 w-16 bg-skeleton/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Section separator */}
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-48 bg-skeleton rounded-full animate-pulse" />
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Calendar rows */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-skeleton/50 rounded-[14px] px-4 py-3 flex items-center gap-3 animate-pulse">
            <div className="h-5 w-12 bg-skeleton rounded-full" />
            <div className="flex-1 h-3.5 bg-skeleton/60 rounded-full" />
            <div className="h-5 w-16 bg-skeleton/60 rounded-full" />
          </div>
        ))}
      </div>

    </div>
  )
}
