# Command: Schema SQL

## Objetivo

Gerar o schema completo do banco de dados no Supabase para o PrazoGestor,
incluindo tabelas, RLS, índices e seed data das obrigações fiscais.

## Como usar

```
Execute @commands/schema-sql.md
```

## O que deve ser gerado

### 1. Tabelas (com tipos corretos e constraints)

- `escritorios` — dados do escritório contábil
- `clientes` — CNPJs vinculados ao escritório
- `obrigacoes_template` — catálogo de obrigações por regime
- `obrigacoes_cliente` — instâncias geradas por cliente e ano
- `alertas_log` — registro de alertas enviados
- `feriados` — feriados nacionais sincronizados via BrasilAPI (sem RLS — tabela pública)
- `cnpj_rate_limit` — controle de rate limit de consultas CNPJ por escritório por dia

### 2. RLS (Row Level Security)

Políticas de isolamento por escritório. Ver `@skills/supabase-rls.md`.
- Escritórios só veem seus próprios dados
- Clientes só visíveis para o escritório dono
- Obrigações e alertas seguem o mesmo isolamento
- `feriados` — sem RLS, leitura pública para authenticated
- `cnpj_rate_limit` — RLS por `escritorio_id`

### 3. Índices

- `clientes(escritorio_id)`
- `obrigacoes_cliente(cliente_id, data_vencimento)`
- `obrigacoes_cliente(data_vencimento, status)` — para o cron job de alertas
- `alertas_log(obrigacao_id, tipo)`
- `feriados(data)` — para lookup no ajuste de vencimentos
- `cnpj_rate_limit(escritorio_id, data)` — para checagem rápida no save

### 4. Seed data — obrigações do Simples Nacional

Todas as obrigações definidas em `@context/fiscal.md`, seção "Simples Nacional".
Incluir: nome, sigla, regimes[], frequencia, dia_vencimento, mes_vencimento (para anuais).

### 5. Script de sincronização de feriados

Função SQL ou script TypeScript que consulta `/api/feriados/v1/{ano}` da BrasilAPI
e faz upsert na tabela `feriados`. Rodar manualmente em janeiro de cada ano
e sempre que houver decreto de feriado extra.

Não é um cron job automático — é uma operação manual controlada.

### 6. Função de rate limit de CNPJ

Função SQL `verificar_cnpj_rate_limit(p_escritorio_id uuid)` que:
- Incrementa a contagem do dia para o escritório
- Retorna `true` se abaixo do limite (30/dia)
- Retorna `false` se limite atingido
- Usa `INSERT ... ON CONFLICT DO UPDATE` para upsert atômico

### 7. pg_cron job

Job diário para verificar vencimentos em 7, 3 e 1 dia e inserir na fila de alertas.

## Referências obrigatórias

- `@context/produto.md` — modelo de dados completo, regras de uso da BrasilAPI
- `@context/fiscal.md` — todas as obrigações, prazos e regimes
- `@skills/supabase-rls.md` — padrões de RLS

## Output esperado

Um único arquivo `.sql` com:
1. `CREATE TABLE` para cada tabela (incluindo `feriados` e `cnpj_rate_limit`)
2. `ALTER TABLE ENABLE ROW LEVEL SECURITY`
3. `CREATE POLICY` para cada tabela
4. `CREATE INDEX` para índices necessários
5. `INSERT INTO obrigacoes_template` com seed completo do Simples Nacional
6. `CREATE OR REPLACE FUNCTION verificar_cnpj_rate_limit(...)` com lógica de upsert atômico
7. Script de sincronização de feriados (TypeScript) separado como bloco de código comentado
8. `SELECT cron.schedule(...)` para o pg_cron de alertas

## Observações de implementação

### Tabela `feriados`

```sql
CREATE TABLE feriados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE,
  descricao text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('nacional', 'estadual', 'municipal')),
  estado char(2),
  municipio_ibge text
);
```

Sem RLS — política de leitura pública para `authenticated`.
Não precisa de `escritorio_id` — é catálogo global do sistema.

### Tabela `cnpj_rate_limit`

```sql
CREATE TABLE cnpj_rate_limit (
  escritorio_id uuid NOT NULL REFERENCES escritorios(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  contagem integer NOT NULL DEFAULT 0,
  PRIMARY KEY (escritorio_id, data)
);
```

Limite configurável: 30 consultas/dia por escritório.
Registros antigos podem ser purgados semanalmente via pg_cron.

### Uso da função de rate limit no backend

```typescript
// Route Handler: POST /api/clientes
async function salvarCliente(data: NovoCliente, escritorioId: string) {
  let nomeFinal = data.nome;

  // Verificar rate limit antes de consultar BrasilAPI
  const { data: permitido } = await supabase
    .rpc('verificar_cnpj_rate_limit', { p_escritorio_id: escritorioId });

  if (permitido) {
    try {
      const cnpjData = await buscarCNPJ(data.cnpj);
      if (cnpjData?.razao_social) {
        nomeFinal = cnpjData.razao_social;
      }
    } catch {
      // CNPJ não encontrado ou API indisponível — segue com nome digitado
    }
  }
  // Se rate limit atingido: salva sem enriquecimento, sem erro para o usuário

  return await supabase.from('clientes').insert({
    ...data,
    nome: nomeFinal,
    escritorio_id: escritorioId,
  });
}
```
