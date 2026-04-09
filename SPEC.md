# PrazoGestor — Especificação de Design de Produto

> Documento de referência para design de telas e componentes.
> Destinado a designers, agentes de IA e colaboradores de frontend.

---

## Referências visuais

As telas de referência estão em `.claude/design/`. Cada pasta contém `screen.png` e `code.html`.

| Pasta | Tela | Modo |
|-------|------|------|
| `painel_de_vencimentos/` | Painel principal | Claro |
| `painel_de_vencimentos_dark/` | Painel principal | Escuro |
| `lista_de_clientes/` | Lista de clientes | Claro |
| `lista_de_clientes_dark/` | Lista de clientes | Escuro |
| `editar_cliente_modal/` | Modal editar cliente | Claro |
| `editar_cliente_modal_dark/` | Modal editar cliente | Escuro |
| `monolith_frost/DESIGN.md` | Design system completo | — |

**Sempre ler as imagens de referência antes de implementar qualquer tela.**

---

## 1. O Produto

**PrazoGestor** é um SaaS B2B para escritórios contábeis brasileiros.

O problema central: contadores gerenciam dezenas de clientes com regimes tributários distintos (Simples Nacional, MEI). Cada cliente tem um calendário fiscal próprio — DAS, DARF, GFIP, eSocial, DCTFWeb — com vencimentos mensais e anuais. Hoje esse controle vive em planilhas e post-its. Perder um prazo significa multa para o cliente final.

**A solução**: o sistema gera automaticamente o calendário fiscal de cada cliente, exibe os próximos vencimentos em um painel unificado, e envia alertas por e-mail 7, 3 e 1 dia antes do vencimento. O contador marca como concluído com um clique.

### Entidades principais
- **Escritório** — a conta do SaaS. Um escritório contábil por conta. Multi-tenant via RLS.
- **Cliente** — empresa do escritório (CNPJ, regime, tem empregados?).
- **Obrigação** — tarefa fiscal com data de vencimento, status (pendente/concluído/atrasado) e sigla (DAS, DARF, GFIP…).
- **Alerta** — e-mail automático disparado antes do vencimento.

### Usuário típico
Contador, 30–55 anos, escritório com 10–80 clientes. Usa o sistema no desktop durante o expediente. Precisa de clareza e velocidade — não quer aprender um sistema novo, quer parar de perder prazo.

---

## 2. Mapa de Telas

### Fluxo de autenticação (público)
| Rota | Tela | Finalidade |
|------|------|-----------|
| `/login` | Login | Acesso à conta do escritório |
| `/signup` | Cadastro | Criação de nova conta (trial 14 dias) |
| `/confirmar` | Confirmação | Instrução pós-cadastro para confirmar e-mail |

### Onboarding (wizard 3 passos)
| Rota | Tela | Finalidade |
|------|------|-----------|
| `/onboarding/escritorio` | Cadastrar escritório | Nome do escritório, estado — passo 1 |
| `/onboarding/cliente` | Cadastrar primeiro cliente | CNPJ, regime, empregados — passo 2 |
| `/onboarding/pronto` | Momento "aha" | Exibe o calendário gerado automaticamente — passo 3 |

### App autenticado
| Rota | Tela | Finalidade |
|------|------|-----------|
| `/painel` | Painel de vencimentos | Visão por cards de cliente, próximos 30 dias |
| `/clientes` | Lista de clientes | Todos os clientes do escritório |
| `/clientes/novo` | Novo cliente | Formulário de cadastro |
| `/clientes/[id]/editar` | Editar cliente | Edição em modal sobreposto |
| `/clientes/[id]/prazos` | Prazos do cliente | Timeline de obrigações por mês/ano |
| `/configuracoes` | Configurações | Dados do escritório, preferências de alerta |

### Modais (sobrepostos a qualquer tela)
| Modal | Disparo | Finalidade |
|-------|---------|-----------|
| Editar cliente | Clique no ícone ✏ na lista | Alterar nome, regime, empregados |
| Concluir obrigação | Clique em "Concluir" | Confirmar conclusão + responsável |
| Detalhes da obrigação | Clique na linha | Ver nome completo, histórico, nota |
| Confirmação de ação | Ações destrutivas | Confirmar exclusão ou regeneração |

---

## 3. Linguagem Visual

### Filosofia

Design inspirado em **dois sistemas**: o minimalismo radical do **Ollama** (grayscale, zero sombras, geometria binária) e a profundidade espacial do **Apple VisionOS** (materiais de vidro, camadas, blur). O resultado é uma interface de alta legibilidade — dados densos exibidos com clareza — que se sente leve e moderna.

**Em resumo**:
- Superfícies planas com paleta grayscale → derivado do Ollama
- Modais e sobreposições com vidro fosco translúcido → derivado do VisionOS
- Tipografia arredondada SF Pro Rounded nos títulos → unifica as duas referências

