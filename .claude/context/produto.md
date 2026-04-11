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
- [ ] Enriquecimento automático de razão social via BrasilAPI no save do formulário (ver regras de uso abaixo)
- [ ] Geração automática de calendário por regime do cliente
- [x] Painel de vencimentos: lista dos próximos 30 dias de todos os clientes
- [x] Filtros por cliente — busca global Spotlight (⌘K), filtra painel, clientes e calendário
- [x] Código de cor por urgência: vermelho (hoje/atrasado), amarelo (≤ 3 dias), neutro (demais)
- [ ] Estado vazio no painel com CTA para cadastrar primeiro cliente
- [x] Marcar como concluído: checklist + responsável + data/hora
- [ ] Alertas por e-mail: 7 dias, 3 dias e 1 dia antes do vencimento (com link de descadastro — LGPD)
- [ ] Ajuste automático de datas por feriados nacionais (tabela `feriados` sincronizada via BrasilAPI)
- [x] Onboarding guiado em 3 telas: escritório → primeiro cliente → calendário gerado

### Implementado além do MVP original

- [x] Tela de calendário com visualizações grade e lista, navegação por mês
- [x] Tela de configurações: escritório, conta, aparência (dark/light/sistema), notificações (LGPD), plano, exclusão de conta
- [x] Loading skeletons (painel e clientes)
- [x] Busca global tipo Spotlight com debounce, navegação por teclado e SearchBanner contextual

### Fica fora do MVP

- Export Google Calendar (.ics) — fase 2
- Notas por obrigação — fase 2
- Histórico de entregas como tela separada — coberto pelo filtro "concluídas" no painel
- App mobile — fase 2+
- Alertas por WhatsApp — fase 2
- Integração com e-CAC — fase 2
- Download de guias (DARF) — fase 2
- Cálculo de impostos — fora do escopo
- Portal do cliente — fase 2
- API pública — fase 3
- Relatórios avançados — fase 3
- IA/automação — fase 3
- Integração com Omie, Conta Azul, Bling — fase 3

---

## Regras de uso da BrasilAPI no MVP

### Consulta de CNPJ

**Quando acontece**: apenas no momento de salvar o formulário de cadastro ou edição de cliente. Nunca em tempo real enquanto o usuário digita.

**Comportamento**:
- Se encontrar: enriquece a razão social automaticamente (sem notificação ao usuário)
- Se não encontrar (404) ou API indisponível: salva normalmente com o nome digitado pelo contador. Silencioso — não é um erro do ponto de vista do usuário
- Na tela de edição: botão explícito "Atualizar dados do CNPJ" dispara nova consulta

**Rate limit por escritório**: 30 consultas de CNPJ por dia por `escritorio_id`. Controlado via tabela `cnpj_rate_limit`. Se exceder, o cadastro salva sem enriquecimento (sem mensagem de erro para o usuário).

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
  onboarding_dispensado,    ← oculta checklist permanentemente
  onboarding_pulou_cliente, ← métrica: pulou cadastro do 1º cliente
  onboarding_concluido,     ← controle de fluxo (flow A ou B)
  created_at

clientes
  id, escritorio_id, cnpj, nome, regime [simples|mei], tem_empregados

obrigacoes_template
  id, nome, sigla, regimes[], frequencia, requer_empregados,
  dia_vencimento, mes_vencimento, regra_ajuste [prorroga|antecipa], dependencia

obrigacoes_cliente
  id, cliente_id, template_id, data_vencimento, status [pendente|concluido|atrasado],
  concluido_por, concluido_em, nota

alertas_log
  id, obrigacao_id, tipo [7d|3d|1d], enviado_em, email_enviado_em

feriados
  id, data, descricao, tipo [nacional|estadual|municipal], estado, municipio_ibge

cnpj_rate_limit
  escritorio_id, data, contagem  ← PK composta
```

### Notas do modelo
- `clientes.regime` aceita apenas `simples` e `mei` no MVP — lucro_presumido/real na fase 2
- `alertas_log.email_enviado_em` é null até o webhook confirmar envio pelo Resend
- `escritorios.alertas_email_ativo` controla descadastro de e-mails (LGPD)
- `escritorios.onboarding_concluido` é o guard central do `(app)/layout.tsx` — sem ele, todas as rotas do app redirecionam para `/onboarding/cliente`
- `escritorios.onboarding_pulou_cliente` é exclusivamente métrica — não usar para controle de fluxo

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
