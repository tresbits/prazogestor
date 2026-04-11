'use client'

import { useActionState, useState } from 'react'
import { onboardingCriarCliente, onboardingPularCliente } from '@/app/actions/onboarding'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCNPJ } from '@/lib/format'

export function ClienteForm() {
  const [state, action, pending] = useActionState(onboardingCriarCliente, null)
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
          <div className="space-y-1.5">
            <Label htmlFor="cnpj" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              CNPJ
            </Label>
            <Input
              id="cnpj"
              name="cnpj"
              value={cnpj}
              onChange={e => setCnpj(formatCNPJ(e.target.value))}
              placeholder="00.000.000/0001-00"
              required
              inputMode="numeric"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nome" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nome <span className="normal-case font-normal text-muted-foreground">(caso não encontre pelo CNPJ)</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Razão social ou nome fantasia"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="regime" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Regime tributário
            </Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="tem_empregados" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tem funcionários?
            </Label>
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

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mt-2"
          >
            {pending ? 'Gerando calendário…' : 'Gerar calendário →'}
          </button>
        </form>

        <form action={onboardingPularCliente} className="mt-3 text-center">
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
