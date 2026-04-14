'use client'

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
}

export function ClienteFormFields({
  cnpj,
  defaultValues,
  showRegimeHint = false,
}: {
  cnpj?: CnpjFieldProps
  defaultValues?: DefaultValues
  showRegimeHint?: boolean
}) {
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
            <Select name="tax_regime" defaultValue={defaultValues?.tax_regime} required>
              <SelectTrigger className="bg-muted/60">
                <SelectValue placeholder="Regime" />
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
            <Select name="has_employees" defaultValue={defaultValues?.has_employees} required>
              <SelectTrigger className="bg-muted/60">
                <SelectValue placeholder="Selecione" />
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
    </div>
  )
}
