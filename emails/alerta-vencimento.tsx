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

type TipoAlerta = '7d' | '3d' | '1d'

interface AlertaVencimentoProps {
  escritorioNome: string
  clienteNome: string
  clienteCnpj: string
  obrigacaoSigla: string
  obrigacaoNome: string
  dataVencimento: string // DD/MM/YYYY
  tipoAlerta: TipoAlerta
  urlPainel: string
  urlDescadastrar: string
}

const TITULO: Record<TipoAlerta, string> = {
  '7d': 'Vencimento em 7 dias',
  '3d': 'Vencimento em 3 dias',
  '1d': 'Vencimento amanhã',
}

const COR: Record<TipoAlerta, string> = {
  '7d': '#6b7280',
  '3d': '#d97706',
  '1d': '#dc2626',
}

export function AlertaVencimento({
  escritorioNome,
  clienteNome,
  clienteCnpj,
  obrigacaoSigla,
  obrigacaoNome,
  dataVencimento,
  tipoAlerta,
  urlPainel,
  urlDescadastrar,
}: AlertaVencimentoProps) {
  const titulo = TITULO[tipoAlerta]
  const cor = COR[tipoAlerta]
  const cnpjFormatado = clienteCnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{titulo} — {obrigacaoSigla} · {clienteNome}</Preview>
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
              Olá, <strong>{escritorioNome}</strong>.
            </Text>

            <Text style={{ color: '#374151', fontSize: '14px' }}>
              A obrigação abaixo vence em <strong>{dataVencimento}</strong>:
            </Text>

            {/* Card da obrigação */}
            <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
              <Text style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                {obrigacaoSigla}
              </Text>
              <Text style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                {obrigacaoNome}
              </Text>
              <Hr style={{ borderColor: '#e5e7eb', margin: '12px 0' }} />
              <Text style={{ margin: '0 0 2px', fontSize: '13px', color: '#374151' }}>
                <strong>Cliente:</strong> {clienteNome}
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
