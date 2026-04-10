import { Sparkles } from 'lucide-react'

const PLANOS: Record<string, { label: string; descricao: string; progresso: number }> = {
  trial:        { label: 'Beta',          descricao: '90 dias grátis restantes', progresso: 10 },
  essencial:    { label: 'Essencial',     descricao: 'Até 15 clientes',          progresso: 100 },
  profissional: { label: 'Profissional',  descricao: 'Até 50 clientes',          progresso: 100 },
  agencia:      { label: 'Agência',       descricao: 'Clientes ilimitados',      progresso: 100 },
}

export function SecaoPlano({ plano }: { plano: string }) {
  const info = PLANOS[plano] ?? PLANOS['trial']

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Plano Atual</h2>
      </div>

      <div className="space-y-1">
        <p className="font-heading text-2xl font-bold text-foreground">{info.label}</p>
        <p className="text-xs text-muted-foreground">{info.descricao}</p>
      </div>

      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all"
          style={{ width: `${info.progresso}%` }}
        />
      </div>

      <button
        disabled
        className="w-full py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60"
      >
        Ver planos
      </button>
    </div>
  )
}
