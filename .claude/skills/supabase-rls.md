# Skill: Supabase RLS para Multi-tenancy

## Conceito

Row Level Security (RLS) isola dados por tenant (escritório) sem nenhuma lógica adicional no backend.
Cada escritório só vê seus próprios dados — garantido pelo banco, não pelo código.

## Padrão de implementação

### 1. Habilitar RLS em todas as tabelas

```sql
ALTER TABLE escritorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE obrigacoes_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_log ENABLE ROW LEVEL SECURITY;
```

### 2. Política de acesso para escritorios

```sql
-- Escritório só vê seu próprio registro
CREATE POLICY "escritorio_select_own"
ON escritorios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "escritorio_update_own"
ON escritorios FOR UPDATE
USING (auth.uid() = user_id);
```

### 3. Política de acesso para clientes

```sql
-- Clientes visíveis apenas para o escritório dono
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
```

### 4. Política para obrigacoes_cliente (via cliente)

```sql
CREATE POLICY "obrigacoes_select_own"
ON obrigacoes_cliente FOR SELECT
USING (
  cliente_id IN (
    SELECT c.id FROM clientes c
    JOIN escritorios e ON c.escritorio_id = e.id
    WHERE e.user_id = auth.uid()
  )
);
```

### 5. Tabelas sem RLS (públicas para leitura)

```sql
-- obrigacoes_template é catálogo público — não precisa de RLS
-- Mas precisa de política explícita para leitura
CREATE POLICY "obrigacoes_template_read"
ON obrigacoes_template FOR SELECT
TO authenticated
USING (true);
```

## Padrão para service role (cron jobs)

O pg_cron roda como service role e bypassa RLS automaticamente.
Para o job de alertas, isso é desejado — ele acessa todas as obrigações.

```sql
-- Verificar no pg_cron: usa service_role, não anon
SELECT cron.schedule(
  'alertas-diarios',
  '0 8 * * *',  -- 8h todo dia
  $$
    SELECT enviar_alertas_vencimento();
  $$
);
```

## Armadilhas comuns

### ❌ Esquecer de criar a política INSERT

RLS bloqueia INSERT por padrão se não houver política. Criar sempre as 4: SELECT, INSERT, UPDATE, DELETE.

### ❌ Usar service_role no cliente

Nunca expor a `service_role` key no frontend. Use sempre a `anon` ou `authenticated` key.

### ❌ Sub-query sem índice em políticas complexas

A política que faz JOIN em `clientes → escritorios` roda em cada query.
Garantir índice em `clientes(escritorio_id)` e `escritorios(user_id)`.

### ❌ RLS habilitado mas sem política

`ENABLE ROW LEVEL SECURITY` sem nenhuma `CREATE POLICY` bloqueia tudo para usuários autenticados.
Verificar sempre com `SELECT * FROM pg_policies WHERE tablename = 'sua_tabela'`.

## Teste de isolamento

```sql
-- Testar como um usuário específico
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid-aqui"}';
SELECT * FROM clientes; -- Deve retornar apenas clientes deste usuário
```

## Estrutura de auth para multi-tenant

```typescript
// Cada escritório é vinculado ao auth.uid() do sócio principal
// Outros usuários do mesmo escritório: tabela escritorio_usuarios

escritorio_usuarios (
  id uuid,
  escritorio_id uuid references escritorios(id),
  user_id uuid references auth.users(id),
  papel text -- 'admin' | 'colaborador'
)
```

Para este caso, a política de `clientes` deve checar `escritorio_usuarios`:

```sql
CREATE POLICY "clientes_select_via_membro"
ON clientes FOR SELECT
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM escritorio_usuarios
    WHERE user_id = auth.uid()
  )
);
```
