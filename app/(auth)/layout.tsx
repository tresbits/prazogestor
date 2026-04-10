export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-dot-grid px-4">
      <div className="w-full max-w-[380px] space-y-6">
        <div>
          <p className="font-heading font-semibold text-[15px] text-foreground">PrazoGestor</p>
          <p className="text-xs text-muted-foreground mt-0.5">by Tresbits</p>
        </div>
        {children}
      </div>
      <p className="text-[11px] text-muted-foreground/40 mt-12">
        PRAZOGESTOR V2.4.0
      </p>
    </div>
  )
}
