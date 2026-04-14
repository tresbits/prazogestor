import Link from 'next/link'
import { AuthShell } from '../_components/auth-shell'

export default function ConfirmarPage() {
  return (
    <AuthShell
      panelTitle={<>Quase lá</>}
      panelTagline="Um clique no e-mail e seu painel fiscal estará pronto para uso."
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Confirme seu e-mail</h2>
          <p className="text-sm text-muted-foreground mt-1">Último passo para ativar sua conta</p>
        </div>

        <div className="bg-muted/50 rounded-xl px-4 py-4 space-y-1 border border-border">
          <p className="text-sm text-foreground font-medium">Link enviado</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Clique no link que enviamos para o seu e-mail para ativar a conta e acessar o painel.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Não recebeu?{' '}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Tentar novamente
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
