'use client'

import { useActionState } from 'react'
import { onboardingCriarEscritorio } from '@/app/actions/onboarding'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export default function OnboardingEscritorioPage() {
  const [state, action, pending] = useActionState(onboardingCriarEscritorio, null)

  return (
    <>
      <ProgressSteps current={1} />
      <Card>
        <CardHeader>
          <CardTitle>Dados do escritório</CardTitle>
          <CardDescription>
            Como se chama o seu escritório contábil?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do escritório</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Contabilidade Silva & Associados"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" required>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Salvando...' : 'Continuar →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