### Paleta (modo claro / escuro)

Todas as cores são variáveis CSS definidas em `globals.css`. **Nunca usar hex diretamente no código.**

| Token Tailwind | Papel | Claro | Escuro |
|---|---|---|---|
| `bg-background` | Canvas principal | `#ffffff` | `#1a1a1a` |
| `bg-card` | Superfície de card | `#ffffff` | `#242424` |
| `bg-muted` | Fundo sutil / hover | `#f5f5f5` | `#2e2e2e` |
| `bg-popover` | Dropdowns, tooltips | `#ffffff` | `#242424` |
| `text-foreground` | Texto principal | `#0f0f0f` | `#f5f5f5` |
| `text-muted-foreground` | Texto secundário / labels | `#737373` | `#a3a3a3` |
| `border-border` | Bordas | `#e5e5e5` | `rgba(255,255,255,0.10)` |
| `text-destructive` | Atrasado / erro | `oklch(0.577 0.245 27.3)` | `oklch(0.704 0.191 22.2)` |
| `bg-destructive/10` | Fundo alerta vermelho | — | — |
| Amber (urgente) | 1–3 dias | `text-amber-500` | `text-amber-400` |

#### Semântica de urgência (obrigações)
| Estado | Cor de texto | Fundo da linha |
|--------|-------------|----------------|
| Atrasado / Hoje | `text-destructive` | `bg-destructive/5` |
| 1–3 dias | `text-amber-500` | `bg-amber-500/5` |
| Normal (4+ dias) | `text-muted-foreground` | transparente |
| Concluído | `text-muted-foreground` + `line-through` | transparente + `opacity-50` |

### Sistema de border-radius (binário, derivado do Ollama)

> **Regra absoluta**: apenas dois valores de raio. Nada entre 12px e pill.

| Tipo | Valor | Onde usar |
|------|-------|-----------|
| Container | `12px` (`rounded-[12px]`) | Cards, modais, dropdowns, code blocks, painéis |
| Interativo (pill) | `9999px` (`rounded-full`) | Buttons, inputs, tabs, badges, tags, avatars |

### Sombras

**Zero sombras** em superfícies normais (herança Ollama).

**Exceção — modais VisionOS**: `box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)` para criar a sensação de painel flutuante.

### Tipografia

| Papel | Fonte | Tamanho | Peso |
|-------|-------|---------|------|
| Títulos de tela, logo | SF Pro Rounded → `font-heading` | `text-xl` (20px) | `font-medium` (500) |
| Títulos de card | SF Pro Rounded → `font-heading` | `text-base` (16px) | `font-medium` (500) |
| Corpo padrão | Geist Sans → `font-sans` | `text-sm` (14px) | `font-normal` (400) |
| Sigla de obrigação | Geist Sans | `text-xs` (12px) | `font-semibold` (600) |
| Metadata / labels | Geist Sans | `text-xs` (12px) | `font-normal` (400) |
| Código / CNPJ | Geist Mono → `font-mono` | `text-xs` (12px) | `font-normal` (400) |

---

## 4. Componentes

### Botões
Sempre pill-shaped. Sem ícones ornamentais desnecessários.

| Variante | Background | Texto | Uso |
|----------|-----------|-------|-----|
| Default (primário) | `bg-foreground` | `text-background` | Ação principal da tela |
| Outline (secundário) | transparente | `text-foreground` | Cancelar, ação alternativa |
| Destructive | `bg-destructive` | branco | Excluir, ação irreversível |
| Ghost | transparente | `text-muted-foreground` | Ações de baixo impacto |

Padding: `h-9 px-4` (default) · `h-8 px-3` (sm)

### Inputs
Pill-shaped (`rounded-full`), `h-9`, `px-4`, `border-input`, foco com `ring-ring/50`.
CNPJ usa `font-mono` para facilitar leitura.

### Cards
`rounded-[12px]`, `border border-border`, `bg-card`. Sem sombra.
Variante `sm` para cards compactos.

### Badges / Tags
Pill-shaped, `text-xs`. Dois usos principais:
- `variant="secondary"` → regime do cliente (Simples Nacional, MEI)
- `variant="outline"` → atributo booleano (Com empregados)

### Select / Dropdown
Trigger: pill-shaped. Popup: `rounded-[12px]`, `border border-border`, `bg-popover`.
Sem sombra no popup.

### Sidebar
Largura fixa `w-52`. Fundo `bg-sidebar`. Links ativos: `bg-foreground text-background rounded-full`. Links inativos: hover `bg-muted`. Sem sombra.

### Filtros de período (Tab pills)
Container: `bg-muted rounded-full p-1`. Botões internos: pill-shaped, ativo com `bg-background shadow-sm`.

