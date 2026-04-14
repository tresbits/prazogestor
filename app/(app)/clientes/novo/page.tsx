'use client'

import { useActionState, useState } from 'react'
import { createClient } from '@/app/actions/clientes'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'
import { FormError } from '@/components/ui/form-error'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NovoClientePage() {
  const [state, action, pending] = useActionState(createClient, null)
  const [cnpj, setCnpj] = useState('')

  return (
    <div className="max-w-md mx-auto mt-8">
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Clientes
      </Link>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
          Novo cliente
        </p>

        <form action={action} className="space-y-4">
          <ClienteFormFields
            cnpj={{ value: cnpj, onChange: setCnpj }}
          />

          {state?.error && <FormError message={state.error} />}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {pending ? 'Salvando…' : 'Cadastrar cliente'}
            </button>
            <Link
              href="/clientes"
              className={cn(
                'h-10 px-4 rounded-full border border-border text-sm font-medium',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'inline-flex items-center'
              )}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
