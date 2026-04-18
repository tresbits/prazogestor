import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PortalInviteProps {
  officeName: string
  clientName: string
  inviteUrl: string
}

export function PortalInvite({ officeName, clientName, inviteUrl }: PortalInviteProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{officeName} te convidou para acessar o portal PrazoGestor</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0 }}>
        <Container
          style={{
            maxWidth: '520px',
            margin: '40px auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header */}
          <Section style={{ backgroundColor: '#111827', padding: '20px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              PrazoGestor
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
              Convite para o portal — {clientName}
            </Text>
          </Section>

          {/* Corpo */}
          <Section style={{ padding: '32px 32px 16px' }}>
            <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px' }}>
              Olá, {clientName}!
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              O escritório <strong>{officeName}</strong> te convidou para acessar o portal de obrigações fiscais.
              Pelo portal você pode acompanhar em tempo real os prazos e valores das suas obrigações — sem precisar
              entrar em contato com o escritório.
            </Text>

            <Button
              href={inviteUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#111827',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Criar minha conta
            </Button>
          </Section>

          {/* Aviso de expiração */}
          <Section style={{ padding: '16px 32px 0' }}>
            <Text style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              Este link é válido por 7 dias. Se você não esperava receber este convite, pode ignorar este e-mail.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0 0' }} />

          {/* Footer */}
          <Section style={{ padding: '20px 32px', backgroundColor: '#f9fafb' }}>
            <Text style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Enviado por {officeName} via PrazoGestor · Tresbits Serviços de Informática LTDA
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
