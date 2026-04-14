'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'
import { FormError } from '@/components/ui/form-error'
import { cn } from '@/lib/utils'

type Client = {
  id: string
  name: string
  cnpj: string
  tax_regime: string
  has_employees: boolean
  email?: string | null
}

export function EditarClienteForm({ client }: { client: Client }) {
  const [state, action, pending] = useActionState(updateClient, null)

  return (
    <div className="max-w-md mx-auto mt-8">
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Clientes
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar cliente</CardTitle>
          <CardDescription>
            {client.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="client_id" value={client.id} />

            <ClienteFormFields
              cnpjForLookup={client.cnpj}
              defaultValues={{
                name: client.name,
                tax_regime: client.tax_regime,
                has_employees: String(client.has_employees),
                email: client.email ?? undefined,
              }}
              showRegimeHint
              showEmailField
            />

            {state?.error && <FormError message={state.error} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 h-10 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {pending ? 'Salvando…' : 'Salvar alterações'}
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
        </CardContent>
      </Card>
    </div>
  )
}
