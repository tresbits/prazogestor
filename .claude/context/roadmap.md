# Contexto — Roadmap e Decisões · PrazoGestor

## Metas

| Marco | Prazo | Meta |
|---|---|---|
| Beta no ar | Semana 6 | 10 escritórios usando (grátis) |
| Primeiros pagantes | Semana 12 | 10 escritórios × R$147 = **R$1.470 MRR** |
| Crescimento | Mês 6 | 30 escritórios × R$167 = **R$5.010 MRR** |
| Consolidação | Mês 9 | 60 escritórios × R$187 = **R$11.220 MRR** |
| Ano 1 | Mês 12 | 100 escritórios × R$200 = **R$20.000 MRR** |

---

## Roadmap sprint-a-sprint

### Semanas 1–2 · Fundação

- [x] Repositório Next.js 14 criado, Supabase configurado
- [x] Subdomínio configurado no Vercel: `prazogestor.tresbits.com`
- [ ] Domínio `prazogestor.com.br` — registrar ao atingir primeiros pagantes (~R$40/ano)
- [x] Schema SQL completo (tabelas em inglês: `offices`, `clients`, `obligation_templates`, `client_obligations`, `alerts_log`)
- [x] RLS habilitado em todas as tabelas com políticas de isolamento por escritório
- [x] Seed das obrigações do Simples Nacional e MEI em `obligation_templates`
- [x] **Tabela `holidays`** — feriados nacionais 2026/2027 populados via BrasilAPI
- [x] **Tabela `cnpj_rate_limit`** — suporte a rate limit por escritório
- [ ] Landing page com lista de espera
- [ ] Entrevistar 5 contadores conhecidos (ver `@commands/entrevista-beta.md`)

### Semana 3 · Auth + cadastro

- [x] Auth com Supabase: criar conta, confirmar e-mail, login, recuperar senha
- [x] Telas de auth redesenhadas — layout split com painel escuro, tela esqueci-senha
- [x] Tela de cadastro de escritório (nome, estado)
- [x] Formulário de cadastro de cliente: CNPJ, nome, regime, tem empregados
- [x] Componente `ClienteFormFields` compartilhado — onboarding, modal novo e editar
- [x] **Consulta BrasilAPI via botão lupa** — busca manual no cadastro; campo nome preenchido pelo usuário sem override silencioso
- [x] **Rate limit de CNPJ** — 30 consultas/dia por escritório via `cnpj_rate_limit`
- [x] **Botão "Atualizar dados do CNPJ"** na tela de edição de cliente

### Semana 4 · Geração de obrigações + painel

- [x] Função `gerarVencimentos` — gera `client_obligations` ao cadastrar/editar cliente
- [x] Vercel Cron mensal — regenera vencimentos futuros
- [x] Ajuste automático de datas por feriados nacionais usando tabela `holidays`
- [x] Painel redesenhado: ZonaNumeros (vencidos/hoje/7dias) + grid de cards por cliente
- [x] Paginação client-side no painel (12 cards, carregar mais)
- [x] Atalho para calendário na ZonaNumeros
- [x] **Filtro por cliente** — busca Spotlight global (⌘K) filtra painel, clientes e calendário
- [x] Código de cor por urgência: vermelho (hoje/atrasado), amarelo (≤ 3 dias), neutro (demais)
- [x] Botão "Concluir" — registra responsável, data/hora, muda status

### Semana 5 · Alertas por e-mail

- [x] pg_cron diário às 8h — verifica vencimentos em 7, 3 e 1 dia, exclui já alertados
- [x] pg_cron diário — marca obrigações com data passada como `overdue`
- [x] Template de e-mail com react-email + Resend
- [x] Webhook de confirmação de envio (Resend → `alerts_log.email_sent_at`)
- [x] **Link de descadastro de e-mail obrigatório no template** (LGPD — obrigatório antes do beta)
- [ ] Teste end-to-end com CNPJs fictícios

### Semana 6 · Onboarding + polish

- [x] Onboarding guiado em 3 telas: escritório → primeiro cliente → calendário gerado
- [x] Guards de onboarding centralizados no layout
- [x] Checklist de onboarding no painel (dismissível)
- [x] Empty state no painel com ModalNovoCliente
- [x] Loading states (skeletons) no painel e clientes
- [x] Mensagens de erro claras — sem "something went wrong"
- [ ] Convidar 10 escritórios para o beta
- [ ] Onboarding manual: cadastrar clientes deles por videochamada

### Semana 7 · Qualidade e padronização

