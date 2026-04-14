'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { FormError } from '@/components/ui/form-error'
import { AuthShell } from '../_components/auth-shell'

export default function EsqueciSenhaPage() {
  const [state, action, pending] = useActionState(resetPassword, null)

  if (state?.success) {
    return (
      <AuthShell
        panelTitle={<>Sem problema,<br />cobrimos você</>}
        panelTagline="A segurança dos seus dados é nossa prioridade."
      >
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">E-mail enviado</h2>
            <p className="text-sm text-muted-foreground mt-1">Verifique sua caixa de entrada</p>
          </div>

          <div className="bg-muted/50 rounded-xl px-4 py-4 space-y-1 border border-border">
            <p className="text-sm text-foreground font-medium">Link de recuperação enviado</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
          </div>

          <Link
            href="/login"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao login
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      panelTitle={<>Sem problema,<br />cobrimos você</>}
      panelTagline="A segurança dos seus dados é nossa prioridade. Recupere o acesso em segundos."
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Recuperar senha</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enviaremos um link de recuperação para o seu e-mail
          </p>
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

          {state?.error && <FormError message={state.error} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Enviando…' : 'Enviar link de recuperação'}
          </button>
        </form>

        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar ao login
        </Link>
      </div>
    </AuthShell>
  )
}
