-- Corrige os jobs pg_cron para usar os nomes de tabelas/colunas em inglês
-- (migração PT→EN não havia atualizado os jobs)
-- Executar no Supabase SQL Editor

-- ─────────────────────────────────────────────────────────────
-- 1. marcar-atrasados
-- ─────────────────────────────────────────────────────────────
SELECT cron.unschedule('prazogestor-marcar-atrasados');

SELECT cron.schedule(
  'prazogestor-marcar-atrasados',
  '5 11 * * *',
  $$
    UPDATE client_obligations
    SET status = 'overdue'
    WHERE status = 'pending'
      AND due_date < CURRENT_DATE;
  $$
);

-- ─────────────────────────────────────────────────────────────
-- 2. alertas-diarios
-- ─────────────────────────────────────────────────────────────
SELECT cron.unschedule('prazogestor-alertas-diarios');

SELECT cron.schedule(
  'prazogestor-alertas-diarios',
  '0 11 * * *',
  $$
    -- Insere alertas não duplicados
    INSERT INTO alert_logs (obligation_id, type)
    SELECT oc.id, alerta.tipo
    FROM client_obligations oc
    CROSS JOIN (VALUES ('7d'), ('3d'), ('1d')) AS alerta(tipo)
    WHERE oc.status = 'pending'
      AND (
        (alerta.tipo = '7d' AND oc.due_date = CURRENT_DATE + 7)
        OR (alerta.tipo = '3d' AND oc.due_date = CURRENT_DATE + 3)
        OR (alerta.tipo = '1d' AND oc.due_date = CURRENT_DATE + 1)
      )
      AND NOT EXISTS (
        SELECT 1 FROM alert_logs al
        WHERE al.obligation_id = oc.id
          AND al.type = alerta.tipo
      );

    -- Chama o endpoint de digest
    SELECT net.http_post(
      url := 'https://prazogestor.tresbits.com/api/alertas/digest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', current_setting('app.cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ─────────────────────────────────────────────────────────────
-- Verificação: confirma os jobs ativos
-- ─────────────────────────────────────────────────────────────
SELECT jobname, schedule, active
FROM cron.job
ORDER BY jobname;
