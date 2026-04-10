import Link from 'next/link'

export default function ConfirmarPage() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Confirme seu e-mail</h1>
        <p className="text-sm text-muted-foreground mt-1">Último passo para ativar sua conta</p>
      </div>

      <div className="bg-muted/50 rounded-xl px-4 py-4 space-y-1">
        <p className="text-sm text-foreground font-medium">Link enviado</p>
        <p className="text-sm text-muted-foreground">
          Clique no link que enviamos para o seu e-mail para ativar a conta e acessar o painel.
        </p>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Não recebeu?{' '}
        <Link href="/signup" className="text-foreground font-medium hover:underline">
          Tentar novamente
        </Link>
      </p>
    </div>
  )
}
