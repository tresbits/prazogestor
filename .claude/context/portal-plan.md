# Plano de Implementação — Módulo 2: Portal do Cliente

## Objetivo

Adicionar campo de valor nas obrigações (entrada manual pelo contador) e criar portal de acesso para o empresário visualizar suas obrigações com prazo, status e valor.

---

## Migration SQL

### `client_obligations`
- `value numeric(12,2)` nullable — valor do tributo (entrada manual)
- `value_source text` nullable — `'manual'` | `'auto'` (reservado para cálculo automático fase 3)

### `clients`
- `portal_enabled boolean` default false
- `portal_user_id uuid` nullable → `auth.users`
- `portal_invite_token text` nullable
- `portal_invite_sent_at timestamptz` nullable

---

## RLS — portal user

Empresário autenticado só vê dados do próprio cliente:
- `clients`: SELECT onde `portal_user_id = auth.uid()`
- `client_obligations`: SELECT onde `client_id` pertence ao próprio cliente
- `obligation_templates`: SELECT público (nomes e siglas para exibição)

---

## Campo de valor (office side)

- `ModalConcluir` — campo opcional "Valor (R$)" ao concluir a obrigação
- `/clientes/[id]/prazos` — exibir valor quando preenchido
- Painel — exibir valor nas obrigações dos cards

---

## Fluxo de convite

```
Office clica "Convidar para portal" no cliente
  → server action gera UUID token
  → salva em clients.portal_invite_token + portal_invite_sent_at
  → envia e-mail ao client.email com link /portal/aceitar-convite?token=xxx

Empresário clica no link
  → página verifica token (válido por 7 dias)
  → mostra e-mail (pré-preenchido) + campo senha
  → submit: cria auth.users via service role
  → vincula clients.portal_user_id + portal_enabled = true + limpa token
  → redireciona para /portal
```

E-mail: `emails/portal-invite.tsx` — "Seu escritório te convidou para o portal"

---

## Rotas do portal

```
/portal/login              → login exclusivo do empresário
/portal/aceitar-convite    → aceitar convite + definir senha
/portal                    → lista de obrigações (autenticado)
```

Layout `app/(portal)/layout.tsx` separado do `app/(app)/layout.tsx` — sem sidebar de escritório.

---

## Sequência de implementação

- [ ] **Step 1** — Migration SQL + RLS policies
- [ ] **Step 2** — Campo `value` no `ModalConcluir` + exibição na tela de prazos e painel
- [ ] **Step 3** — Botão "Convidar para portal" no cliente + server action + e-mail `portal-invite.tsx`
- [ ] **Step 4** — Página `/portal/aceitar-convite`
- [ ] **Step 5** — Layout do portal + guard de auth (`app/(portal)/layout.tsx`)
- [ ] **Step 6** — Página `/portal` (lista de obrigações do empresário)
- [ ] **Step 7** — Página `/portal/login`

---

## Fora deste escopo (fase 3)

- Cálculo automático de valores (`value_source = 'auto'`)
- Upload de documentos (DAS, DARF, guias)
- Dashboard de caixa tributário mensal
- Comunicação office↔empresário
