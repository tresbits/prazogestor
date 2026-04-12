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

- [ ] Repositório Next.js 14 criado, Supabase configurado
- [ ] Subdomínio configurado no Vercel: `prazogestor.tresbits.com` (DNS via tresbits.com existente — sem custo)
- [ ] Domínio `prazogestor.com.br` registrar apenas ao atingir os primeiros pagantes (~R$40/ano)
- [ ] Schema SQL completo: `escritorios`, `clientes`, `obrigacoes_template`, `obrigacoes_cliente`, `alertas_log`
- [ ] RLS habilitado em todas as tabelas com políticas de isolamento por escritório
- [ ] Seed das obrigações do Simples Nacional na `obrigacoes_template`
- [ ] **Tabela `feriados` no schema** — `data, descricao, tipo` (nacional/estadual)
- [ ] **Sincronização de feriados nacionais via BrasilAPI** — script manual, rodar 1x agora + início de cada ano
- [ ] **Tabela `cnpj_rate_limit` no schema** — `escritorio_id, data, contagem` — suporta rate limit de CNPJ
- [ ] Landing page com lista de espera (Carrd.co — 2h)
- [ ] Entrevistar 5 contadores conhecidos (ver `@commands/entrevista-beta.md`)

### Semana 3 · Auth + cadastro

- [x] Auth com Supabase: criar conta, confirmar e-mail, login, recuperar senha
- [x] Tela de cadastro de escritório (nome, estado — campos mínimos)
- [x] Formulário de cadastro de cliente: CNPJ, nome, regime, tem empregados
- [ ] **Consulta BrasilAPI no save do formulário** — enriquece razão social se encontrar, silencioso se não encontrar (ver `@skills/saas-br.md`)
- [ ] **Rate limit de CNPJ** — 30 consultas/dia por escritório via `cnpj_rate_limit`; retorna 429 silencioso se exceder
- [ ] **Botão "Atualizar dados do CNPJ"** na tela de edição de cliente — única ação explícita que dispara nova consulta à BrasilAPI

### Semana 4 · Geração de obrigações + painel

- [ ] Função `gerarVencimentos(clienteId, regime, temEmpregados, ano)` — gera `obrigacoes_cliente` ao cadastrar cliente (ver `@commands/gerar-vencimentos.md`)
- [ ] Ajuste automático de datas por feriados nacionais usando tabela `feriados` já populada
- [x] Painel: lista de vencimentos ordenada por data, próximos 30 dias de todos os clientes
- [x] **Filtro por cliente** — busca Spotlight global (⌘K) filtra painel, clientes e calendário
- [x] Código de cor por urgência: vermelho (hoje/atrasado), amarelo (≤ 3 dias), neutro (demais)
- [x] Botão "Concluir" — registra responsável, data/hora, muda status

### Semana 5 · Alertas por e-mail

- [ ] pg_cron diário às 8h: verifica vencimentos em 7, 3 e 1 dia — exclui já alertados via `alertas_log`
- [ ] Template de e-mail com react-email + Resend: cliente, obrigação, data, link pro painel
- [ ] **Link de descadastro de e-mail obrigatório no template** (LGPD)
- [ ] Teste end-to-end com CNPJs fictícios em regime Simples com e sem empregados

### Semana 6 · Onboarding + polish

- [x] Onboarding guiado em 3 telas: escritório → primeiro cliente → calendário gerado (flows com/sem cliente)
- [x] Guards de onboarding centralizados no layout — `onboarding_concluido` como gate de todas as rotas do app
- [x] Empty state no painel com ModalNovoCliente
- [x] Loading states em todas as ações assíncronas (painel e clientes com skeletons)
- [ ] Mensagens de erro claras — sem "something went wrong"
- [ ] Convidar 10 escritórios da lista de espera
- [ ] Onboarding manual: cadastrar os clientes deles por videochamada + tela compartilhada

### Semana 7 · Qualidade e padronização (antes do beta)

- [ ] **Migração PT→EN no código e schema** — renomear tabelas, colunas e variáveis para inglês; UI permanece em português. Fazer agora, antes de betas com dados reais e antes de crescer o schema com Lucro Presumido/Real. Estimativa: 1 dia
- [ ] **Mensagens de erro claras** — sem "something went wrong"; tratar casos concretos nos formulários e actions
- [ ] **Botão "Atualizar dados do CNPJ"** na tela de edição de cliente
- [ ] **Link de descadastro de e-mail** no template de alerta (LGPD — obrigatório antes de beta)
- [ ] **Responsividade mobile básica** — sidebar colapsável (drawer), modais e cards ajustados para telas < 430px. ICP é desktop mas acesso mobile a alertas é caso real. Estimativa: 3–5 dias

### Semanas 8–9 · Expansão de regimes + prazos

- [ ] **Lucro Presumido / Lucro Real** — seed de obrigações + suporte em `gerarVencimentos`. Sem isso, parcela relevante de escritórios não pode usar o produto
- [ ] **Revisão da página de prazos por cliente** (`/clientes/[id]/prazos`) — design e completude

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
