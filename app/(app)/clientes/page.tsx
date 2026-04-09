import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ModalEditarCliente } from './_components/modal-editar-cliente'
import { ModalNovoCliente } from './_components/modal-novo-cliente'
import type { Cliente } from '@/types'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
}

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('escritorio_id', escritorio.id)
    .order('nome', { ascending: true })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes?.length ?? 0} cadastrado(s)</p>
        </div>
        <ModalNovoCliente
          trigger={
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 active:scale-95 transition-all">
              + Novo cliente
            </button>
          }
        />
      </div>

      {!clientes?.length ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map((cliente: Cliente) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {cliente.cnpj.replace(
                    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                    '$1.$2.$3/$4-$5'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{REGIME_LABEL[cliente.regime] ?? cliente.regime}</Badge>
                  {cliente.tem_empregados && (
                    <Badge variant="outline">Com empregados</Badge>
                  )}
                </div>
                <ModalEditarCliente cliente={cliente} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
