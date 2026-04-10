'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-sm text-muted-foreground mt-1">Acesse sua conta do escritório</p>
      </div>

      <form action={action} className="space-y-4">
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
            required
            autoComplete="current-password"
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          />
        </div>

        {state?.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40 mt-2"
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
  )
}
