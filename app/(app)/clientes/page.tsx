import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModalNovoCliente } from './_components/modal-novo-cliente'
import { CardClienteItem } from './_components/card-cliente-item'
import type { Client } from '@/types'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!office) return null

  const query = supabase
    .from('clients')
    .select('*')
    .eq('office_id', office.id)
    .order('name', { ascending: true })

  if (q?.trim()) query.ilike('name', `%${q.trim()}%`)

  const { data: clients } = await query

  return (
    <div className="space-y-6">
      <div className='p-2'>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none">Clientes</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2 py-3">
          Gerencie sua base de clientes. {`${clients?.length ?? 0} ${q?.trim() ? `resultado(s)` : `cadastrado(s)`}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModalNovoCliente
          trigger={
            <div className="group bg-background rounded-[16px] p-6 flex flex-col items-center justify-center gap-2
              border-2 border-dashed border-border hover:border-foreground/30
              text-muted-foreground hover:text-foreground
              transition-all duration-200 min-h-[120px] cursor-pointer">
              <span className="text-3xl font-light group-hover:scale-110 transition-transform duration-200">+</span>
              <p className="text-sm font-medium">Novo cliente</p>
            </div>
          }
        />
        {clients?.map((client: Client) => (
          <CardClienteItem key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}
