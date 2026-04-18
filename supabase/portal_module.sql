-- Módulo 2: Portal do Cliente
-- Migration + RLS policies

-- ─────────────────────────────────────────────────────────────
-- 1. client_obligations — campo de valor
-- ─────────────────────────────────────────────────────────────

ALTER TABLE client_obligations
  ADD COLUMN IF NOT EXISTS value numeric(12,2),
  ADD COLUMN IF NOT EXISTS value_source text CHECK (value_source IN ('manual', 'auto'));

-- ─────────────────────────────────────────────────────────────
-- 2. clients — campos do portal
-- ─────────────────────────────────────────────────────────────

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS portal_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS portal_invite_token text,
  ADD COLUMN IF NOT EXISTS portal_invite_sent_at timestamptz;

-- ─────────────────────────────────────────────────────────────
-- 3. RLS — portal user (empresário)
-- ─────────────────────────────────────────────────────────────

-- clients: empresário vê apenas o próprio registro
CREATE POLICY "portal users can view their own client"
ON clients FOR SELECT
USING (portal_user_id = auth.uid() AND portal_enabled = true);

-- client_obligations: empresário vê apenas as próprias obrigações
CREATE POLICY "portal users can view their own obligations"
ON client_obligations FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE portal_user_id = auth.uid()
      AND portal_enabled = true
  )
);

-- obligation_templates: leitura pública autenticada (nomes e siglas)
CREATE POLICY "authenticated users can read obligation templates"
ON obligation_templates FOR SELECT
TO authenticated
USING (true);

-- ─────────────────────────────────────────────────────────────
-- Verificação
-- ─────────────────────────────────────────────────────────────

-- Confirma colunas adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('client_obligations', 'clients')
  AND column_name IN ('value', 'value_source', 'portal_enabled', 'portal_user_id', 'portal_invite_token', 'portal_invite_sent_at')
ORDER BY table_name, column_name;
