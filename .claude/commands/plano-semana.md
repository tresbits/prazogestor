# Command: Plano da Semana

## Objetivo

Gerar um plano de ação concreto e priorizado para a semana atual,
considerando a fase do projeto e o que já foi feito.

## Como usar

```
Execute @commands/plano-semana.md [semana atual] [o que foi feito]
```

Exemplos:
- `Execute @commands/plano-semana.md semana 1`
- `Execute @commands/plano-semana.md semana 3 — landing page no ar, 3 entrevistas feitas`

## O que deve ser gerado

### 1. Contexto da semana

Qual é o objetivo principal desta semana segundo o roadmap (`@context/roadmap.md`).
O que depende desta semana para a semana seguinte funcionar.

### 2. Lista de tarefas priorizadas (máximo 5)

Ordenadas por impacto. Para cada tarefa:
- O que fazer (ação específica, não vaga)
- Resultado esperado (como saber que está feito)
- Tempo estimado
- Dependências

### 3. Decisão da semana (se houver)

Uma decisão concreta que precisa ser tomada esta semana.
Apresentar as opções com prós/contras e uma recomendação clara.

### 4. Métricas da semana

O que medir ao final da semana para saber se foi produtiva.
Máximo 3 métricas concretas.

### 5. O que NÃO fazer esta semana

Lista curta do que pode esperar — para evitar dispersão.

## Referências obrigatórias

- `@context/roadmap.md` — sprint atual, metas, decisões tomadas
- `@context/produto.md` — o que está no MVP (não construir o que está fora)
- Fase atual do projeto (pré-MVP, beta, pagantes)

## Formato de output

Resposta direta, sem introdução. Começa com "**Semana X — [objetivo central]**"
seguido das tarefas numeradas. Sem parágrafo introdutório.
