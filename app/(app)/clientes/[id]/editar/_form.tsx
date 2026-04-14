'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteFormFields } from '@/components/clientes/cliente-form-fields'
import { FormError } from '@/components/ui/form-error'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type Client = {
  id: string
  name: string
  cnpj: string
  tax_regime: string
  has_employees: boolean
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
              defaultValues={{
                name: client.name,
                tax_regime: client.tax_regime,
                has_employees: String(client.has_employees),
              }}
            />

            <p className="text-xs text-muted-foreground -mt-2">
              Alterar o regime regenera os vencimentos futuros.
            </p>

            {state?.error && <FormError message={state.error} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className={cn(
                  buttonVariants(),
                  'flex-1 disabled:opacity-40'
                )}
              >
                {pending ? 'Salvando…' : 'Salvar alterações'}
              </button>
              <Link href="/clientes" className={cn(buttonVariants({ variant: 'outline' }))}>
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