---

## 5. Modais — Estilo VisionOS

Os modais substituem páginas dedicadas para ações de edição, confirmação e detalhamento. São a principal diferença visual em relação ao Ollama puro — aqui aplicamos a profundidade espacial do VisionOS.

### Anatomia de um modal

```
┌──────────────────────────────────────────────┐
│  [overlay: fundo desfocado translúcido]       │
│                                               │
│      ┌─────────────────────────────┐          │
│      │ [painel flutuante de vidro] │          │
│      │                             │          │
│      │  Título                 [×] │          │
│      │  ─────────────────────────  │          │
│      │  Conteúdo do modal          │          │
│      │                             │          │
│      │  [Cancelar]  [Salvar]       │          │
│      └─────────────────────────────┘          │
│                                               │
└──────────────────────────────────────────────┘
```

### Especificação do overlay
```css
/* Overlay de fundo */
background: rgba(0, 0, 0, 0.40);           /* escuro translúcido */
backdrop-filter: blur(12px) saturate(180%); /* desfoque VisionOS */
-webkit-backdrop-filter: blur(12px) saturate(180%);
```

### Especificação do painel (vidro fosco)
```css
/* Painel flutuante */
border-radius: 20px;                        /* mais arredondado que cards normais */
border: 1px solid rgba(255,255,255,0.18);   /* borda de vidro no claro */
background: rgba(255,255,255,0.85);         /* vidro claro */
backdrop-filter: blur(24px) saturate(200%);
box-shadow:
  0 32px 80px rgba(0, 0, 0, 0.18),
  0 4px 16px rgba(0, 0, 0, 0.08);

/* Escuro */
background: rgba(30, 30, 30, 0.80);
border-color: rgba(255, 255, 255, 0.10);
```

### Dimensões padrão
| Tamanho | Largura | Uso |
|---------|---------|-----|
| `sm` | `max-w-sm` (384px) | Confirmações simples, alertas |
| `md` | `max-w-md` (448px) | Formulários de edição (padrão) |
| `lg` | `max-w-lg` (512px) | Detalhes de obrigação, listas |

### Animações
```css
/* Entrada */
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}
/* Saída */
@keyframes modal-out {
  from { opacity: 1; transform: scale(1)    translateY(0);   }
  to   { opacity: 0; transform: scale(0.95) translateY(8px); }
}
duration: 200ms; easing: ease-out;
```

### Modais previstos

#### Modal: Editar cliente
- **Disparo**: ícone ✏ na linha da lista `/clientes`
- **Campos**: Nome/Razão Social (input), Regime (select), Tem empregados (select)
- **Aviso**: se regime mudar, exibe inline `"Os vencimentos futuros serão regenerados."`
- **Botões**: `Cancelar` (outline) · `Salvar alterações` (primário)

#### Modal: Concluir obrigação
- **Disparo**: botão "Concluir" no card do painel
- **Campos**: Nome do responsável (input, pré-preenchido com usuário logado), Data/hora (readonly, agora)
- **Botões**: `Cancelar` (outline) · `Confirmar conclusão` (primário)

#### Modal: Detalhes da obrigação
- **Disparo**: clique no nome da obrigação
- **Conteúdo**: sigla + nome completo, data de vencimento, regime, base legal (ex: "Resolução CGSN 140/2018"), histórico de alertas enviados
- **Botões**: `Fechar` (outline) · `Concluir` (primário, se pendente)

#### Modal: Confirmação destrutiva
- **Disparo**: ação irreversível (ex: excluir cliente)
- **Conteúdo**: ícone de aviso, título "Tem certeza?", texto explicativo com consequências
- **Botões**: `Cancelar` (outline) · `Confirmar exclusão` (destructive)

---

## 6. Estados de Tela

### Empty states
Exibidos quando a lista está vazia. Sempre com:
- Ícone ou ilustração minimalista (line art, stroke 1.5, grayscale)
- Texto `text-muted-foreground text-sm` centralizado
- CTA em botão primário quando há ação disponível

| Tela | Mensagem | CTA |
|------|----------|-----|
| Painel sem clientes | "Nenhum cliente cadastrado ainda" | `+ Cadastrar primeiro cliente` |
| Painel com clientes mas sem vencimentos | "Nenhum vencimento no período" | — |
| Lista de clientes vazia | "Nenhum cliente cadastrado ainda" | `+ Novo cliente` |
| Prazos do cliente sem obrigações | "Nenhuma obrigação gerada para este cliente" | — |

### Loading / Skeleton
Antes dos dados chegarem, exibir skeletons com:
- `rounded-[12px]` para blocos de card
- `rounded-full` para pills de badge/botão
- Animação `animate-pulse` com `bg-muted`
- Não usar spinners — skeletons preservam o layout e evitam saltos

