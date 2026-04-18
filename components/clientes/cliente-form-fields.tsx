'use client'

import { useEffect, useState, useTransition } from 'react'
import { Search, Loader2, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCNPJ } from '@/lib/format'
import { lookupCnpj } from '@/app/actions/clientes'
import { cn } from '@/lib/utils'

const REGIME_OPTIONS = [
  { value: 'simples',          label: 'Simples Nacional' },
  { value: 'mei',              label: 'MEI' },
  { value: 'lucro_presumido',  label: 'Lucro Presumido' },
  { value: 'lucro_real',       label: 'Lucro Real' },
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
  cnpjForLookup,
  defaultValues,
  showRegimeHint = false,
  showEmailField = false,
}: {
  cnpj?: CnpjFieldProps
  cnpjForLookup?: string
  defaultValues?: DefaultValues
  showRegimeHint?: boolean
  showEmailField?: boolean
}) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [taxRegime, setTaxRegime] = useState(defaultValues?.tax_regime ?? '')
  const [hasEmployees, setHasEmployees] = useState(defaultValues?.has_employees ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')

  const [isPending, startTransition] = useTransition()
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'not_found' | 'rate_limit'>('idle')
  const [lastLookedUp, setLastLookedUp] = useState('')

  const handleTaxRegime = (v: string | null) => setTaxRegime(v ?? '')
  const handleHasEmployees = (v: string | null) => setHasEmployees(v ?? '')

  useEffect(() => {
    setName(defaultValues?.name ?? '')
    setTaxRegime(defaultValues?.tax_regime ?? '')
    setHasEmployees(defaultValues?.has_employees ?? '')
    setEmail(defaultValues?.email ?? '')
  }, [defaultValues?.name, defaultValues?.tax_regime, defaultValues?.has_employees, defaultValues?.email])

  // Reseta o status quando o CNPJ muda
  useEffect(() => {
    setLookupStatus('idle')
  }, [cnpj?.value])

  const cnpjRaw = cnpj?.value.replace(/\D/g, '') ?? ''
  const canLookup = cnpjRaw.length === 14 && cnpjRaw !== lastLookedUp && !isPending
  const canRefresh = !!cnpjForLookup && !isPending

  function handleLookup(rawCnpj: string) {
    setLookupStatus('idle')
    startTransition(async () => {
      const result = await lookupCnpj(rawCnpj)
      if ('name' in result) {
        setName(result.name)
        setLastLookedUp(rawCnpj)
        setLookupStatus('idle')
      } else {
        setLookupStatus(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {cnpj && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            CNPJ
          </Label>
          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={() => handleLookup(cnpjRaw)}
              disabled={!canLookup}
              title="Buscar razão social pelo CNPJ"
              className={cn(
                'shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                'border border-border bg-muted/60',
                canLookup
                  ? 'hover:bg-muted hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                  : 'opacity-40 cursor-not-allowed text-muted-foreground'
              )}
            >
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Search className="h-4 w-4" />
              }
            </button>
          </div>
          {lookupStatus === 'not_found' && (
            <p className="text-[11px] text-muted-foreground">
              CNPJ não encontrado na Receita. Digite o nome manualmente.
            </p>
          )}
          {lookupStatus === 'rate_limit' && (
            <p className="text-[11px] text-amber-500">
              Limite de consultas atingido. Digite o nome manualmente.
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Nome / Razão Social
        </Label>
        <Input
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Busque pelo CNPJ ou digite"
          required
          className="bg-muted/60"
        />
        {cnpjForLookup && (
          <div className="flex items-center justify-between">
            <div>
              {lookupStatus === 'not_found' && (
                <p className="text-[11px] text-muted-foreground">
                  CNPJ não encontrado na Receita.
                </p>
              )}
              {lookupStatus === 'rate_limit' && (
                <p className="text-[11px] text-amber-500">
                  Limite de consultas atingido.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleLookup(cnpjForLookup.replace(/\D/g, ''))}
              disabled={!canRefresh}
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium transition-colors',
                canRefresh
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 cursor-not-allowed'
              )}
            >
              {isPending
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <RefreshCw className="h-3 w-3" />
              }
              Atualizar dados do CNPJ
            </button>
          </div>
        )}
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
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-muted/60"
          />
        </div>
      )}
    </div>
  )
}
