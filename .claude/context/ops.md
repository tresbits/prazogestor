# Contexto Operacional · PrazoGestor

Referência técnica para operar, testar e depurar a infraestrutura de jobs e e-mail.

---

## Jobs agendados

| Job | Onde | Schedule | O que faz |
|---|---|---|---|
| `prazogestor-marcar-atrasados` | pg_cron | diário 11:05 UTC | `UPDATE client_obligations SET status = 'overdue' WHERE status = 'pending' AND due_date < CURRENT_DATE` |
| `prazogestor-alertas-diarios` | pg_cron | diário 11:00 UTC | Insere `alert_logs` para vencimentos em 1, 3 e 7 dias; em seguida chama `POST /api/alertas/digest` via pg_net |
| `prazogestor-purge-cnpj-rate-limit` | pg_cron | segunda-feira 03:00 UTC | Limpa registros antigos da tabela `cnpj_rate_limit` via `purge_cnpj_rate_limit()` |
| `gerar-vencimentos` | Vercel Cron | dia 1 de cada mês 09:00 UTC | GET `/api/cron/gerar-vencimentos` — gera obrigações do mês 12 meses à frente para todos os clientes |

> **Ordem crítica:** `alertas-diarios` (11:00) roda antes de `marcar-atrasados` (11:05) — garante que vencimentos do dia ainda são alertados como `pending` antes de virarem `overdue`.

---

## Endpoint de digest

**Rota:** `POST /api/alertas/digest`

**Auth:** header `x-cron-secret: <CRON_SECRET>`

**O que faz:**
1. Busca todos os `alert_logs WHERE email_sent_at IS NULL` com joins completos (office → client → template)
2. Agrupa por `office_id`
3. Para cada escritório com `email_alerts_enabled = true`: busca e-mail do usuário, renderiza template, envia via Resend
4. Atualiza `email_sent_at = now()` nos logs processados

**Resposta de sucesso:**
```json
{ "ok": true, "sent": 5, "offices": 2 }
```

---

## Testar o digest manualmente

```bash
# Produção
curl -X POST https://prazogestor.tresbits.com/api/alertas/digest \
  -H "x-cron-secret: SEU_CRON_SECRET"

# Local (dev server rodando)
curl -X POST http://localhost:3000/api/alertas/digest \
  -H "x-cron-secret: SEU_CRON_SECRET"
```

---

## Checklist de troubleshooting — digest retorna `sent: 0`

1. **Verificar registros pendentes no banco**
   ```sql
   SELECT id, type, email_sent_at
   FROM alert_logs
   WHERE email_sent_at IS NULL;
   ```

2. **Verificar se o escritório tem alertas ativos**
   ```sql
   SELECT id, name, email_alerts_enabled
   FROM offices
   WHERE email_alerts_enabled = true;
   ```

3. **Verificar se o usuário tem e-mail cadastrado**
   Supabase Dashboard → Authentication → Users — confirmar `user_id` do escritório tem e-mail válido.

4. **Verificar variável `CRON_SECRET`**
   Vercel Dashboard → Settings → Environment Variables.

5. **Verificar chave do Resend**
   Confirmar `RESEND_API_KEY` nas env vars e domínio `alertas@prazogestor.tresbits.com` verificado no Resend.

6. **Ver logs de erro**
   Vercel Dashboard → Deployments → Functions → `api/alertas/digest`.

---

## Checklist de troubleshooting — pg_cron não roda

1. **Listar jobs agendados**
   ```sql
   SELECT jobname, schedule, command, active
   FROM cron.job
   ORDER BY jobname;
   ```

2. **Ver histórico de execuções**
   ```sql
   SELECT jobid, start_time, end_time, status, return_message
   FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 20;
   ```

3. **Testar pg_net manualmente**
   ```sql
   SELECT net.http_post(
     url := 'https://prazogestor.tresbits.com/api/alertas/digest',
     headers := jsonb_build_object(
       'Content-Type', 'application/json',
       'x-cron-secret', current_setting('app.cron_secret')
     ),
     body := '{}'::jsonb
   );
   ```

4. **Verificar resposta do pg_net**
   ```sql
   SELECT id, status_code, content
   FROM net._http_response
   ORDER BY id DESC
   LIMIT 5;
   ```

---

## Gerenciar jobs pg_cron

```sql
-- Ver todos os jobs
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;

-- Desativar temporariamente
UPDATE cron.job SET active = false WHERE jobname = 'prazogestor-alertas-diarios';

-- Reativar
UPDATE cron.job SET active = true WHERE jobname = 'prazogestor-alertas-diarios';

-- Remover
SELECT cron.unschedule('prazogestor-alertas-diarios');
```

Para recriar os jobs do zero, usar o arquivo `supabase/fix_cron_jobs.sql`.

---

## Troca de regime tributário — comportamento

Ao editar um cliente e alterar `tax_regime` ou `has_employees`:
1. Deleta todas as `client_obligations` com `status = 'pending'` e `due_date >= hoje`
2. Regenera obrigações de hoje até hoje+1 ano com os templates do novo regime
3. Obrigações `completed` e `overdue` **não são tocadas** (preservadas no histórico)

**Nota:** requer política RLS de DELETE em `client_obligations` — ver `supabase/rls_client_obligations_delete.sql`.

---

## Fluxo completo de alertas (referência)

```
11:00 UTC — pg_cron: prazogestor-alertas-diarios
  └── INSERT INTO alert_logs (obligation_id, type)
        WHERE due_date IN (hoje+1, hoje+3, hoje+7)
        AND NOT já alertado com esse type
  └── pg_net: POST /api/alertas/digest
        └── SELECT alert_logs WHERE email_sent_at IS NULL
              └── Agrupa por office
                    └── Envia 1 e-mail por escritório (Resend)
                          └── UPDATE alert_logs SET email_sent_at = now()

11:05 UTC — pg_cron: prazogestor-marcar-atrasados
  └── UPDATE client_obligations SET status = 'overdue'
        WHERE status = 'pending' AND due_date < CURRENT_DATE
```

---

## Variáveis de ambiente obrigatórias

| Variável | Onde usar | Descrição |
|---|---|---|
| `CRON_SECRET` | Vercel + pg_cron | Segredo compartilhado para autenticar chamadas dos jobs |
| `RESEND_API_KEY` | Vercel | Chave da API do Resend para envio de e-mail |
| `NEXT_PUBLIC_SITE_URL` | Vercel | URL base do app (ex: `https://prazogestor.tresbits.com`) |
| `SUPABASE_URL` | Vercel | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Chave service role (acesso admin ao Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Chave anon (acesso público do cliente) |