- [x] **Migração PT→EN no código e schema** — tabelas, colunas e variáveis em inglês; pastas de rotas mantidas em PT (URLs visíveis); UI permanece em PT
- [x] **Responsividade mobile** — bottom nav, sidebar oculta, modais e cards ajustados
- [x] **Mensagens de erro claras** — tratar casos concretos nos formulários e actions
- [x] **Botão "Atualizar dados do CNPJ"** na tela de edição de cliente
- [x] **Link de descadastro de e-mail** no template de alerta (LGPD)

### Semanas 8–9 · Expansão de regimes + envio ao cliente

- [x] **Lucro Presumido / Lucro Real** — seed de obrigações + suporte em `gerarVencimentos` + constraint do banco atualizado
- [x] **Revisão da página de prazos por cliente** (`/clientes/[id]/prazos`) — design e completude
- [x] **Envio manual de e-mail ao cliente** — contador seleciona obrigações e envia com mensagem customizada

### Semanas 9–10 · Iteração com betas

- [ ] Ligação semanal de 30 min com cada beta: "o que usou? o que travou?"
- [ ] Implementar top 3 melhorias pedidas
- [ ] Priorizar bugs e problemas de usabilidade antes de novas features
- [ ] Coletar sinais: uso espontâneo, linguagem de posse ("meu sistema"), indicações

### Semanas 11–12 · Pagamentos

- [ ] Integrar Pagar.me (Pix) ou Stripe
- [ ] Planos configurados no painel
- [ ] Teste de checkout completo
- [ ] Billing automático mensal

### Semana 12 · Lançamento pago

- [ ] Converter betas que usaram para plano pago
- [ ] Ativar Google Ads com R$500 de teste
- [ ] Post LinkedIn/Instagram anunciando lançamento
- [ ] Meta: R$1.470 MRR

---

## Funcionalidades fora do MVP (fase 2+)

Decisão registrada — não construir antes de ter os primeiros pagantes:

- Export Google Calendar (.ics)
- Notas por obrigação (campo livre)
- Histórico de entregas como tela separada (coberto pelo filtro "concluídas" no painel)
- Alertas por WhatsApp
- Portal do cliente
- Integração com e-CAC
- Download de guias (DARF)
- Cálculo de impostos

---

## Fase 2 · Pós product-market fit

### App Admin (interno)

App separado (`admin.prazogestor.com.br`) para operação interna da Tresbits:
- Visão geral de escritórios, planos e MRR
- Gerenciamento de assinaturas e trial
- Impersonation de conta para suporte
- Métricas de uso (onboarding_concluido, onboarding_pulou_cliente, retenção)
- Controle de feature flags por plano
- Log de alertas enviados e erros

**Quando construir:** a partir de ~20 escritórios pagantes, quando o suporte manual por Supabase Dashboard virar gargalo. Antes disso, queries diretas no Supabase são suficientes.

**Stack:** app Next.js separado, mesmo Supabase, service role key protegida por auth própria (não compartilha auth com o produto principal).

---

### App Mobile

App nativo ou PWA para acesso mobile ao PrazoGestor:
- Visualização de vencimentos do dia/semana
- Receber push notifications de prazos (7, 3, 1 dia)
- Marcar obrigação como concluída
- Leitura de dados — não necessariamente criação/edição

**Quando construir:** após validação do produto no desktop e sinal claro de demanda mobile dos betas. A responsividade básica (semana 7) cobre o acesso mobile no curto prazo.

**Stack a decidir:** React Native (Expo) para reutilizar lógica TypeScript, ou PWA com service workers se o escopo de push for suficiente.

---

### Integração com Sistemas Contábeis (fase 3)

Integração bidirecional com plataformas de gestão contábil:
- **Importação de clientes** — sincronizar base de clientes de sistemas como Domínio, Alterdata, Questor, Omie, ContaAzul, evitando cadastro manual
- **Exportação de status** — devolver status de obrigações concluídas para o sistema de origem
- **Balancetes e documentos** — segunda etapa, após validação da integração básica

**Quando construir:** após atingir ~50 escritórios pagantes e receber demanda recorrente de integração. É um diferencial competitivo forte mas de alta complexidade técnica (cada sistema tem API própria ou requer scraping).

**Priorizar por volume:** Domínio e Alterdata dominam o mercado de escritórios pequenos/médios no Brasil.

---

## Decisões tomadas

### Produto

