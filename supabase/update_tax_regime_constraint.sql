-- Atualiza o check constraint de tax_regime nas tabelas clients e obligation_templates
-- para incluir lucro_presumido e lucro_real

-- Tabela clients
ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clientes_regime_check;

ALTER TABLE clients
  ADD CONSTRAINT clientes_regime_check
  CHECK (tax_regime IN ('simples', 'mei', 'lucro_presumido', 'lucro_real'));

-- Tabela obligation_templates (array de enum, sem constraint de check nativo —
-- apenas confirma que não há constraint antiga com nome conhecido)
ALTER TABLE obligation_templates
  DROP CONSTRAINT IF EXISTS obligation_templates_tax_check;
