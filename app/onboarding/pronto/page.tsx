import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function OnboardingProntoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('id, nome')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')

  // Busca os próximos 5 vencimentos do primeiro cliente
  const { data: proximos } = await supabase
    .from('obrigacoes_cliente')
    .select(`
      id, data_vencimento,
      obrigacoes_template ( sigla ),
      clientes!inner ( nome, escritorio_id )
    `)
    .eq('clientes.escritorio_id', escritorio.id)
    .eq('status', 'pendente')
    .gte('data_vencimento', new Date().toISOString().split('T')[0])
    .order('data_vencimento', { ascending: true })
    .limit(5)

  return (
    <>
      <ProgressSteps current={3} />

      <div className="text-center space-y-2 mb-6">
        <p className="text-3xl">🎉</p>
        <h1 className="text-xl font-bold text-gray-900">Calendário gerado!</h1>
        <p className="text-sm text-gray-500">
          Estes são os próximos vencimentos do seu cliente.
          Você receberá alertas 7, 3 e 1 dia antes de cada prazo.
        </p>
      </div>

      {proximos && proximos.length > 0 && (
        <div className="space-y-2 mb-6">
          {proximos.map((o) => {
            const template = Array.isArray(o.obrigacoes_template)
              ? o.obrigacoes_template[0]
              : o.obrigacoes_template
            const cliente = Array.isArray(o.clientes)
              ? o.clientes[0]
              : o.clientes
            const dias = getDiasRestantes(o.data_vencimento)

            return (
              <div key={o.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{template?.sigla}</p>
                  <p className="text-xs text-gray-400">{cliente?.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{formatarData(o.data_vencimento)}</p>
                  <p className="text-xs text-gray-400">{dias}d</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link href="/painel" className={cn(buttonVariants(), 'w-full justify-center')}>
        Ir para o painel →
      </Link>
    </>
  )
}
