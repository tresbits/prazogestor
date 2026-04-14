-- Seed: Obrigações Lucro Presumido e Lucro Real
-- Executar no Supabase SQL Editor

-- ─────────────────────────────────────────────────────────────
-- MENSAIS — LP + LR (com e sem funcionários)
-- ─────────────────────────────────────────────────────────────

-- PIS — mensal, dia 25, LP + LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('PIS', 'PIS', ARRAY['lucro_presumido','lucro_real'], 'monthly', false, 25, NULL, 'postpone', NULL);

-- COFINS — mensal, dia 25, LP + LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('COFINS', 'COFINS', ARRAY['lucro_presumido','lucro_real'], 'monthly', false, 25, NULL, 'postpone', NULL);

-- IRPJ Estimativa Mensal — mensal, dia 31, apenas LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRPJ Estimativa Mensal', 'IRPJ Est.', ARRAY['lucro_real'], 'monthly', false, 31, NULL, 'postpone', NULL);

-- CSLL Estimativa Mensal — mensal, dia 31, apenas LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('CSLL Estimativa Mensal', 'CSLL Est.', ARRAY['lucro_real'], 'monthly', false, 31, NULL, 'postpone', NULL);

-- IRRF — mensal, dia 20, LP + LR, requer funcionários
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRRF', 'IRRF', ARRAY['lucro_presumido','lucro_real'], 'monthly', true, 20, NULL, 'postpone', NULL);

-- INSS — mensal, dia 20, LP + LR, requer funcionários
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('INSS', 'INSS', ARRAY['lucro_presumido','lucro_real'], 'monthly', true, 20, NULL, 'postpone', NULL);

-- FGTS — mensal, dia 7, LP + LR, requer funcionários
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('FGTS', 'FGTS', ARRAY['lucro_presumido','lucro_real'], 'monthly', true, 7, NULL, 'postpone', NULL);

-- DCTFWeb — mensal, dia 15, LP + LR, requer funcionários
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('DCTFWeb', 'DCTFWeb', ARRAY['lucro_presumido','lucro_real'], 'monthly', true, 15, NULL, 'postpone', NULL);

-- ─────────────────────────────────────────────────────────────
-- IRPJ TRIMESTRAL — LP apenas (4 parcelas anuais)
-- Vencimentos: 31/03, 30/06, 30/09, 31/12
-- ─────────────────────────────────────────────────────────────

-- IRPJ Q1 — 31 de março
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRPJ Trimestral 1º Trimestre', 'IRPJ T1', ARRAY['lucro_presumido'], 'annual', false, 31, 3, 'postpone', NULL);

-- IRPJ Q2 — 30 de junho
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRPJ Trimestral 2º Trimestre', 'IRPJ T2', ARRAY['lucro_presumido'], 'annual', false, 30, 6, 'postpone', NULL);

-- IRPJ Q3 — 30 de setembro
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRPJ Trimestral 3º Trimestre', 'IRPJ T3', ARRAY['lucro_presumido'], 'annual', false, 30, 9, 'postpone', NULL);

-- IRPJ Q4 — 31 de dezembro
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('IRPJ Trimestral 4º Trimestre', 'IRPJ T4', ARRAY['lucro_presumido'], 'annual', false, 31, 12, 'postpone', NULL);

-- ─────────────────────────────────────────────────────────────
-- CSLL TRIMESTRAL — LP apenas (4 parcelas anuais)
-- ─────────────────────────────────────────────────────────────

-- CSLL Q1 — 31 de março
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('CSLL Trimestral 1º Trimestre', 'CSLL T1', ARRAY['lucro_presumido'], 'annual', false, 31, 3, 'postpone', NULL);

-- CSLL Q2 — 30 de junho
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('CSLL Trimestral 2º Trimestre', 'CSLL T2', ARRAY['lucro_presumido'], 'annual', false, 30, 6, 'postpone', NULL);

-- CSLL Q3 — 30 de setembro
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('CSLL Trimestral 3º Trimestre', 'CSLL T3', ARRAY['lucro_presumido'], 'annual', false, 30, 9, 'postpone', NULL);

-- CSLL Q4 — 31 de dezembro
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('CSLL Trimestral 4º Trimestre', 'CSLL T4', ARRAY['lucro_presumido'], 'annual', false, 31, 12, 'postpone', NULL);

-- ─────────────────────────────────────────────────────────────
-- ANUAIS — LP + LR
-- ─────────────────────────────────────────────────────────────

-- ECF — 31 de julho, LP + LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('ECF (Escrituração Contábil Fiscal)', 'ECF', ARRAY['lucro_presumido','lucro_real'], 'annual', false, 31, 7, 'postpone', NULL);

-- ECD — 30 de junho, LP + LR
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('ECD (Escrituração Contábil Digital)', 'ECD', ARRAY['lucro_presumido','lucro_real'], 'annual', false, 30, 6, 'postpone', NULL);

-- DIRF — 28 de fevereiro, LP + LR, requer funcionários
INSERT INTO obligation_templates (name, acronym, tax, frequency, requires_employees, due_day, due_month, adjustment_rule, dependency)
VALUES ('DIRF (Declaração Imposto Retido na Fonte)', 'DIRF', ARRAY['lucro_presumido','lucro_real'], 'annual', true, 28, 2, 'postpone', NULL);
