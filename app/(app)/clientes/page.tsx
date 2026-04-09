import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModalNovoCliente } from './_components/modal-novo-cliente'
import { CardClienteItem } from './_components/card-cliente-item'
import type { Cliente } from '@/types'

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
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-medium text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground">{clientes?.length ?? 0} cadastrado(s)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModalNovoCliente
          trigger={
            <div className="group bg-card rounded-[16px] p-6 flex flex-col items-center justify-center gap-2
              border-2 border-dashed border-border hover:border-foreground/30
              text-muted-foreground hover:text-foreground
              transition-all duration-200 min-h-[120px] cursor-pointer">
              <span className="text-3xl font-light group-hover:scale-110 transition-transform duration-200">+</span>
              <p className="text-sm font-medium">Novo cliente</p>
            </div>
          }
        />
        {clientes?.map((cliente: Cliente) => (
          <CardClienteItem key={cliente.id} cliente={cliente} />
        ))}
      </div>
    </div>
  )
}
