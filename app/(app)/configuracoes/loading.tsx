function Section({ rows = 2 }: { rows?: number }) {
  return (
    <div className="bg-card rounded-[16px] shadow-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded-full" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-20 bg-muted/60 rounded-full" />
            <div className="h-9 bg-muted/60 rounded-lg w-full" />
          </div>
        ))}
      </div>
      <div className="h-8 w-24 bg-muted rounded-full mt-2" />
    </div>
  )
}

function SectionCompact() {
  return (
    <div className="bg-card rounded-[16px] shadow-card p-6 space-y-3 animate-pulse">
      <div className="h-4 w-28 bg-muted rounded-full" />
      <div className="h-3 w-48 bg-muted/60 rounded-full" />
      <div className="flex gap-2 pt-1">
        <div className="h-8 w-20 bg-muted rounded-full" />
        <div className="h-8 w-20 bg-muted/60 rounded-full" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="p-2 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-12 w-64 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-72 bg-muted/60 rounded-full animate-pulse" />
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Coluna esquerda */}
        <div className="space-y-5">
          <Section rows={2} />
          <Section rows={1} />
          <SectionCompact />
          <Section rows={1} />
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          <SectionCompact />
          <SectionCompact />
          <SectionCompact />
        </div>
      </div>
    </div>
  )
}
