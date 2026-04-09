# Command: Gerar Vencimentos

## Objetivo

Gerar a lógica completa de cálculo de datas de vencimento das obrigações fiscais
para um cliente dado seu regime tributário e características.

## Como usar

```
Execute @commands/gerar-vencimentos.md
```

Forneça os parâmetros:
- `regime`: simples | lucro_presumido | mei
- `tem_empregados`: true | false
- `ano`: número do ano (ex: 2026)

## O que deve ser gerado

1. **Função TypeScript** `gerarVencimentos(cliente, ano)` que retorna array de `ObrigacaoCliente`
2. **Lógica de ajuste** por feriados nacionais (usando lista do BrasilAPI ou array local)
3. **Regra de prorrogação/antecipação** por tributo (varia — ver `@context/fiscal.md`)
4. **Sequência obrigatória** eSocial → EFD-Reinf → DCTFWeb (marcar dependência)
5. **Tipagem TypeScript** completa para todos os tipos usados

## Referências obrigatórias

- `@context/fiscal.md` — regras de vencimento e ajuste por feriado
- `@context/produto.md` — modelo de dados (`obrigacoes_template`, `obrigacoes_cliente`)
- `@skills/supabase-rls.md` — se for gerar como procedure SQL

## Output esperado

```typescript
// Exemplo de assinatura esperada
async function gerarVencimentos(
  clienteId: string,
  regime: 'simples' | 'lucro_presumido' | 'mei',
  temEmpregados: boolean,
  ano: number,
  feriados: Date[]
): Promise<ObrigacaoCliente[]>
```
