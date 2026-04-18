'use client'

import { useActionState } from 'react'
import { acceptPortalInvite } from '@/app/actions/portal'
import { FormError } from '@/components/ui/form-error'

export function InviteForm({
  token,
  clientEmail,
  clientName,
  officeName,
}: {
  token: string
  clientEmail: string
  clientName: string
  officeName: string
}) {
  const [state, action, pending] = useActionState(acceptPortalInvite, null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Criar conta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Convite de <span className="font-medium text-foreground">{officeName}</span> para {clientName}
        </p>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            E-mail
          </p>
          <input
            type="email"
            value={clientEmail}
            readOnly
            className="w-full h-10 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
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
            minLength={6}
            autoComplete="new-password"
            autoFocus
            placeholder="Mínimo 6 caracteres"
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          />
        </div>

        {state?.error && <FormError message={state.error} />}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {pending ? 'Criando conta…' : 'Criar conta e acessar portal'}
        </button>
      </form>
    </div>
  )
}
