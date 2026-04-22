# Contexto — Produto: PrazoGestor

## Visão geral

**Nome do produto**: PrazoGestor
**Empresa**: Tresbits Serviços de Informática LTDA
**URL MVP**: prazogestor.tresbits.com
**Domínio definitivo**: prazogestor.com.br (registrar ao atingir primeiros pagantes)

**O que é**: SaaS B2B de gestão de prazos e obrigações fiscais para escritórios contábeis brasileiros.

**A dor**: Contadores gerenciam dezenas de clientes com regimes tributários diferentes.
Hoje fazem isso em planilhas e post-its. O risco de perder um prazo é alto — multa cai no cliente.

**A solução**: Sistema que gera automaticamente o calendário fiscal de cada cliente do escritório,
envia alertas antecipados e mantém histórico de entregas.

**Moeda**: BRL (Real brasileiro) — clientes são contadores BR, pagam via Pix/cartão nacional.

**Modelo**: assinatura mensal por escritório, precificada por número de clientes ativos.

---

## Público-alvo

**ICP (Ideal Customer Profile)**: escritório contábil com 10–80 clientes ativos.
- Pequeno/médio porte, 1–5 contadores na equipe
- Hoje usa planilha ou agenda para controlar prazos
- Já sente a dor — perdeu prazo ou quase perdeu
- Tem pelo menos um cliente Simples Nacional

**Canal de venda**: B2B direto. Quem paga é o escritório, não os clientes do escritório.

---

## Planos e preços

| Plano | Preço | Clientes | Recursos |
|---|---|---|---|
| Essencial | R$97/mês | Até 15 | Simples/MEI, alertas e-mail, 1 usuário |
| Profissional ⭐ | R$197/mês | Até 50 | Todos regimes, WhatsApp, 3 usuários, export iCal |
| Agência | R$347/mês | Ilimitado | Todos alertas, relatório PDF, suporte prioritário |

- **Trial**: 14 dias grátis, sem cartão obrigatório
- **Beta**: 90 dias grátis para primeiros 10 escritórios
- **Referral**: 1 mês grátis para quem indica + para quem foi indicado
- **Reajuste**: IPCA anual (comunicar desde o início)

---

## Funcionalidades MVP (semanas 1–6)

### Entra no MVP

- [x] Cadastro de escritório (multi-tenant, 1 conta por escritório)
- [x] Cadastro de clientes: CNPJ, nome, regime tributário, tem empregados
- [x] Enriquecimento de razão social via BrasilAPI — botão manual na tela de cadastro/edição (sem override silencioso)
- [x] Geração automática de calendário por regime do cliente
- [x] Painel de vencimentos: lista dos próximos 30 dias de todos os clientes
- [x] Filtros por cliente — busca global Spotlight (⌘K), filtra painel, clientes e calendário
- [x] Código de cor por urgência: vermelho (hoje/atrasado), amarelo (≤ 3 dias), neutro (demais)
- [x] Estado vazio no painel com CTA para cadastrar primeiro cliente
- [x] Marcar como concluído: checklist + responsável + data/hora
- [x] Alertas por e-mail: 7 dias, 3 dias e 1 dia antes do vencimento (com link de descadastro — LGPD)
- [x] Ajuste automático de datas por feriados nacionais (tabela `holidays` sincronizada via BrasilAPI)
- [x] Onboarding guiado em 3 telas: escritório → primeiro cliente → calendário gerado

### Implementado além do MVP original

- [x] Tela de calendário com visualizações grade e lista, navegação por mês
- [x] Tela de configurações: escritório, conta, aparência (dark/light/sistema), notificações (LGPD), plano, exclusão de conta
- [x] Loading skeletons (painel e clientes)
- [x] Busca global tipo Spotlight com debounce, navegação por teclado e SearchBanner contextual
- [x] Painel redesenhado: ZonaNumeros + cards simplificados + paginação + modais globais por cliente
- [x] Responsividade mobile: bottom nav, sidebar oculta, modais e cards ajustados
- [x] Telas de auth redesenhadas: layout split, esqueci-senha
- [x] Componente ClienteFormFields compartilhado entre onboarding, modal novo e modal editar
- [x] **Página `/clientes/[id]/detalhes`** (ex-`/prazos`) — rota renomeada; header com breadcrumb, CNPJ, regime, actions (e-mail, editar, portal); 4 status cards (Atrasadas, Esta semana, Pendentes, Concluídas) com estilo glass + `border-t-2` colorida; calendário grade/lista abaixo
- [x] **Lista view com selection mode** — modo lista como default em `/clientes/[id]/detalhes`; linhas selecionáveis com floating action bar (Concluir / Adiar em lote)
- [x] **Dados de Contato + Endereço no cadastro** — campos opcionais no cadastro/edição: nome do responsável, telefone, e-mail (flag "usar como contato direto"); toggle "Possui endereço?" com campos de endereço obrigatórios quando ativo; lookup de CEP via BrasilAPI preenchendo logradouro, bairro, cidade e UF automaticamente
- [x] **Modal scrollável** — `ModalNovoCliente` e `ModalEditarCliente` com `max-h` + `overflow-y-auto` no body para suportar formulários longos

