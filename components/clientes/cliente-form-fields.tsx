'use client'

import { useEffect, useState, useTransition } from 'react'
import { Search, Loader2, RefreshCw, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCNPJ } from '@/lib/format'
import { lookupCnpj, lookupCep } from '@/app/actions/clientes'
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

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

type CnpjFieldProps = {
  value: string
  onChange: (value: string) => void
}

type DefaultValues = {
  name?: string
  tax_regime?: string
  has_employees?: string
  email?: string
  contact_name?: string
  contact_phone?: string
  contact_email_is_contact?: boolean
  has_address?: boolean
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
}

export function ClienteFormFields({
  cnpj,
  cnpjForLookup,
  defaultValues,
  showRegimeHint = false,
}: {
  cnpj?: CnpjFieldProps
  cnpjForLookup?: string
  defaultValues?: DefaultValues
  showRegimeHint?: boolean
}) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [taxRegime, setTaxRegime] = useState(defaultValues?.tax_regime ?? '')
  const [hasEmployees, setHasEmployees] = useState(defaultValues?.has_employees ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')

  // Contact
  const [contactName, setContactName] = useState(defaultValues?.contact_name ?? '')
  const [contactPhone, setContactPhone] = useState(defaultValues?.contact_phone ?? '')
  const [contactEmailIsContact, setContactEmailIsContact] = useState(defaultValues?.contact_email_is_contact ?? false)

  // Address
  const [hasAddress, setHasAddress] = useState(defaultValues?.has_address ?? false)
  const [addressStreet, setAddressStreet] = useState(defaultValues?.address_street ?? '')
  const [addressNumber, setAddressNumber] = useState(defaultValues?.address_number ?? '')
  const [addressComplement, setAddressComplement] = useState(defaultValues?.address_complement ?? '')
  const [addressNeighborhood, setAddressNeighborhood] = useState(defaultValues?.address_neighborhood ?? '')
  const [addressCity, setAddressCity] = useState(defaultValues?.address_city ?? '')
  const [addressState, setAddressState] = useState(defaultValues?.address_state ?? '')
  const [addressZip, setAddressZip] = useState(
    defaultValues?.address_zip ? formatCEP(defaultValues.address_zip) : ''
  )
  const [cepStatus, setCepStatus] = useState<'idle' | 'not_found'>('idle')

  const [isPending, startTransition] = useTransition()
  const [isCepPending, startCepTransition] = useTransition()
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'not_found' | 'rate_limit'>('idle')
  const [lastLookedUp, setLastLookedUp] = useState('')

  const handleTaxRegime = (v: string | null) => setTaxRegime(v ?? '')
  const handleHasEmployees = (v: string | null) => setHasEmployees(v ?? '')

  useEffect(() => {
    setName(defaultValues?.name ?? '')
    setTaxRegime(defaultValues?.tax_regime ?? '')
    setHasEmployees(defaultValues?.has_employees ?? '')
    setEmail(defaultValues?.email ?? '')
    setContactName(defaultValues?.contact_name ?? '')
    setContactPhone(defaultValues?.contact_phone ?? '')
    setContactEmailIsContact(defaultValues?.contact_email_is_contact ?? false)
    setHasAddress(defaultValues?.has_address ?? false)
    setAddressStreet(defaultValues?.address_street ?? '')
    setAddressNumber(defaultValues?.address_number ?? '')
    setAddressComplement(defaultValues?.address_complement ?? '')
    setAddressNeighborhood(defaultValues?.address_neighborhood ?? '')
    setAddressCity(defaultValues?.address_city ?? '')
    setAddressState(defaultValues?.address_state ?? '')
    setAddressZip(defaultValues?.address_zip ? formatCEP(defaultValues.address_zip) : '')
  }, [
    defaultValues?.name, defaultValues?.tax_regime, defaultValues?.has_employees,
    defaultValues?.email, defaultValues?.contact_name, defaultValues?.contact_phone,
    defaultValues?.contact_email_is_contact, defaultValues?.has_address,
    defaultValues?.address_street, defaultValues?.address_number,
    defaultValues?.address_complement, defaultValues?.address_neighborhood,
    defaultValues?.address_city, defaultValues?.address_state, defaultValues?.address_zip,
  ])

  useEffect(() => {
    setLookupStatus('idle')
  }, [cnpj?.value])

  const cnpjRaw = cnpj?.value.replace(/\D/g, '') ?? ''
  const canLookup = cnpjRaw.length === 14 && cnpjRaw !== lastLookedUp && !isPending
  const canRefresh = !!cnpjForLookup && !isPending

  const cepDigits = addressZip.replace(/\D/g, '')
  const canCepLookup = cepDigits.length === 8 && !isCepPending

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

  function handleCepLookup() {
    setCepStatus('idle')
    startCepTransition(async () => {
      const result = await lookupCep(cepDigits)
      if ('error' in result) {
        setCepStatus('not_found')
        return
      }
      if (result.street)       setAddressStreet(result.street)
      if (result.neighborhood) setAddressNeighborhood(result.neighborhood)
      if (result.city)         setAddressCity(result.city)
      if (result.state)        setAddressState(result.state)
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

      {/* ── Contato ──────────────────────────────────────────────────────────── */}
      <div className="pt-2 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Contato
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nome do responsável
            </Label>
            <Input
              name="contact_name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Nome (opcional)"
              className="bg-muted/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Telefone
            </Label>
            <Input
              name="contact_phone"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              className="bg-muted/60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            E-mail <span className="font-normal normal-case tracking-normal">(opcional)</span>
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

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={contactEmailIsContact}
            onChange={e => setContactEmailIsContact(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
          />
          <input type="hidden" name="contact_email_is_contact" value={contactEmailIsContact ? 'true' : 'false'} />
          <span className="text-[12px] text-muted-foreground">
            Usar como e-mail de contato direto
          </span>
        </label>
      </div>

      {/* ── Endereço ─────────────────────────────────────────────────────────── */}
      <div className="pt-2 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasAddress}
            onChange={e => setHasAddress(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
          />
          <input type="hidden" name="has_address" value={hasAddress ? 'true' : 'false'} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Possui endereço?
          </span>
        </label>

        {hasAddress && (
          <div className="space-y-3">
            {/* CEP */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                CEP *
              </Label>
              <div className="flex gap-2">
                <Input
                  name="address_zip"
                  value={addressZip}
                  onChange={e => { setAddressZip(formatCEP(e.target.value)); setCepStatus('idle') }}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  required
                  className="bg-muted/60"
                />
                <button
                  type="button"
                  onClick={handleCepLookup}
                  disabled={!canCepLookup}
                  title="Buscar endereço pelo CEP"
                  className={cn(
                    'shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                    'border border-border bg-muted/60',
                    canCepLookup
                      ? 'hover:bg-muted hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                      : 'opacity-40 cursor-not-allowed text-muted-foreground'
                  )}
                >
                  {isCepPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MapPin className="h-4 w-4" />
                  }
                </button>
              </div>
              {cepStatus === 'not_found' && (
                <p className="text-[11px] text-muted-foreground">
                  CEP não encontrado. Preencha o endereço manualmente.
                </p>
              )}
            </div>

            {/* Logradouro + Número */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Logradouro *
                </Label>
                <Input
                  name="address_street"
                  value={addressStreet}
                  onChange={e => setAddressStreet(e.target.value)}
                  placeholder="Rua, Avenida…"
                  required
                  className="bg-muted/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Número *
                </Label>
                <Input
                  name="address_number"
                  value={addressNumber}
                  onChange={e => setAddressNumber(e.target.value)}
                  placeholder="123"
                  required
                  className="bg-muted/60"
                />
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Complemento
                </Label>
                <Input
                  name="address_complement"
                  value={addressComplement}
                  onChange={e => setAddressComplement(e.target.value)}
                  placeholder="Sala, apto…"
                  className="bg-muted/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Bairro
                </Label>
                <Input
                  name="address_neighborhood"
                  value={addressNeighborhood}
                  onChange={e => setAddressNeighborhood(e.target.value)}
                  placeholder="Bairro"
                  className="bg-muted/60"
                />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Cidade *
                </Label>
                <Input
                  name="address_city"
                  value={addressCity}
                  onChange={e => setAddressCity(e.target.value)}
                  placeholder="São Paulo"
                  required
                  className="bg-muted/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  UF *
                </Label>
                <Input
                  name="address_state"
                  value={addressState}
                  onChange={e => setAddressState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                  required
                  className="bg-muted/60 uppercase"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
