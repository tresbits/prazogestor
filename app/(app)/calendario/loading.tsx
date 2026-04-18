export default function Loading() {
  return (
    <div className="space-y-5">
      {/* Título */}
      <div className="p-2">
        <div className="h-12 w-56 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Nav + toggle de view */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-36 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex justify-center py-2">
            <div className="h-3 w-6 bg-muted/60 rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      {/* Grade do calendário — 5 semanas × 7 dias */}
      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-1.5 md:p-2 min-h-[48px] md:min-h-[100px] animate-pulse flex flex-col gap-1.5"
          >
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-muted shrink-0" />
            {/* Pill placeholder — apenas desktop, em alguns dias */}
            {i % 4 === 1 && (
              <div className="hidden md:block h-5 bg-muted/60 rounded-md w-full" />
            )}
            {i % 5 === 2 && (
              <div className="hidden md:block h-5 bg-muted/40 rounded-md w-4/5" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
