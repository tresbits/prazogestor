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

export interface ObrigacaoDigest {
  tipo: TipoAlerta
  sigla: string
  nome: string
  clienteNome: string
  dataVencimento: string // DD/MM/YYYY
}

interface AlertaDigestProps {
  escritorioNome: string
  obrigacoes: ObrigacaoDigest[]
  urlPainel: string
  urlDescadastrar: string
}

const TIPO_LABEL: Record<TipoAlerta, string> = {
  '1d': 'Amanhã',
  '3d': 'Em 3 dias',
  '7d': 'Em 7 dias',
}

const TIPO_COR: Record<TipoAlerta, string> = {
  '1d': '#dc2626',
  '3d': '#d97706',
  '7d': '#6b7280',
}

const TIPO_ORDER: TipoAlerta[] = ['1d', '3d', '7d']

export function AlertaDigest({
  escritorioNome,
  obrigacoes,
  urlPainel,
  urlDescadastrar,
}: AlertaDigestProps) {
  const total = obrigacoes.length
  const porTipo = TIPO_ORDER.reduce<Record<TipoAlerta, ObrigacaoDigest[]>>(
    (acc, tipo) => {
      acc[tipo] = obrigacoes.filter(o => o.tipo === tipo)
      return acc
    },
    { '1d': [], '3d': [], '7d': [] }
  )

  const previewText = total === 1
    ? `${obrigacoes[0].sigla} · ${obrigacoes[0].clienteNome} vence ${TIPO_LABEL[obrigacoes[0].tipo].toLowerCase()}`
    : `${total} vencimentos próximos — ${escritorioNome}`

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#111827', padding: '20px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              ⚠ Resumo de vencimentos
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
              {total} {total === 1 ? 'obrigação' : 'obrigações'} · {escritorioNome}
            </Text>
          </Section>

          {/* Grupos por urgência */}
          <Section style={{ padding: '24px 32px 8px' }}>
            {TIPO_ORDER.filter(tipo => porTipo[tipo].length > 0).map((tipo, idx) => (
              <Section key={tipo} style={{ marginBottom: '20px' }}>
                {/* Label do grupo */}
                <Text style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: TIPO_COR[tipo],
                  margin: idx === 0 ? '0 0 10px' : '0 0 10px',
                }}>
                  {TIPO_LABEL[tipo]}
                </Text>

                {/* Linhas de obrigação */}
                {porTipo[tipo].map((ob, i) => (
                  <Section
                    key={i}
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      marginBottom: '6px',
                      borderLeft: `3px solid ${TIPO_COR[tipo]}`,
                    }}
                  >
                    <Text style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>
                      {ob.sigla}
                      <span style={{ fontWeight: 'normal', color: '#6b7280' }}>
                        {' '}· {ob.clienteNome}
                      </span>
                    </Text>
                    <Text style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                      {ob.nome} · vence em {ob.dataVencimento}
                    </Text>
                  </Section>
                ))}
              </Section>
            ))}
          </Section>

          {/* CTA */}
          <Section style={{ padding: '0 32px 32px' }}>
            <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 24px' }} />
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
