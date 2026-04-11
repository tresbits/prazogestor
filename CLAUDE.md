# Tresbits · Sistema de Agentes

Projeto: **Calendário de Obrigações Fiscais SaaS** para escritórios contábeis brasileiros.
Empresa: **Tresbits Serviços de Informática LTDA** — CNPJ 08.686.721/0001-09.

---

## Como usar este sistema

Este repositório define um conjunto de agentes especializados para o projeto Tresbits.
Cada agente tem seu domínio, seu tom e seu escopo de resposta.

### Ativar um agente

```
@agents/fiscal.md    → obrigações, prazos, ISS, Fator R, Reforma Tributária
@agents/produto.md   → MVP, features, roadmap, precificação, UX
@agents/tech.md      → código, Supabase, Next.js, TypeScript, schema SQL
@agents/empresa.md   → Tresbits, CNPJ, CNAE, sede, sócios, endereço fiscal
@agents/mercado.md   → validação, cold outreach, canais, scripts de venda
```

No Claude.ai Projects: mencione "atue como agente fiscal" ou "modo tech".
No Claude Code: use `@agents/fiscal.md` diretamente.

### Executar um command

```
@commands/gerar-vencimentos.md
@commands/schema-sql.md
@commands/cold-outreach.md
@commands/entrevista-beta.md
@commands/plano-semana.md
```

### Consultar contexto

```
@context/empresa.md   → ficha completa da Tresbits
@context/produto.md   → spec do produto, modelo de dados, stack
@context/fiscal.md    → base de obrigações fiscais brasileiras
@context/roadmap.md   → roadmap 90 dias, decisões tomadas, metas
```

---

## Regras gerais para todos os agentes

- Responder sempre em **português brasileiro**
- Ser **direto e acionável** — sem rodeios, sem teoria desnecessária
- Usar **dados reais do projeto** (R$, datas, CNAEs, prazos concretos)
- Quando gerar código: usar a stack definida (Next.js 16, Supabase, TypeScript)
- Quando houver dúvida sobre dados: consultar os arquivos em `context/`
- Não duplicar informação que já existe nos arquivos de contexto — referenciar
- Citar o agente correto quando a pergunta pertencer a outro domínio
- **Para qualquer trabalho de UI/componentes**: consultar `@DESIGN.md` — é a referência de design do projeto

---

## Estrutura do projeto

```
tresbits-agent/
├── CLAUDE.md                  ← este arquivo (entrada do sistema)
├── agents/
│   ├── fiscal.md
│   ├── produto.md
│   ├── tech.md
│   ├── empresa.md
│   └── mercado.md
├── context/
│   ├── empresa.md
│   ├── produto.md
│   ├── fiscal.md
│   └── roadmap.md
├── commands/
│   ├── gerar-vencimentos.md
│   ├── schema-sql.md
│   ├── cold-outreach.md
│   ├── entrevista-beta.md
│   └── plano-semana.md
└── skills/
    ├── tributacao-br.md
    ├── supabase-rls.md
    ├── saas-br.md
    └── validacao-produto.md
```

---

## Estado atual do projeto (atualizar conforme evolui)

- **Fase**: produto funcional completo · pronto para deploy e beta com contadores reais
- **Empresa**: ativa, CNAE a alterar, endereço fiscal a contratar
- **Produto**: app completo — auth, onboarding, painel, clientes, calendário, configurações, busca Spotlight, sidebar com identidade do escritório. Infraestrutura de vencimentos completa: geração ao criar/editar cliente, Vercel Cron mensal, pg_cron marcar-atrasados e alertas-diarios ativos, feriados 2026/2027 populados, alertas por e-mail via Resend+webhook implementados
- **Primeiros clientes**: 0 (meta: 10 betas em 60 dias)
- **MRR**: R$0 (meta mês 3: R$1.470)