### Módulo 2 — Portal do Cliente

Empresários (clientes do escritório) acessam portal próprio para visualizar obrigações, prazos e valores.

**Fluxo de convite:**
1. Contador acessa `/clientes/[id]/prazos` → botão "Convidar para portal" (visível se cliente tem e-mail e `portal_enabled = false`)
2. Sistema gera UUID token, salva em `clients.portal_invite_token` + `portal_invite_sent_at`, envia e-mail via Resend
3. Empresário clica no link `/portal/aceitar-convite?token=xxx` → define senha → conta criada via `auth.admin.createUser` + login automático
4. Acessa `/portal` com suas obrigações. Nas próximas visitas: `/portal/login`

**Campo de valor nas obrigações:**
- `ModalConcluir` tem campo opcional "Valor (R$)" — ao concluir, salva `value` + `value_source = 'manual'`
- Painel: valor exibido abaixo do nome da obrigação nos cards
- `/clientes/[id]/prazos`: valor exibido nas linhas concluídas
- `/portal`: valor exibido em destaque (`font-mono`) ao lado do status

**Schema — adições:**
- `client_obligations.value numeric(12,2)` — valor do tributo (entrada manual)
- `client_obligations.value_source text` — `'manual'` | `'auto'` (auto reservado para fase 3)
- `clients.portal_enabled boolean` default false
- `clients.portal_user_id uuid` nullable → `auth.users`
- `clients.portal_invite_token text` nullable
- `clients.portal_invite_sent_at timestamptz` nullable

**RLS — portal user:**
- `clients`: SELECT onde `portal_user_id = auth.uid() AND portal_enabled = true`
- `client_obligations`: SELECT onde `client_id` pertence ao próprio cliente

**Rotas do portal:**
- `/portal` → lista de obrigações do empresário (guard de auth em `app/portal/(protected)/layout.tsx`)
- `/portal/login` → login exclusivo do empresário (verifica que a conta é portal user)
- `/portal/aceitar-convite` → aceitar convite + definir senha (público)

**Arquivos:**
- `supabase/portal_module.sql` — migration + RLS
- `app/actions/portal.ts` — `inviteToPortal`, `acceptPortalInvite`, `portalLogin`
- `emails/portal-invite.tsx` — template de convite (react-email)
- `app/portal/(protected)/layout.tsx` — guard de auth + header do portal
- `app/portal/(protected)/page.tsx` — lista de obrigações
- `app/portal/aceitar-convite/page.tsx` — página de aceite
- `app/portal/login/page.tsx` — login do empresário

---

### Funcionalidade implementada — Envio manual de e-mail ao cliente

Contador envia manualmente um e-mail ao cliente (pessoa jurídica) com lista selecionada de obrigações vencidas e a vencer.

**Fluxo:**
1. Contador aciona `ModalEnviarEmail` — disponível no card do painel e na página do cliente (`/clientes/[id]`)
2. Modal em 3 seções:
   - **Destinatário** — e-mail pré-preenchido do cadastro (se houver), editável; opção de salvar no cadastro do cliente
   - **Obrigações** — lista com checkboxes; pré-selecionados vencidos + vencendo em ≤ 7 dias
   - **Mensagem** — textarea pré-preenchida com template do escritório (configurável em `/configuracoes`), editável por envio
3. Envio via Resend, registro em `client_email_log`

**Schema — adições:**
- `clients.email` — text, opcional
- `offices.client_email_template` — text, mensagem padrão editável
- Tabela `client_email_log`: `id, client_id, office_id, sent_to, obligations_count, sent_at`

**Arquivos:**
- Migration SQL
- `app/actions/email-cliente.ts`
- `components/clientes/modal-enviar-email.tsx`
- `emails/client-obligations.tsx` (react-email)
- Campo e-mail em `ClienteFormFields`
- Campo template em `/configuracoes`

### Fica fora do MVP

