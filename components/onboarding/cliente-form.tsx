'use client'

import { useActionState, useState } from 'react'
import { onboardingCreateClient, onboardingSkipClient } from '@/app/actions/onboarding'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'
import { FormError } from '@/components/ui/form-error'

export function ClienteForm() {
  const [state, action, pending] = useActionState(onboardingCreateClient, null)
  const [cnpj, setCnpj] = useState('')

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <ProgressSteps current={2} />

      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Quase lá!
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
          Cadastre seu primeiro cliente. O calendário fiscal dele será gerado
          automaticamente com todas as obrigações do regime tributário.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
          Dados do cliente
        </p>

        <form action={action} className="space-y-4">
          <ClienteFormFields
            cnpj={{ value: cnpj, onChange: setCnpj }}
          />

          {state?.error && <FormError message={state.error} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mt-2"
          >
            {pending ? 'Gerando calendário…' : 'Gerar calendário →'}
          </button>
        </form>

        <form action={onboardingSkipClient} className="mt-3 text-center">
          <button
            type="submit"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Adicionar depois
          </button>
        </form>
      </div>
    </div>
  )
}
