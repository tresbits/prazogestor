# Skill: SaaS no Brasil — Especificidades

## Pagamentos em BRL

### Pagar.me (recomendado para PrazoGestor)

- Pix nativo sem configuração adicional
- Cartão de crédito/débito nacional e internacional
- Boleto bancário
- Assinaturas recorrentes com gestão de falha de cobrança
- Webhook para ativar/desativar planos automaticamente
- Taxa aproximada: 2,5% + R$0,09 por transação (cartão)

```typescript
// Webhook de assinatura ativa
// POST /api/webhooks/pagarme
async function handlePagarmeWebhook(event: PagarmeEvent) {
  if (event.type === 'subscription.paid') {
    await ativarPlano(event.data.subscription.metadata.escritorioId);
  }
  if (event.type === 'subscription.canceled') {
    await suspenderPlano(event.data.subscription.metadata.escritorioId);
  }
}
```

### Stripe (alternativa)

- Aceita BRL nativamente
- Melhor DX e documentação
- Pix via Stripe (disponível no Brasil desde 2023)
- Taxa similar: 2,9% + R$0,30

## NFS-e — Nota Fiscal de Serviço Eletrônica

Obrigatória para cada cobrança de assinatura.

### Quando emitir

- Uma NFS-e por cliente pagante por período de competência (mensal)
- Emitir até o último dia útil do mês da prestação do serviço

### Onde emitir

- Prefeitura de São Paulo: `nfe.prefeitura.sp.gov.br`
- Para automatizar: API da prefeitura ou sistema como Omie/Conta Azul (fase 2)
- No MVP: emitir manualmente (volume baixo)

### Campos obrigatórios

- CNPJ do prestador (Tresbits)
- CNPJ/CPF do tomador (escritório cliente)
- Descrição do serviço: "Licenciamento de software para gestão de calendário fiscal - [mês/ano]"
- Código de serviço: 1.05 (LC 116/2003)
- Valor
- Alíquota ISS: 2% (São Paulo)

## WhatsApp Business API para alertas

### Z-API (recomendado para MVP)

- API não oficial mas estável
- Mais simples de integrar que a API oficial do Meta
- Risco: número pode ser banido se não respeitar limites
- Uso adequado: alertas transacionais (vencimento iminente), não marketing

```typescript
// Envio de alerta via Z-API
async function enviarAlertaWhatsApp(telefone: string, mensagem: string) {
  await fetch(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: telefone, message: mensagem })
  });
}
```

### Evolution API (alternativa open source)

- Self-hosted
- Mais controle, zero custo de API
- Requer servidor próprio

### Mensagem de alerta — modelo

```
⚠️ [Escritório]: DAS do cliente [Nome] vence em 3 dias (dia 20/01).
Acesse o painel: https://prazogestor.tresbits.com/painel
```

## Consulta de CNPJ via BrasilAPI

### Regras de uso no MVP

A consulta de CNPJ é usada para enriquecer automaticamente a razão social do cliente
no momento do cadastro. O design evita abuso sem degradar a experiência do contador.

**Quando consultar**:
- Apenas no save do formulário de cadastro ou edição de cliente
- Nunca em tempo real (sem `onChange`, sem `onBlur`)
- Na tela de edição: somente via botão explícito "Atualizar dados do CNPJ"

**Comportamento esperado**:
- Encontrou: sobrescreve o nome com a razão social oficial — silencioso
- Não encontrou (404) ou API fora: salva com o nome digitado pelo contador — silencioso
- Rate limit atingido: salva sem enriquecimento — silencioso

**Casos onde o CNPJ pode não ser encontrado**:
- CNPJ muito novo (demora para aparecer na base)
- MEI recém-aberto
- Dado desatualizado na fonte da Receita Federal

### Rate limit por escritório

Limite: **30 consultas de CNPJ por dia por `escritorio_id`**.

Controlado via tabela `cnpj_rate_limit (escritorio_id, data, contagem)` com função SQL
`verificar_cnpj_rate_limit()` que faz upsert atômico e retorna `boolean`.

Justificativa do limite: um escritório com 80 clientes ativos cadastra em média
~3–5 clientes novos por semana. 30/dia é generoso para uso legítimo e restritivo
para abuso automatizado.

```typescript
// Route Handler: POST /api/clientes (e PUT /api/clientes/[id])
async function salvarCliente(data: NovoCliente, escritorioId: string) {
  let nomeFinal = data.nome;

  const { data: permitido } = await supabase
    .rpc('verificar_cnpj_rate_limit', { p_escritorio_id: escritorioId });

  if (permitido) {
    try {
      const cnpjData = await buscarCNPJ(data.cnpj);
      if (cnpjData?.razao_social) {
        nomeFinal = cnpjData.razao_social;
      }
    } catch {
      // não encontrado ou API indisponível — segue com nome digitado
    }
  }

  return await supabase.from('clientes').insert({
    ...data,
    nome: nomeFinal,
    escritorio_id: escritorioId,
  });
}
```

### Função de busca

```typescript
async function buscarCNPJ(cnpj: string) {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
  if (!res.ok) throw new Error('CNPJ não encontrado');
  const data = await res.json();
  return {
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    situacao: data.descricao_situacao_cadastral,
    cnae_principal: data.cnae_fiscal_descricao,
    porte: data.porte
  };
}
```

## Sincronização de feriados via BrasilAPI

Feriados não são consultados em tempo real. São sincronizados manualmente
e persistidos na tabela `feriados` do Supabase.

**Quando rodar**: uma vez em janeiro de cada ano + sempre que houver decreto de
feriado extra (ex: feriados municipais decretados em cima da hora).

**Endpoint**: `GET https://brasilapi.com.br/api/feriados/v1/{ano}`

```typescript
// Script de sincronização — rodar manualmente
// npx tsx scripts/sync-feriados.ts 2026
async function sincronizarFeriados(ano: number) {
  const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
  if (!res.ok) throw new Error(`Erro ao buscar feriados de ${ano}`);

  const feriados = await res.json();

  const rows = feriados.map((f: { date: string; name: string; type: string }) => ({
    data: f.date,
    descricao: f.name,
    tipo: 'nacional' as const,
  }));

  const { error } = await supabase
    .from('feriados')
    .upsert(rows, { onConflict: 'data' });

  if (error) throw error;
  console.log(`${rows.length} feriados de ${ano} sincronizados.`);
}
```

**Cobertura**: apenas feriados nacionais no MVP.
Feriados estaduais e municipais entram na fase 2 via FeriadosAPI.com.

## Formatação de dados brasileiros

```typescript
// CNPJ: 00.000.000/0000-00
function formatarCNPJ(cnpj: string): string {
  const c = cnpj.replace(/\D/g, '');
  return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Data no padrão BR: DD/MM/AAAA
function formatarData(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

// Moeda: R$ 1.470,00
function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
```

## LGPD — considerações para o produto

O produto armazena dados de CNPJs e e-mails de escritórios e seus clientes.
Obrigações mínimas:
- Política de privacidade clara no site
- Consentimento para envio de alertas (e-mail e WhatsApp)
- **Link de descadastro obrigatório em todos os e-mails de alerta**
- Não compartilhar dados de clientes entre escritórios (RLS garante isso)
- Direito de exclusão: endpoint para deletar conta e dados associados
