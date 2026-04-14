'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCNPJ } from '@/lib/format'

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'mei',     label: 'MEI' },
]

const EMPLOYEES_OPTIONS = [
  { value: 'false', label: 'Sem funcionários' },
  { value: 'true',  label: 'Com funcionários' },
]

type CnpjFieldProps = {
  value: string
  onChange: (value: string) => void
}

type DefaultValues = {
  name?: string
  tax_regime?: string
  has_employees?: string
  email?: string
}

export function ClienteFormFields({
  cnpj,
  defaultValues,
  showRegimeHint = false,
  showEmailField = false,
}: {
  cnpj?: CnpjFieldProps
  defaultValues?: DefaultValues
  showRegimeHint?: boolean
  showEmailField?: boolean
}) {
  const [taxRegime, setTaxRegime] = useState(defaultValues?.tax_regime ?? '')
  const [hasEmployees, setHasEmployees] = useState(defaultValues?.has_employees ?? '')

  const handleTaxRegime = (v: string | null) => setTaxRegime(v ?? '')
  const handleHasEmployees = (v: string | null) => setHasEmployees(v ?? '')

  useEffect(() => {
    setTaxRegime(defaultValues?.tax_regime ?? '')
    setHasEmployees(defaultValues?.has_employees ?? '')
  }, [defaultValues?.tax_regime, defaultValues?.has_employees])

  return (
    <div className="space-y-4">
      {cnpj && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            CNPJ
          </Label>
          <Input
            name="cnpj"
            value={cnpj.value}
            onChange={e => cnpj.onChange(formatCNPJ(e.target.value))}
            placeholder="00.000.000/0001-00"
            required
            inputMode="numeric"
            minLength={18}
            maxLength={18}
            className="bg-muted/60"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Nome / Razão Social
        </Label>
        <Input
          name="name"
          placeholder="Razão social ou nome fantasia"
          defaultValue={defaultValues?.name}
          required
          className="bg-muted/60"
        />
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Regime tributário
            </Label>
            <Select name="tax_regime" value={taxRegime} onValueChange={handleTaxRegime} required>
              <SelectTrigger className="bg-muted/60">
                <SelectValue placeholder="Selecione o Regime">
                  {REGIME_OPTIONS.find(o => o.value === taxRegime)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REGIME_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Funcionários
            </Label>
            <Select name="has_employees" value={hasEmployees} onValueChange={handleHasEmployees} required>
              <SelectTrigger className="bg-muted/60">
                <SelectValue placeholder="Selecione uma opção">
                  {EMPLOYEES_OPTIONS.find(o => o.value === hasEmployees)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showRegimeHint && (
          <p className="text-xs text-muted-foreground">
            Alterar o regime regenera os vencimentos futuros.
          </p>
        )}
      </div>

      {showEmailField && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            E-mail do cliente <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </Label>
          <Input
            name="email"
            type="email"
            placeholder="email@empresa.com.br"
            defaultValue={defaultValues?.email}
            className="bg-muted/60"
          />
        </div>
      )}
    </div>
  )
}