| Decisão | Escolha | Motivo |
|---|---|---|
| Moeda | BRL (Real) | Clientes BR, pagam em Pix/cartão nacional |
| Mercado | Brasil (foco nacional) | Calendário fiscal BR não tem uso fora do Brasil |
| Regime prioritário no MVP | Simples Nacional | Maioria dos clientes de escritórios pequenos |
| Onboarding beta | Manual (você cadastra) | Acelera adoção, aprende o que falta |
| Trial | 14 dias, sem cartão | Reduz atrito na conversão |
| Beta | 90 dias grátis (não vitalício) | Valida sem comprometer receita futura |
| Filtro por cliente no painel | Spotlight global (⌘K) — implementado | Busca server-side via `buscarClientes`, filtra painel/clientes/calendário por nome. Sem ele o painel quebra a partir de ~15 clientes |
| Export .ics | Fase 2 | Raramente usado, não resolve a dor core |
| Notas por obrigação | Fase 2 | Baixa prioridade vs filtro por cliente e onboarding |

### Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 14 App Router | Mover rápido, full-stack, Vercel nativo |
| Banco | Supabase | Auth + Postgres + RLS + pg_cron grátis |
| Multi-tenancy | RLS do Supabase | Elimina 80% do trabalho de isolamento |
| E-mail | Resend + react-email | 3k/mês grátis, API simples |
| Pagamentos | Pagar.me | Pix nativo, BRL, simples para BR |
| Feriados | BrasilAPI — sync manual (MVP) | Gratuita, sem auth, rodar 1x/ano via script |
| Deploy | Vercel | Free tier, zero config, CI/CD automático |
| Consulta CNPJ | BrasilAPI — só no save, com rate limit | Evita abuso sem degradar UX |
| Rate limit CNPJ | 30 consultas/dia por escritório | Suficiente para uso legítimo (80 clientes/mês) |
| Idioma do código/schema | Migrar PT→EN na semana 7 | Padrão da indústria, facilita tooling e futuras contratações; UI permanece em PT |
| Idioma da UI | Português permanentemente | Produto 100% Brasil, termos fiscais sem tradução natural (DAS, eSocial, Simples Nacional) |
| Responsividade mobile | Versão básica antes do beta (semana 7) | ICP é desktop, mas acesso mobile a alertas é caso real |
| Rate limit busca (Spotlight) | Não implementado — adiar pós-validação | Busca já exige auth + filtro por escritório + debounce 300ms + mín. 3 chars + limit 8; abuso real improvável no estágio atual. Quando implementar: Upstash Ratelimit (Redis) na server action `buscarClientes`, ~10 req/min por usuário. Cache React (`cache()`) para deduplica auth+escritório no mesmo ciclo de render. |

### Empresariais

| Decisão | Escolha | Motivo |
|---|---|---|
| Empresa | Usar Tresbits existente | CNPJ ativo desde 2007, sem custo de abertura |
| Sede | Manter São Paulo | ISS 2% vs Salvador 5% (diferença R$2.820/ano em R$10k MRR) |
| Endereço | Fiscal virtual SP (R$45–65/mês) | Ninguém mora mais no endereço atual |
| CNAE | Alterar 6201 → 6203 | Enquadramento correto para SaaS, Fator R no Anexo III |
| Contador externo | Não necessário | Sócio é contador |
| Cobrança em dólar | Não | Mercado BR, sem sentido adicionar atrito cambial |

---

## Sinais de que a validação está funcionando

- Contador usa o produto sem você pedir
- Fala "meu sistema" ao invés de "a ferramenta que testo"
- Pergunta "como vou pagar quando acabar o beta?"
- Indica espontaneamente para outro contador

## O que fazer se a validação não funcionar

Se 3 de 5 contadores entrevistados não demonstrarem interesse real:
1. Revisar o pitch — pode ser apresentação, não a dor
2. Mudar o segmento — testar escritórios maiores ou especialidades específicas
3. Mudar o produto principal — avaliar portal do cliente como entrada

---

## Canais de aquisição (pós-validação)

| Canal | Custo | Potencial | Como |
|---|---|---|---|
| Grupos WhatsApp de contadores | R$0 | Alto | Participar, compartilhar quando natural |
| LinkedIn orgânico | R$0 | Médio-alto | Posts sobre dores do contador (planilha, prazos, multas) |
| Google Ads | R$500–1k/mês | Alto | "agenda tributária para contadores" |
| Referral | R$0 | Muito alto | 1 mês grátis para quem indica + indicado |
| Eventos CRC estaduais | Baixo | Médio | Patrocinar ou palestrar |

## ICP detalhado

- Escritório com 10–80 clientes ativos
- Pelo menos 60% dos clientes no Simples Nacional
- 1–5 contadores na equipe
- Já perdeu ou quase perdeu um prazo
- Usa Google Calendar ou planilha hoje para controlar prazos
- Localização: qualquer estado (produto 100% online)
