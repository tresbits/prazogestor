'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { updateClient } from '@/app/actions/clientes'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

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

            <div className="space-y-2">
              <Label htmlFor="name">Nome / Razão Social</Label>
              <Input
                id="name"
                name="name"
                defaultValue={client.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_regime">Regime tributário</Label>
              <Select name="tax_regime" defaultValue={client.tax_regime}>
                <SelectTrigger id="tax_regime">
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Alterar o regime regenera os vencimentos futuros.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="has_employees">Tem funcionários?</Label>
              <Select name="has_employees" defaultValue={String(client.has_employees)}>
                <SelectTrigger id="has_employees">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Não</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
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
