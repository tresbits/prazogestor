'use client'

import { useActionState, useState } from 'react'
import { criarCliente } from '@/app/actions/clientes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCNPJ } from '@/lib/format'

export default function NovoClientePage() {
  const [state, action, pending] = useActionState(criarCliente, null)
  const [cnpj, setCnpj] = useState('')

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
          <CardDescription>
            A razão social será buscada automaticamente pelo CNPJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                value={cnpj}
                onChange={e => setCnpj(formatCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                required
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome / Razão Social</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Preenchido automaticamente ou digite"
                required
              />
              <p className="text-xs text-muted-foreground">
                Se o CNPJ for encontrado na Receita, o nome será atualizado ao salvar.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regime">Regime tributário</Label>
              <Select name="regime" required>
                <SelectTrigger id="regime">
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tem_empregados">Tem funcionários?</Label>
              <Select name="tem_empregados" required>
                <SelectTrigger id="tem_empregados">
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

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Salvando...' : 'Cadastrar cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