```
Skeleton card:
┌─────────────────────────────────┐
│ ████████████      [████████]    │  ← título + badge
│ ──────────────────────────────  │
│ ██████████  ███  ██  [████████] │  ← linha de obrigação
│ ██████████  ███  ██  [████████] │
└─────────────────────────────────┘
```

### Error states
- Erros de formulário: `text-destructive text-sm` abaixo do campo
- Erros de carregamento: card com borda `border-destructive/20`, mensagem + botão "Tentar novamente"
- Toast (Sonner): pill-shaped, `bg-card border border-border`, texto `text-foreground`

---

## 7. Padrões de Interação

### Feedback imediato
- Botões com `disabled` + texto alternativo ao submeter (`"Salvando…"`, `"Entrando…"`)
- Transições de cor em hover/focus: `transition-colors duration-150`
- Sem animações de layout (sem `animate-layout`) — só opacity e scale

### Hierarquia de ações por tela
1. **Ação primária** → botão `default` (preto, pill), 1 por tela/modal
2. **Ação secundária** → botão `outline`, cancela ou navega de volta
3. **Ação terciária** → botão `ghost` ou link com `text-muted-foreground hover:text-foreground`

### Navegação de retorno
Todas as sub-telas e modais têm saída explícita:
- Modal: botão `×` no canto superior direito + clique no overlay
- Sub-tela: link `← Rótulo` no topo esquerdo (`text-muted-foreground hover:text-foreground`)

### Concluir obrigação (fluxo crítico)
O clique em "Concluir" no painel deve ser **imediato e satisfatório**:
1. Optimistic UI: item some do painel instantaneamente (ou recebe estilo concluído)
2. Servidor confirma em background
3. Em caso de erro: toast de erro, item volta ao estado original

---

## 8. Layout do App Autenticado

```
┌──────────────────────────────────────────────────┐
│ Sidebar (w-52, fixed)  │  Main content            │
│                        │  (flex-1, p-8)            │
│  PrazoGestor           │                           │
│  by Tresbits           │  [Conteúdo da rota]       │
│  ───────────────       │                           │
│  ▣ Painel              │                           │
│  ▣ Clientes            │                           │
│  ▣ Configurações       │                           │
│                        │                           │
│  ───────────────       │                           │
│  ☀ Modo escuro         │                           │
│  ↩ Sair                │                           │
└──────────────────────────────────────────────────┘
```

- Background geral: `bg-background`
- Sidebar: `bg-sidebar border-r border-border`
- Conteúdo: `max-w-3xl` nas telas de lista, sem max-width no painel full

---

## 9. Constraints de Implementação

- **Framework**: Next.js 16.x App Router — Server Components por padrão, `'use client'` apenas onde necessário
- **Componentes base**: shadcn/ui com `@base-ui/react` (não Radix UI — sem `asChild`, usar `buttonVariants` em `<Link>`)
- **CSS**: Tailwind v4, `@theme inline`, sem `tailwind.config.js`
- **Modais**: implementar com `@base-ui/react/dialog` (já no pacote) — não instalar dependências novas
- **Animações**: `tw-animate-css` já disponível para `animate-in/out`, `fade-in`, `zoom-in`
- **Ícones**: Lucide React (tree-shakeable, stroke 1.5 por padrão)
- **Toasts**: Sonner (`<Toaster />` já no projeto via shadcn)
- **Dark mode**: `next-themes` com `attribute="class"` — classes `.dark` no `<html>`

---

## 10. Glossário de Termos de Domínio

| Termo | Significado |
|-------|-------------|
| Escritório | Conta do SaaS. Escritório contábil = cliente pagante. |
| Cliente | Empresa atendida pelo escritório (CNPJ, regime, empregados). |
| Regime | Regime tributário: `simples` (Simples Nacional) ou `mei` (MEI). |
| Obrigação | Tarefa fiscal de um cliente. Tem sigla (DAS, DARF…), data e status. |
| Template | Modelo de obrigação (da tabela `obrigacoes_template`). Define regras de geração. |
| Vencimento | Data-limite de entrega/pagamento de uma obrigação. |
| Sigla | Código curto da obrigação: DAS, DARF, GFIP, eSocial, DCTFWeb, FGTS, IRPJ. |
| Regime Simples | Simples Nacional — tributos unificados no DAS mensal. |
| MEI | Microempreendedor Individual — variante simplificada do Simples. |
| Prorrogação | Quando a data cai em feriado/fim de semana, o vencimento avança para o próximo dia útil. |
| Antecipação | Quando a regra fiscal exige recolher antes do feriado (ex: FGTS). |
| Atrasado | Obrigação com `data_vencimento < hoje` e `status = 'pendente'`. |
