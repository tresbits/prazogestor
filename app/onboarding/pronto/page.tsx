import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Check, CalendarClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { cn } from '@/lib/utils'

const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

function getDiasRestantes(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDataCard(iso: string): string {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${MESES[parseInt(mes) - 1]}`
}

export default async function OnboardingProntoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: escritorio } = await supabase
    .from('offices')
    .select('id, name, onboarding_completed, onboarding_skipped_client')
    .eq('user_id', user.id)
    .single()

  if (!escritorio) redirect('/onboarding/escritorio')
  if (!escritorio.onboarding_completed) redirect('/onboarding/cliente')

  const pulou = escritorio.onboarding_skipped_client

  // Estado A: com cliente — busca próximos vencimentos
  let itens: {
    id: string
    acronym: string
    name: string
    clientName: string
    dueDate: string
    dias: number
  }[] = []

  if (!pulou) {
    const { data: proximos } = await supabase
      .from('client_obligations')
      .select(`
        id, due_date,
        obligation_templates ( acronym, name ),
        clients!inner ( name, office_id )
      `)
      .eq('clients.office_id', escritorio.id)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(3)

    itens = (proximos ?? []).map((o) => {
      const template = Array.isArray(o.obligation_templates) ? o.obligation_templates[0] : o.obligation_templates
      const client   = Array.isArray(o.clients) ? o.clients[0] : o.clients
      return {
        id: o.id,
        acronym: template?.acronym ?? '',
        name: template?.name ?? '',
        clientName: client?.name ?? '',
        dueDate: o.due_date,
        dias: getDiasRestantes(o.due_date),
      }
    })
  }

  // ── Estado B — pulou o cliente ──────────────────────────────────────────────
  if (pulou) {
    return (
      <div className="flex flex-col items-center text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <ProgressSteps current={3} skipped={[2]} completed />

        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-8">
          <CalendarClock className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none mb-4">
          Conta configurada!
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-10">
          Nenhum calendário foi gerado ainda. Cadastre seu primeiro cliente quando
          estiver pronto — as obrigações serão criadas automaticamente.
        </p>

        <Link
          href="/overview"
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Ir para o painel →
        </Link>

        <p className="text-xs text-muted-foreground/50 mt-5">
          Setup concluído com sucesso.
        </p>
      </div>
    )
  }

  // ── Estado A — cliente criado ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <Check className="h-7 w-7 text-background" strokeWidth={2.5} />
      </div>

      <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground leading-none mb-4">
        Calendário gerado!
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-10">
        Estes são os próximos vencimentos do seu cliente.
        Você receberá alertas <strong className="text-foreground">7, 3 e 1 dia</strong> antes de cada prazo.
      </p>

      {itens.length > 0 && (
        <div className="w-full flex gap-3 mb-10">
          {itens.map((item) => {
            const isUrgente = item.dias <= 7
            return (
              <div
                key={item.id}
                className="flex-1 min-w-0 bg-muted/50 border border-border rounded-2xl p-4 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    'text-[9px] font-bold tracking-widest uppercase',
                    isUrgente ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {isUrgente ? 'Urgente' : 'Programado'}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDataCard(item.dueDate)}
                  </span>
                </div>
                <p className="font-heading font-bold text-foreground text-[15px] leading-tight">
                  {item.acronym}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2 truncate">
                  {item.clientName}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <Link
        href="/overview"
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Ir para o painel →
      </Link>

      <p className="text-xs text-muted-foreground/50 mt-5">
        Setup concluído com sucesso.
      </p>
    </div>
  )
}
