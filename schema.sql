-- =============================================================
-- PrazoGestor · Schema SQL completo
-- Supabase (Postgres 15+)
-- Executar na ordem: tabelas → RLS → índices → seed → funções → cron
-- =============================================================


-- =============================================================
-- 1. TABELAS
-- =============================================================

CREATE TABLE escritorios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  estado      char(2) NOT NULL,
  plano                text NOT NULL DEFAULT 'trial' CHECK (plano IN ('trial', 'essencial', 'profissional', 'agencia', 'beta')),
  alertas_email_ativo  boolean NOT NULL DEFAULT true,
  onboarding_dispensado    boolean NOT NULL DEFAULT false,
  onboarding_pulou_cliente boolean NOT NULL DEFAULT false, -- métrica: usuário pulou cadastro do 1º cliente
  onboarding_concluido     boolean NOT NULL DEFAULT false, -- controle de fluxo: onboarding completo (flow A ou B)
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clientes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id   uuid NOT NULL REFERENCES escritorios(id) ON DELETE CASCADE,
  cnpj            char(14) NOT NULL,
  nome            text NOT NULL,
  regime          text NOT NULL CHECK (regime IN ('simples', 'mei')), -- lucro_presumido e lucro_real: fase 2 (sem seed de obrigações)
  tem_empregados  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (escritorio_id, cnpj)
);

CREATE TABLE obrigacoes_template (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text NOT NULL,
  sigla           text NOT NULL,
  regimes         text[] NOT NULL,
  frequencia      text NOT NULL CHECK (frequencia IN ('mensal', 'trimestral', 'anual')),
  requer_empregados boolean NOT NULL DEFAULT false,
  -- para obrigações mensais/trimestrais: dia fixo do mês (null = último dia útil)
  dia_vencimento  integer CHECK (dia_vencimento BETWEEN 1 AND 31),
  -- para obrigações anuais: mês fixo
  mes_vencimento  integer CHECK (mes_vencimento BETWEEN 1 AND 12),
  -- regra de ajuste quando cai em feriado/fim de semana
  regra_ajuste    text NOT NULL DEFAULT 'prorroga' CHECK (regra_ajuste IN ('prorroga', 'antecipa')),
  -- campo livre para alertas de dependência (ex: "Requer eSocial transmitido")
  dependencia     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE obrigacoes_cliente (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  template_id     uuid NOT NULL REFERENCES obrigacoes_template(id),
  data_vencimento date NOT NULL,
  status          text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'atrasado')),
  concluido_por   text,
  concluido_em    timestamptz,
  nota            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE alertas_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obrigacao_id      uuid NOT NULL REFERENCES obrigacoes_cliente(id) ON DELETE CASCADE,
  tipo              text NOT NULL CHECK (tipo IN ('7d', '3d', '1d')),
  enviado_em        timestamptz NOT NULL DEFAULT now(),
  email_enviado_em  timestamptz  -- null até o webhook confirmar envio pelo Resend
);

-- Catálogo global de feriados — sem RLS, leitura pública
CREATE TABLE feriados (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date NOT NULL UNIQUE,
  descricao   text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('nacional', 'estadual', 'municipal')),
  estado      char(2),
  municipio_ibge text
);

-- Controle de rate limit de consultas CNPJ por escritório por dia
CREATE TABLE cnpj_rate_limit (
  escritorio_id   uuid NOT NULL REFERENCES escritorios(id) ON DELETE CASCADE,
  data            date NOT NULL DEFAULT CURRENT_DATE,
  contagem        integer NOT NULL DEFAULT 0,
  PRIMARY KEY (escritorio_id, data)
);


-- =============================================================
-- 2. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE escritorios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE obrigacoes_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE obrigacoes_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE feriados          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnpj_rate_limit   ENABLE ROW LEVEL SECURITY;

-- escritorios: usuário vê e edita apenas seu próprio escritório
CREATE POLICY "escritorios_select_own"
ON escritorios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "escritorios_insert_own"
ON escritorios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "escritorios_update_own"
ON escritorios FOR UPDATE
USING (auth.uid() = user_id);

