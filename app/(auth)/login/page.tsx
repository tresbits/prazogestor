'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { FormError } from '@/components/ui/form-error'
import { AuthShell } from '../_components/auth-shell'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <AuthShell
      panelTitle={<>Bem-vindo<br />de volta</>}
      panelTagline="Acesse o painel do seu escritório contábil e mantenha os prazos em dia."
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Entrar</h2>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta do escritório</p>
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
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Senha
              </p>
              <Link
                href="/esqueci-senha"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
            />
          </div>

          {state?.error && <FormError message={state.error} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
