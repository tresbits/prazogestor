import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecaoEscritorio } from './_components/secao-escritorio'
import { SecaoConta } from './_components/secao-conta'
import { SecaoAparencia } from './_components/secao-aparencia'
import { SecaoNotificacoes } from './_components/secao-notificacoes'
import { SecaoPlano } from './_components/secao-plano'
import { SecaoZonaPerigo } from './_components/secao-zona-perigo'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('nome, estado, plano, alertas_email_ativo')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) return null

  return (
    <div className="p-2 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-3">
          Gerencie as preferências da sua conta e escritório.
        </p>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Coluna esquerda */}
        <div className="space-y-5">
          <SecaoEscritorio nome={escritorio.nome} estado={escritorio.estado} />
          <SecaoConta email={user.email!} />
          <SecaoNotificacoes alertasAtivo={escritorio.alertas_email_ativo ?? true} />
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          <SecaoAparencia />
          <SecaoPlano plano={escritorio.plano ?? 'trial'} />
          <SecaoZonaPerigo />
        </div>
      </div>
    </div>
  )
}
