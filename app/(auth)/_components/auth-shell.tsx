import Link from 'next/link'

export function AuthShell({
  panelTitle,
  panelTagline,
  children,
}: {
  panelTitle: React.ReactNode
  panelTagline?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — oculto no mobile */}
      <div className="hidden md:flex md:w-[44%] bg-foreground flex-col justify-between p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-7 h-7 rounded-lg bg-background/10 border border-background/10 flex items-center justify-center shrink-0">
            <span className="text-background text-[11px] font-bold tracking-tight">P</span>
          </div>
          <span className="text-background font-heading font-semibold text-[15px]">PrazoGestor</span>
        </div>

        {/* Título principal */}
        <div className="relative z-10">
          <h1 className="font-heading text-[42px] lg:text-5xl font-bold text-background leading-[1.1] tracking-tight">
            {panelTitle}
          </h1>
          {panelTagline && (
            <p className="text-background/50 text-sm mt-5 leading-relaxed max-w-[260px]">
              {panelTagline}
            </p>
          )}
        </div>

        {/* Rodapé */}
        <p className="text-[10px] text-background/25 uppercase tracking-widest relative z-10">
          by Tresbits
        </p>

        {/* Decoração geométrica sutil */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full border border-background/5 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full border border-background/5 pointer-events-none" />
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12 min-h-screen">
        {/* Logo mobile */}
        <div className="md:hidden mb-10 self-start">
          <p className="font-heading font-semibold text-[15px] text-foreground">PrazoGestor</p>
          <p className="text-xs text-muted-foreground mt-0.5">by Tresbits</p>
        </div>

        <div className="w-full max-w-[360px]">
          {children}
        </div>

        <p className="text-[10px] text-muted-foreground/30 mt-16 uppercase tracking-widest">
          © {new Date().getFullYear()} Tresbits · PrazoGestor
        </p>
      </div>
    </div>
  )
}