-- clientes: visíveis apenas para o escritório dono
CREATE POLICY "clientes_select_own"
ON clientes FOR SELECT
USING (
  escritorio_id IN (
    SELECT id FROM escritorios WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clientes_insert_own"
ON clientes FOR INSERT
WITH CHECK (
  escritorio_id IN (
    SELECT id FROM escritorios WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clientes_update_own"
ON clientes FOR UPDATE
USING (
  escritorio_id IN (
    SELECT id FROM escritorios WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clientes_delete_own"
ON clientes FOR DELETE
USING (
  escritorio_id IN (
    SELECT id FROM escritorios WHERE user_id = auth.uid()
  )
);

-- obrigacoes_template: catálogo público — leitura para authenticated
CREATE POLICY "obrigacoes_template_read"
ON obrigacoes_template FOR SELECT
TO authenticated
USING (true);

-- obrigacoes_cliente: isolamento via cliente → escritório
CREATE POLICY "obrigacoes_cliente_select_own"
ON obrigacoes_cliente FOR SELECT
USING (
  cliente_id IN (
    SELECT c.id FROM clientes c
    JOIN escritorios e ON c.escritorio_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

CREATE POLICY "obrigacoes_cliente_insert_own"
ON obrigacoes_cliente FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM clientes c
    JOIN escritorios e ON c.escritorio_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

CREATE POLICY "obrigacoes_cliente_update_own"
ON obrigacoes_cliente FOR UPDATE
USING (
  cliente_id IN (
    SELECT c.id FROM clientes c
    JOIN escritorios e ON c.escritorio_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

-- alertas_log: isolamento via obrigacao → cliente → escritório
CREATE POLICY "alertas_log_select_own"
ON alertas_log FOR SELECT
USING (
  obrigacao_id IN (
    SELECT oc.id FROM obrigacoes_cliente oc
    JOIN clientes c ON oc.cliente_id = c.id
    JOIN escritorios e ON c.escritorio_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

-- feriados: leitura pública para authenticated (catálogo global)
CREATE POLICY "feriados_read"
ON feriados FOR SELECT
TO authenticated
USING (true);

-- cnpj_rate_limit: isolamento por escritório
CREATE POLICY "cnpj_rate_limit_own"
ON cnpj_rate_limit FOR ALL
USING (
  escritorio_id IN (
    SELECT id FROM escritorios WHERE user_id = auth.uid()
  )
);


-- =============================================================
-- 3. ÍNDICES
-- =============================================================

-- clientes
CREATE INDEX idx_clientes_escritorio_id
ON clientes (escritorio_id);

-- obrigacoes_cliente: consultas do painel (próximos 30 dias)
CREATE INDEX idx_obrigacoes_cliente_cliente_vencimento
ON obrigacoes_cliente (cliente_id, data_vencimento);

-- obrigacoes_cliente: consulta do cron job de alertas
CREATE INDEX idx_obrigacoes_cliente_vencimento_status
ON obrigacoes_cliente (data_vencimento, status);

-- alertas_log: checar se alerta já foi enviado
CREATE INDEX idx_alertas_log_obrigacao_tipo
ON alertas_log (obrigacao_id, tipo);

-- feriados: lookup no ajuste de datas de vencimento
CREATE INDEX idx_feriados_data
ON feriados (data);

-- cnpj_rate_limit: checagem rápida no save do cliente
CREATE INDEX idx_cnpj_rate_limit_escritorio_data
ON cnpj_rate_limit (escritorio_id, data);


-- =============================================================
-- 4. SEED — obrigações do Simples Nacional e MEI
-- =============================================================

INSERT INTO obrigacoes_template
  (nome, sigla, regimes, frequencia, requer_empregados, dia_vencimento, mes_vencimento, regra_ajuste, dependencia)
VALUES

-- ── Mensais · todos ──────────────────────────────────────────
(
  'Documento de Arrecadação do Simples Nacional',
  'DAS',
  ARRAY['simples', 'mei'],
  'mensal', false, 20, null, 'prorroga', null
),
(
  'Apuração do Simples Nacional',
  'PGDAS-D',
  ARRAY['simples'],
  'mensal', false, 20, null, 'prorroga', null
),

-- ── Mensais · com empregados ─────────────────────────────────
(
  'Escrituração Digital das Obrigações Fiscais, Previdenciárias e Trabalhistas',
  'eSocial',
  ARRAY['simples', 'mei'],
  'mensal', true, 7, null, 'antecipa', null
),
(
  'Fundo de Garantia por Tempo de Serviço',
  'FGTS',
  ARRAY['simples', 'mei'],
  'mensal', true, 7, null, 'antecipa', null
),
(
  'Escrituração Fiscal Digital de Retenções e Outras Informações Fiscais',
  'EFD-Reinf',
  ARRAY['simples', 'mei'],
  'mensal', true, 15, null, 'prorroga', 'Requer eSocial transmitido'
),
(
  'Declaração de Débitos e Créditos Tributários Federais Previdenciários e de Outras Entidades e Fundos',
  'DCTFWeb',
  ARRAY['simples', 'mei'],
  -- dia_vencimento = 15 do mês seguinte à competência (prazo padrão pós-EFD-Reinf)
  -- gerarVencimentos() deve tratar a dependência: só gerar após EFD-Reinf transmitido
  'mensal', true, 15, null, 'prorroga', 'Requer EFD-Reinf transmitido'
),

-- ── Anuais · Simples ─────────────────────────────────────────
(
  'Declaração de Informações Socioeconômicas e Fiscais',
  'DEFIS',
  ARRAY['simples'],
  'anual', false, 31, 3, 'prorroga', null
),
(
  'DCTFWeb Anual — 13º salário',
  'DCTFWeb Anual',
  ARRAY['simples', 'mei'],
  'anual', true, 20, 12, 'prorroga', null
),

-- ── Anuais · MEI ─────────────────────────────────────────────
(
  'Declaração Anual do Simples Nacional para o Microempreendedor Individual',
  'DASN-SIMEI',
  ARRAY['mei'],
  'anual', false, 31, 5, 'prorroga', null
);


-- =============================================================
-- 5. FUNÇÃO — rate limit de CNPJ
-- =============================================================

CREATE OR REPLACE FUNCTION verificar_cnpj_rate_limit(p_escritorio_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_limite   integer := 30;
  v_contagem integer;
BEGIN
  -- Garante que o escritório pertence ao usuário autenticado
  IF NOT EXISTS (
    SELECT 1 FROM escritorios WHERE id = p_escritorio_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  INSERT INTO cnpj_rate_limit (escritorio_id, data, contagem)
  VALUES (p_escritorio_id, CURRENT_DATE, 1)
  ON CONFLICT (escritorio_id, data)
  DO UPDATE SET contagem = cnpj_rate_limit.contagem + 1
  RETURNING contagem INTO v_contagem;

  RETURN v_contagem <= v_limite;
END;
$$;


-- =============================================================
-- 6. FUNÇÃO — purge semanal de cnpj_rate_limit
-- Remove registros com mais de 7 dias para não acumular lixo
-- =============================================================

CREATE OR REPLACE FUNCTION purgar_cnpj_rate_limit()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM cnpj_rate_limit WHERE data < CURRENT_DATE - 7;
$$;


-- =============================================================
-- 7. PG_CRON — alertas diários e purge
-- =============================================================

-- Alertas de vencimento: roda todo dia às 8h (horário de Brasília = UTC-3 → 11h UTC)
SELECT cron.schedule(
  'prazogestor-alertas-diarios',
  '0 11 * * *',
  $$
    INSERT INTO alertas_log (obrigacao_id, tipo)
    SELECT oc.id, alerta.tipo
    FROM obrigacoes_cliente oc
    CROSS JOIN (VALUES ('7d'), ('3d'), ('1d')) AS alerta(tipo)
    WHERE oc.status = 'pendente'
      AND (
        (alerta.tipo = '7d' AND oc.data_vencimento = CURRENT_DATE + 7)
        OR (alerta.tipo = '3d' AND oc.data_vencimento = CURRENT_DATE + 3)
        OR (alerta.tipo = '1d' AND oc.data_vencimento = CURRENT_DATE + 1)
      )
      AND NOT EXISTS (
        SELECT 1 FROM alertas_log al
        WHERE al.obrigacao_id = oc.id
          AND al.tipo = alerta.tipo
      );
  $$
);

-- Purge semanal do rate limit de CNPJ: toda segunda às 3h UTC
SELECT cron.schedule(
  'prazogestor-purge-cnpj-rate-limit',
  '0 3 * * 1',
  $$ SELECT purgar_cnpj_rate_limit(); $$
);

-- Atualizar status para 'atrasado' quando data_vencimento < hoje e ainda 'pendente'
SELECT cron.schedule(
  'prazogestor-marcar-atrasados',
  '5 11 * * *',
  $$
    UPDATE obrigacoes_cliente
    SET status = 'atrasado'
    WHERE status = 'pendente'
      AND data_vencimento < CURRENT_DATE;
  $$
);


-- =============================================================
-- 8. SCRIPT DE SINCRONIZAÇÃO DE FERIADOS (TypeScript)
-- Salvar como: scripts/sync-feriados.ts
-- Rodar: npx tsx scripts/sync-feriados.ts 2026
-- =============================================================

/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role para bypass de RLS
);

async function sincronizarFeriados(ano: number) {
  const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
  if (!res.ok) throw new Error(`Erro ao buscar feriados de ${ano}: ${res.status}`);

  const feriados = await res.json();

  const rows = feriados.map((f: { date: string; name: string; type: string }) => ({
    data: f.date,
    descricao: f.name,
    tipo: 'nacional' as const,
  }));

  const { error } = await supabase
    .from('feriados')
    .upsert(rows, { onConflict: 'data' });

  if (error) throw error;
  console.log(`✓ ${rows.length} feriados de ${ano} sincronizados.`);
}

const ano = parseInt(process.argv[2] ?? String(new Date().getFullYear()));
sincronizarFeriados(ano).catch((err) => {
  console.error(err);
  process.exit(1);
});
*/
