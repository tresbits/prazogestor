import { createServiceClient } from '@/lib/supabase/service'
import { AuthShell } from '@/app/(auth)/_components/auth-shell'
import { InviteForm } from './_components/invite-form'

export default async function AceitarConvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <AuthShell panelTitle={<>Portal do<br />Cliente</>}>
        <InvalidInvite message="Link de convite inválido." />
      </AuthShell>
    )
  }

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select('id, name, email, portal_enabled, portal_invite_sent_at, offices ( name )')
    .eq('portal_invite_token', token)
    .single()

  if (!client) {
    return (
      <AuthShell panelTitle={<>Portal do<br />Cliente</>}>
        <InvalidInvite message="Convite inválido ou já utilizado." />
      </AuthShell>
    )
  }

  if (client.portal_enabled) {
    return (
      <AuthShell panelTitle={<>Portal do<br />Cliente</>}>
        <InvalidInvite
          message="Este convite já foi aceito."
          hint="Acesse o portal pelo link de login."
          loginHref="/portal/login"
        />
      </AuthShell>
    )
  }

  if (client.portal_invite_sent_at) {
    const sent = new Date(client.portal_invite_sent_at)
    const expired = (Date.now() - sent.getTime()) > 7 * 24 * 60 * 60 * 1000
    if (expired) {
      return (
        <AuthShell panelTitle={<>Portal do<br />Cliente</>}>
          <InvalidInvite
            message="Este convite expirou (válido por 7 dias)."
            hint="Solicite um novo convite ao seu escritório."
          />
        </AuthShell>
      )
    }
  }

  const office = Array.isArray(client.offices) ? client.offices[0] : client.offices
  const officeName = office?.name ?? 'seu escritório'

  return (
    <AuthShell
      panelTitle={<>Portal do<br />Cliente</>}
      panelTagline="Acompanhe suas obrigações fiscais em tempo real, com prazos e valores atualizados pelo seu escritório."
    >
      <InviteForm
        token={token}
        clientEmail={client.email ?? ''}
        clientName={client.name}
        officeName={officeName}
      />
    </AuthShell>
  )
}

function InvalidInvite({
  message,
  hint,
  loginHref,
}: {
  message: string
  hint?: string
  loginHref?: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Convite inválido</h2>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
        {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
      </div>
      {loginHref && (
        <a
          href={loginHref}
          className="inline-block px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Ir para o login
        </a>
      )}
    </div>
  )
}
