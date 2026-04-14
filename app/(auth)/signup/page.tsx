'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { FormError } from '@/components/ui/form-error'
import { AuthShell } from '../_components/auth-shell'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <AuthShell
      panelTitle={<>Comece sua<br />jornada fiscal</>}
      panelTagline="Calendário de obrigações gerado automaticamente. Alertas antes dos vencimentos."
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Criar conta</h2>
          <p className="text-sm text-muted-foreground mt-1">14 dias grátis, sem cartão de crédito</p>
        </div>

        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              E-mail
            </p>
            <input
              name="email"
              type="email"
              placeholder="contador@escritorio.com.br"
              required
              autoComplete="email"
              autoFocus
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Senha
            </p>
            <input
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
            />
          </div>

          {state?.error && <FormError message={state.error} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Criando conta…' : 'Criar conta grátis'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
