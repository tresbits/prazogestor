'use client'

import { useActionState } from 'react'
import { onboardingCreateOffice } from '@/app/actions/onboarding'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export function EscritorioForm() {
  const [state, action, pending] = useActionState(onboardingCreateOffice, null)

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <ProgressSteps current={1} />

      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Bem-vindo ao PrazoGestor.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
          Nenhuma obrigação fiscal vai passar despercebida a partir de hoje.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
          Seu escritório
        </p>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nome do escritório
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Contabilidade Silva & Associados"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Estado / UF
            </Label>
            <Select name="state" required>
              <SelectTrigger id="state">
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
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mt-2"
          >
            {pending ? 'Salvando…' : 'Continuar →'}
          </button>
        </form>
      </div>
    </div>
  )
}
