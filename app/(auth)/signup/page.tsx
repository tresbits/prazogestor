'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="text-sm text-muted-foreground mt-1">14 dias grátis, sem cartão</p>
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
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
            autoComplete="new-password"
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
  )
}
