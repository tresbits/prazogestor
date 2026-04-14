-- Migration: envio de e-mail ao cliente
-- Executar no Supabase SQL Editor

-- 1. Coluna email no cadastro de clientes (opcional)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Template de e-mail do escritório para envio ao cliente
ALTER TABLE offices
  ADD COLUMN IF NOT EXISTS client_email_template text;

-- 3. Log de e-mails enviados ao cliente
CREATE TABLE IF NOT EXISTS client_email_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  office_id       uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  sent_to         text NOT NULL,
  obligations_count int NOT NULL DEFAULT 0,
  sent_at         timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE client_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "office can manage own email logs"
  ON client_email_log
  FOR ALL
  USING (
    office_id IN (
      SELECT id FROM offices WHERE user_id = auth.uid()
    )
  );
