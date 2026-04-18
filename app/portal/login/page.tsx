'use client'

import { useActionState } from 'react'
import { portalLogin } from '@/app/actions/portal'
import { FormError } from '@/components/ui/form-error'
import { AuthShell } from '@/app/(auth)/_components/auth-shell'

export default function PortalLoginPage() {
  const [state, action, pending] = useActionState(portalLogin, null)

  return (
    <AuthShell
      panelTitle={<>Portal do<br />Cliente</>}
      panelTagline="Acompanhe suas obrigações fiscais com prazos e valores atualizados pelo seu escritório contábil."
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Entrar no portal</h2>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta de empresário</p>
        </div>

        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              E-mail
            </p>
            <input
              name="email"
              type="email"
              placeholder="empresa@dominio.com.br"
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

          {state?.error && <FormError message={state.error} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sem conta?{' '}
          <span className="text-foreground/60">
            Solicite um convite ao seu escritório contábil.
          </span>
        </p>
      </div>
    </AuthShell>
  )
}