- Export Google Calendar (.ics) — fase 2
- Notas por obrigação — fase 2
- Histórico de entregas como tela separada — coberto pelo filtro "concluídas" no painel
- App mobile — fase 2+
- Alertas por WhatsApp — fase 2
- Integração com e-CAC — fase 2
- Download de guias (DARF) — fase 2
- Cálculo de impostos — fora do escopo
- Portal do cliente — ~~fase 2~~ **implementado (Módulo 2)**
- API pública — fase 3
- Relatórios avançados — fase 3
- IA/automação — fase 3
- Integração com Omie, Conta Azul, Bling — fase 3

---

## Regras de uso da BrasilAPI no MVP

### Consulta de CEP

**Quando acontece**: quando o usuário clica no botão `MapPin` no campo CEP do formulário de endereço (ativo quando o toggle "Possui endereço?" está ligado e o CEP tem 8 dígitos). Nunca automático.

**Comportamento**:
- Se encontrar: preenche logradouro, bairro, cidade e estado (UF) automaticamente
- Se não encontrar (404): exibe mensagem inline "CEP não encontrado. Preencha o endereço manualmente."

**Implementação**: server action `lookupCep` em `app/actions/clientes.ts`, chama `/api/cep/v2/{cep}` da BrasilAPI. Sem rate limit — API pública sem auth.

---

### Consulta de CNPJ

**Quando acontece**: apenas quando o usuário clica no botão lupa (cadastro) ou "Atualizar dados do CNPJ" (edição). Nunca automático — sem override silencioso ao salvar.

**Comportamento**:
- Se encontrar: preenche o campo Razão Social na tela
- Se não encontrar (404): exibe mensagem inline "CNPJ não encontrado na Receita. Digite o nome manualmente."
- Se rate limit atingido: exibe mensagem inline "Limite de consultas atingido."
- O campo nome continua obrigatório e editável independentemente

**Rate limit por escritório**: 30 consultas de CNPJ por dia por `office_id`. Controlado via tabela `cnpj_rate_limit`.

**Casos onde o CNPJ pode não ser encontrado**:
- CNPJ muito novo (demora para aparecer na base)
- MEI recém-aberto
- Dado desatualizado na fonte da BrasilAPI

### Sincronização de feriados

**Quando rodar**: manualmente, uma vez por ano (janeiro) e sempre que houver decreto de feriado extra. Pode ser um script avulso ou endpoint interno protegido.

**Como funciona**: consulta `/api/feriados/v1/{ano}` da BrasilAPI e faz upsert na tabela `feriados`. Não é uma consulta em tempo real — os dados ficam persistidos no banco.

**Cobertura**: apenas feriados nacionais no MVP. Feriados estaduais e municipais entram na fase 2 via FeriadosAPI.com.

---

## Happy path do usuário (fluxo principal)

1. Contador cria conta → confirma e-mail → entra no painel vazio com CTA
2. Onboarding tela 1: cadastra o escritório (nome, estado)
3. Onboarding tela 2: cadastra o primeiro cliente (CNPJ, regime, tem empregados?) → sistema busca razão social no save
4. Onboarding tela 3: calendário gerado automaticamente — momento "aha"
5. Vê painel: "CNPJ X — DAS — vence em 3 dias" (destaque vermelho/amarelo)
6. Filtra por cliente para ver só as obrigações de um escritório específico
7. Recebe alerta por e-mail 7 dias antes
8. Clica em "Concluído" → fica registrado com data e responsável

---

## Modelo de dados

```
escritorios
  id, user_id, nome, estado, plano, alertas_email_ativo,
  onboarding_dispensado,      ← oculta checklist permanentemente
  onboarding_pulou_cliente,   ← métrica: pulou cadastro do 1º cliente
  onboarding_concluido,       ← controle de fluxo (flow A ou B)
  client_email_template,      ← mensagem padrão para envio manual ao cliente
  created_at

clientes
  id, escritorio_id, cnpj, nome, regime [simples|mei|lucro_presumido|lucro_real], tem_empregados, email (opcional),
  portal_enabled bool, portal_user_id uuid, portal_invite_token text, portal_invite_sent_at timestamptz,
  contact_name text, contact_phone text, contact_email_is_contact bool default false,
  has_address bool default false,
  address_street text, address_number text, address_complement text, address_neighborhood text,
  address_city text, address_state char(2), address_zip char(8)

obrigacoes_template
  id, nome, sigla, regimes[], frequencia, requer_empregados,
  dia_vencimento, mes_vencimento, regra_ajuste [prorroga|antecipa], dependencia

obrigacoes_cliente
  id, cliente_id, template_id, data_vencimento, status [pendente|concluido|atrasado],
  concluido_por, concluido_em, nota,
  value numeric(12,2), value_source text ['manual'|'auto']

alertas_log
  id, obrigacao_id, tipo [7d|3d|1d], enviado_em, email_enviado_em

client_email_log
  id, client_id, office_id, sent_to, obligations_count, sent_at

feriados
  id, data, descricao, tipo [nacional|estadual|municipal], estado, municipio_ibge

cnpj_rate_limit
  escritorio_id, data, contagem  ← PK composta
```

