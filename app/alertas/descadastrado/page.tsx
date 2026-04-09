import Link from 'next/link'

export default function DescadastradoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-2xl">✓</p>
        <h1 className="text-lg font-semibold text-gray-900">Descadastro realizado</h1>
        <p className="text-sm text-gray-500">
          Você não receberá mais alertas de vencimento por e-mail.
          Para reativar, acesse as configurações do painel.
        </p>
        <Link href="/login" className="text-sm text-gray-900 underline underline-offset-4">
          Ir para o painel
        </Link>
      </div>
    </div>
  )
}
