# PrazoGestor

Calendário de obrigações fiscais para escritórios contábeis brasileiros.
Desenvolvido pela [Tresbits](https://tresbits.com).

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Supabase** (Postgres, Auth, RLS, pg_cron, pg_net)
- **Tailwind CSS v4** + Base UI
- **Resend** para alertas por e-mail
- **Vercel** para deploy e cron jobs

## Desenvolvimento local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (bypass RLS) |
| `RESEND_API_KEY` | Chave da API Resend para e-mails |
| `WEBHOOK_SECRET` | Secret para autenticar o webhook de alertas |
| `CRON_SECRET` | Secret para autenticar o endpoint de cron |
| `NEXT_PUBLIC_SITE_URL` | URL pública do app (ex: https://prazogestor.tresbits.com) |

### 3. Aplicar o schema no Supabase

Execute `schema.sql` no SQL Editor do Supabase. O arquivo contém:
- Tabelas, RLS e índices
- Seed de obrigações (Simples Nacional e MEI)
- Funções auxiliares
- Jobs pg_cron (marcar-atrasados, alertas-diarios, purge)

### 4. Popular feriados

```bash
npx tsx --env-file=.env.local scripts/sync-feriados.ts 2026 2027
```

### 5. Rodar o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Cron jobs

### Vercel Cron — geração de vencimentos

Configurado em `vercel.json`. Roda no dia 1 de cada mês às 9h UTC.
Gera vencimentos para o mês 12 meses à frente de todos os clientes.

Para testar localmente:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/gerar-vencimentos
```

### pg_cron (Supabase) — jobs diários

| Job | Horário (UTC) | Ação |
|---|---|---|
| `prazogestor-marcar-atrasados` | 11:05 todo dia | Marca como `atrasado` obrigações vencidas |
| `prazogestor-alertas-diarios` | 11:00 todo dia | Insere em `alertas_log` para 7d, 3d, 1d antes do vencimento |
| `prazogestor-purge-cnpj-rate-limit` | 3:00 toda segunda | Remove entradas antigas da tabela de rate limit |

## Alertas por e-mail

O fluxo completo:

1. pg_cron insere em `alertas_log`
2. Supabase Database Webhook chama `POST /api/alertas/webhook`
3. Route handler busca dados da obrigação e envia e-mail via Resend

O webhook requer o header `x-webhook-secret: <WEBHOOK_SECRET>`.

## Deploy

```bash
git push origin main
```

O Vercel detecta o push e faz o deploy automaticamente.
Certifique-se de que todas as variáveis de ambiente estão configuradas no painel do Vercel, incluindo `CRON_SECRET`.