### Notas do modelo
- `clientes.regime` aceita `simples`, `mei`, `lucro_presumido` e `lucro_real`
- `alertas_log.email_enviado_em` é null até o webhook confirmar envio pelo Resend
- `escritorios.alertas_email_ativo` controla descadastro de e-mails (LGPD)
- `escritorios.onboarding_concluido` é o guard central do `(app)/layout.tsx` — sem ele, todas as rotas do app redirecionam para `/onboarding/cliente`
- `escritorios.onboarding_pulou_cliente` é exclusivamente métrica — não usar para controle de fluxo

### Débito técnico — campo `tax` como array

`obligation_templates.tax` é um `text[]` (ex: `ARRAY['simples','mei']`). Funciona para o MVP mas limita a evolução:

- Não suporta metadados por regime (ex: `due_day` diferente por regime no mesmo template)
- Não permite FK nem constraints de integridade no relacionamento
- Dificulta edição via Admin (interface de manutenção de templates e regimes)
- Index GIN em array é menos eficiente que index em coluna de tabela de relacionamento

**Solução planejada (antes da fase de cálculo automático e Admin):** migrar para tabela de relacionamento `obligation_template_regimes (template_id, tax_regime, [metadados por regime])`. A query atual `.contains('tax', [taxRegime])` vira um JOIN simples. Fazer junto com a migração do Admin para não quebrar o sistema duas vezes.

---

## Stack técnica definida

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | Next.js 14 (App Router) | shadcn/ui + Tailwind |
| Backend/DB | Supabase | Postgres + Auth + RLS + Storage |
| Multi-tenancy | RLS (Row Level Security) | Isolamento por escritório |
| Jobs agendados | pg_cron (Supabase) | Alertas diários |
| E-mail | Resend + react-email | 3k e-mails/mês grátis |
| WhatsApp (fase 2) | Z-API ou Evolution API | — |
| Deploy | Vercel | Free tier no MVP |
| Pagamentos | Pagar.me (Pix nativo) ou Stripe | — |
| NFS-e automática | — | Fase 2 |
| Feriados | BrasilAPI — sync manual | Nacionais, grátis, sem auth |
| CNPJ | BrasilAPI — no save, com rate limit | 30 consultas/dia por escritório |

### Custo de infra no MVP (até ~100 clientes)

- Vercel: R$0 (free tier)
- Supabase: R$0 (free tier)
- Resend: R$0 (até 3k e-mails/mês)
- Domínio: ~R$40/ano
- **Total: ~R$0–50/mês**

---

## Fontes de dados

### Feriados

| Fonte | Cobertura | Custo | Auth | Uso |
|---|---|---|---|---|
| BrasilAPI (`/api/feriados/v1/{ano}`) | Nacionais | Grátis | Não | MVP — sync manual anual |
| FeriadosAPI.com | Nacionais + estaduais + capitais | Grátis (nacionais) | Sim | Fase 2 |
| BCB Dados Abertos | Feriados bancários | Grátis | Não | Referência |
| GitHub: joaopbini/feriados-brasil | 5.570 municípios | Grátis | N/A (dataset) | Fase 3 |

### CNPJ

| Fonte | Uso | Limitação |
|---|---|---|
| BrasilAPI (`/api/cnpj/v1/{cnpj}`) | Enriquecimento de razão social no save | Rate limit próprio: 30/dia/escritório |

### Obrigações fiscais

Não existe API pública da Receita Federal com prazos.
Estratégia: construir base própria no Supabase com seed manual a partir das fontes:
- Agenda Tributária Oficial da RFB (atualizada mensalmente)
- Resolução CGSN nº 140/2018 (Simples Nacional)
- FENACON e CFC (publicam calendários mensais)
- Manutenção: ~1h/mês para verificar mudanças

---

## Expansão pós-MVP (fases 2 e 3)

**Fase 2** (mês 4–6):
- Alertas via WhatsApp (Z-API)
- Export Google Calendar (.ics)
- Notas por obrigação
- Feriados estaduais via FeriadosAPI.com
- Portal do cliente para escritórios (upload de documentos, comunicação, assinatura digital)

**Fase 3** (ano 2):
- Relatórios financeiros simplificados para PMEs (parceiros dos escritórios)
- Módulo de gestão de honorários do escritório
