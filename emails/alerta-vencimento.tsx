import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type AlertType = '7d' | '3d' | '1d'

interface AlertaVencimentoProps {
  officeName: string
  clientName: string
  clientCnpj: string
  obligationAcronym: string
  obligationName: string
  dueDate: string // DD/MM/YYYY
  alertType: AlertType
  urlPainel: string
  urlDescadastrar: string
}

const TITULO: Record<AlertType, string> = {
  '7d': 'Vencimento em 7 dias',
  '3d': 'Vencimento em 3 dias',
  '1d': 'Vencimento amanhã',
}

const COR: Record<AlertType, string> = {
  '7d': '#6b7280',
  '3d': '#d97706',
  '1d': '#dc2626',
}

export function AlertaVencimento({
  officeName,
  clientName,
  clientCnpj,
  obligationAcronym,
  obligationName,
  dueDate,
  alertType,
  urlPainel,
  urlDescadastrar,
}: AlertaVencimentoProps) {
  const titulo = TITULO[alertType]
  const cor = COR[alertType]
  const cnpjFormatado = clientCnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{titulo} — {obligationAcronym} · {clientName}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>

          {/* Header */}
          <Section style={{ backgroundColor: cor, padding: '20px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              ⚠ {titulo}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px' }}>
            <Text style={{ color: '#374151', fontSize: '14px', marginTop: 0 }}>
              Olá, <strong>{officeName}</strong>.
            </Text>

            <Text style={{ color: '#374151', fontSize: '14px' }}>
              A obrigação abaixo vence em <strong>{dueDate}</strong>:
            </Text>

            {/* Card da obrigação */}
            <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
              <Text style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                {obligationAcronym}
              </Text>
              <Text style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                {obligationName}
              </Text>
              <Hr style={{ borderColor: '#e5e7eb', margin: '12px 0' }} />
              <Text style={{ margin: '0 0 2px', fontSize: '13px', color: '#374151' }}>
                <strong>Cliente:</strong> {clientName}
              </Text>
              <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                CNPJ: {cnpjFormatado}
              </Text>
            </Section>

            <Button
              href={urlPainel}
              style={{
                backgroundColor: '#111827',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '8px',
              }}
            >
              Ver no painel →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ borderTop: '1px solid #e5e7eb', padding: '20px 32px', backgroundColor: '#f9fafb' }}>
            <Text style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              PrazoGestor · Tresbits Serviços de Informática LTDA
            </Text>
            <Text style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>
              Não deseja mais receber estes alertas?{' '}
              <Link href={urlDescadastrar} style={{ color: '#6b7280' }}>
                Cancelar inscrição
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
