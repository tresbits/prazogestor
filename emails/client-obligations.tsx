import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export type ObligationEmailItem = {
  id: string
  acronym: string
  name: string
  due_date: string // YYYY-MM-DD
  status: string
}

interface ClientObligationsProps {
  officeName: string
  clientName: string
  message: string
  obligations: ObligationEmailItem[]
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function urgencyLabel(dueDate: string, status: string): string {
  if (status === 'overdue') return 'VENCIDO'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const days = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'VENCIDO'
  if (days === 1) return 'Vence amanhã'
  return `Vence em ${days} dias`
}

function urgencyColor(dueDate: string, status: string): string {
  if (status === 'overdue') return '#dc2626'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const days = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return '#dc2626'
  if (days <= 3) return '#d97706'
  if (days <= 7) return '#ca8a04'
  return '#6b7280'
}

export function ClientObligations({
  officeName,
  clientName,
  message,
  obligations,
}: ClientObligationsProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{officeName} — Obrigações fiscais pendentes</Preview>
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
              {officeName}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
              Obrigações fiscais — {clientName}
            </Text>
          </Section>

          {/* Mensagem */}
          <Section style={{ padding: '28px 32px 0' }}>
            <Text
              style={{
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message}
            </Text>
          </Section>

          {/* Lista de obrigações */}
          <Section style={{ padding: '20px 32px 28px' }}>
            <Text
              style={{
                color: '#111827',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                marginTop: 0,
              }}
            >
              Obrigações
            </Text>

            {obligations.map((o, i) => (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: i % 2 === 0 ? '#f9fafb' : '#ffffff',
                  borderRadius: i === 0 ? '6px 6px 0 0' : i === obligations.length - 1 ? '0 0 6px 6px' : '0',
                  borderTop: i > 0 ? '1px solid #e5e7eb' : 'none',
                  border: i === 0 ? '1px solid #e5e7eb' : '0 1px 1px 1px solid #e5e7eb',
                }}
              >
                <div>
                  <Text
                    style={{
                      margin: '0 0 2px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#111827',
                    }}
                  >
                    {o.acronym}
                  </Text>
                  <Text style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {o.name}
                  </Text>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                  <Text
                    style={{
                      margin: '0 0 2px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: urgencyColor(o.due_date, o.status),
                    }}
                  >
                    {urgencyLabel(o.due_date, o.status)}
                  </Text>
                  <Text style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {formatDate(o.due_date)}
                  </Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={{ borderColor: '#e5e7eb', margin: 0 }} />

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
