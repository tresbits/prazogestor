'use client'

import { useActionState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { updateOffice } from '@/app/actions/configuracoes'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormError } from '@/components/ui/form-error'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export function SecaoEscritorio({ name, state }: { name: string; state: string }) {
  const [formState, action, pending] = useActionState(updateOffice, null)

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Escritório</h2>
      </div>

      <form action={action} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Nome do escritório
            </p>
            <Input name="name" defaultValue={name} required />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Estado / UF
            </p>
            <Select name="state" defaultValue={state} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map(uf => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formState?.error && <FormError message={formState.error} />}
        {formState?.success && <p className="text-xs text-green-600 dark:text-green-400">Salvo com sucesso.</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
