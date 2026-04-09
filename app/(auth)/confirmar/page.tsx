import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmarPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme seu e-mail</CardTitle>
        <CardDescription>Último passo para ativar sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Enviamos um link de confirmação para o seu e-mail.
          Clique no link para ativar sua conta e acessar o painel.
        </p>
        <p>
          Não recebeu?{' '}
          <Link href="/signup" className="text-foreground hover:underline">
            Tente novamente
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
