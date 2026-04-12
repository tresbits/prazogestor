# Contexto Operacional · PrazoGestor

Referência técnica para operar, testar e depurar a infraestrutura de jobs e e-mail.

---

## Jobs agendados

| Job | Frequência | O que faz |
|---|---|---|
| `marcar-atrasados` | pg_cron — diário 00:01 | Atualiza `obrigacoes_cliente.status = 'atrasado'` onde data_vencimento < hoje e status != 'concluido' |
| `inserir-alertas` | pg_cron — diário 07:00 | Insere linhas em `alertas_log` para vencimentos em 1, 3 e 7 dias; ignora obrigações já alertadas no mesmo tipo |
| `digest-email` | pg_cron — diário 07:05 | Chama `POST /api/alertas/digest` via pg_net; agrupa alertas por escritório e envia um e-mail por escritório |
| `gerar-vencimentos-mes` | pg_cron — dia 1 de cada mês 03:00 | Gera `obrigacoes_cliente` do mês seguinte para todos os clientes ativos |

> Os jobs de alertas são escalonados: inserir às 07:00, digest às 07:05 — garante que os registros já existem quando o digest roda.

---

## Endpoint de digest

**Rota:** `POST /api/alertas/digest`

**Auth:** header `x-cron-secret: <CRON_SECRET>`

**O que faz:**
1. Busca todos os `alertas_log WHERE email_enviado_em IS NULL` com joins completos (escritório → cliente → template)
2. Agrupa por `escritorio_id`
3. Para cada escritório com `alertas_email_ativo = true`: busca e-mail do usuário, renderiza template, envia via Resend
4. Atualiza `email_enviado_em = now()` nos logs processados

**Resposta de sucesso:**
```json
{ "ok": true, "enviados": 5, "escritorios": 2 }
```

---

## Testar o digest manualmente

Útil para processar registros pendentes sem esperar o cron.

```bash
# Produção
curl -X POST https://prazogestor.tresbits.com/api/alertas/digest \
  -H "x-cron-secret: SEU_CRON_SECRET"

# Local (dev server rodando)
curl -X POST http://localhost:3000/api/alertas/digest \
  -H "x-cron-secret: SEU_CRON_SECRET"
```

O valor de `CRON_SECRET` está nas variáveis de ambiente do Vercel.

---

## Checklist de troubleshooting — digest retorna `enviados: 0`

1. **Verificar registros pendentes no banco**
   ```sql
   SELECT id, tipo, email_enviado_em
   FROM alertas_log
   WHERE email_enviado_em IS NULL;
   ```

2. **Verificar se o escritório tem alertas ativos**
   ```sql
   SELECT id, nome, alertas_email_ativo
   FROM escritorios
   WHERE alertas_email_ativo = true;
   ```

3. **Verificar se o usuário tem e-mail cadastrado**
   No Supabase Dashboard → Authentication → Users — confirmar que o `user_id` do escritório tem e-mail válido.

4. **Verificar variável `CRON_SECRET`**
   No Vercel Dashboard → Settings → Environment Variables — confirmar que `CRON_SECRET` existe e está igual ao valor usado no header.

5. **Verificar chave do Resend**
   Confirmar que `RESEND_API_KEY` está configurada nas env vars e que o domínio `alertas@prazogestor.tresbits.com` está verificado no painel do Resend.

6. **Ver logs de erro**
   Vercel Dashboard → Deployments → Functions → `api/alertas/digest` — logs em tempo real ou histórico.

---

## Checklist de troubleshooting — pg_cron não roda

1. **Listar jobs agendados**
   ```sql
   SELECT jobid, schedule, command, active
   FROM cron.job;
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
     headers := '{"x-cron-secret": "SEU_CRON_SECRET"}'::jsonb,
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
SELECT * FROM cron.job;

-- Desativar um job temporariamente
UPDATE cron.job SET active = false WHERE jobname = 'digest-email';

-- Reativar
UPDATE cron.job SET active = true WHERE jobname = 'digest-email';

-- Remover um job
SELECT cron.unschedule('digest-email');

-- Recriar o job de digest
SELECT cron.schedule(
  'digest-email',
  '5 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://prazogestor.tresbits.com/api/alertas/digest',
    headers := '{"x-cron-secret": "' || current_setting('app.cron_secret') || '"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
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

---

## Fluxo completo de alertas (referência)

```
07:00 — pg_cron: inserir-alertas
  └── INSERT INTO alertas_log (obrigacao_id, tipo)
      WHERE data_vencimento IN (hoje+1, hoje+3, hoje+7)
      AND NOT já alertado com esse tipo

07:05 — pg_cron: digest-email
  └── pg_net: POST /api/alertas/digest
        └── SELECT alertas_log WHERE email_enviado_em IS NULL
              └── Agrupa por escritório
                    └── Envia 1 e-mail por escritório (Resend)
                          └── UPDATE alertas_log SET email_enviado_em = now()
```
