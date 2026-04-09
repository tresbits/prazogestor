# Contexto — Base Fiscal Brasileira

## Regimes tributários cobertos

| Regime | Prioridade | Faturamento limite |
|---|---|---|
| Simples Nacional | MVP | Até R$4,8M/ano |
| MEI | MVP (subconjunto Simples) | Até R$81k/ano |
| Lucro Presumido | Fase 2 | Até R$78M/ano |
| Lucro Real | Fase 3 | Obrigatório acima de R$78M |

---

## Simples Nacional — Obrigações mensais

| Obrigação | Sigla | Dia de vencimento | Condição |
|---|---|---|---|
| Documento de Arrecadação do Simples | DAS | Dia 20 | Todos |
| Apuração do Simples | PGDAS-D | Dia 20 | Todos |
| Escrituração Social Digital | eSocial | Dia 7 | Quem tem empregados |
| Fundo de Garantia por Tempo de Serviço | FGTS | Dia 7 | Quem tem empregados |
| Escrituração Fiscal Digital de Retenções | EFD-Reinf | Dia 15 | Quem tem retenções sobre serviços |
| Declaração de Débitos e Créditos Tributários | DCTFWeb | Último dia útil | Quem tem empregados |

### ⚠️ Sequência obrigatória (crítico para o produto)

```
eSocial (dia 7) → EFD-Reinf (dia 15) → DCTFWeb (último dia útil)
```

O atraso em qualquer elo **trava toda a cadeia** — a declaração seguinte não pode ser transmitida.
O produto deve alertar sobre essa dependência, não apenas sobre datas individuais.

---

## Simples Nacional — Obrigações anuais

| Obrigação | Sigla | Prazo | Quem entrega |
|---|---|---|---|
| Declaração de Informações Socioeconômicas e Fiscais | DEFIS | 31 de março | ME e EPP do Simples |
| Declaração Anual do MEI | DASN-SIMEI | 31 de maio | MEIs |
| DCTFWeb Anual do 13º salário | DCTFWeb Anual | 20/dezembro | Quem tem empregados |

---

## Lucro Presumido — Obrigações mensais

| Obrigação | Sigla | Prazo | Condição |
|---|---|---|---|
| PIS | PIS | Último dia útil do mês seguinte | Todos |
| COFINS | COFINS | Último dia útil do mês seguinte | Todos |
| Escrituração Fiscal Digital de Contribuições | EFD-Contribuições | Dia 10 do 2º mês seguinte | Todos |
| DCTFWeb Mensal | DCTFWeb | Último dia útil | Quem tem empregados |
| eSocial | eSocial | Dia 7 | Quem tem empregados |
| EFD-Reinf | EFD-Reinf | Dia 15 | Quem tem retenções |

---

## Lucro Presumido — Obrigações trimestrais

| Obrigação | Prazo | Observação |
|---|---|---|
| IRPJ (via DARF) | Último dia útil do mês seguinte ao trimestre | abr, jul, out, jan |
| CSLL (via DARF) | Idem | Pode ser parcelado em 3 cotas |

Vencimentos 2026:
- 1º trimestre → 30/04/2026
- 2º trimestre → 31/07/2026
- 3º trimestre → 30/10/2026
- 4º trimestre → 29/01/2027

---

## Lucro Presumido — Obrigações anuais

| Obrigação | Sigla | Prazo |
|---|---|---|
| Escrituração Contábil Digital | ECD (SPED) | Último dia útil de maio |
| Escrituração Contábil Fiscal | ECF | Último dia útil de julho |
| Declaração do IR Retido na Fonte | DIRF | Último dia útil de fevereiro |
| Relação Anual de Informações Sociais | RAIS | Início de março (data varia) |
| Cadastro Geral de Empregados e Desempregados | CAGED | Dia 7 do mês seguinte (mensal, se houver movimentação) |

---

## Regras de ajuste de datas

Quando um prazo cai em fim de semana ou feriado:

| Tributo | Regra |
|---|---|
| DAS, PGDAS-D | Prorroga para o próximo dia útil |
| FGTS, eSocial | Antecipa para o dia útil anterior |
| EFD-Reinf | Prorroga para o próximo dia útil |
| DCTFWeb | Prorroga para o próximo dia útil |
| IRPJ/CSLL (DARF) | Prorroga para o próximo dia útil |

**Importante**: As regras de antecipação/prorrogação variam por tributo.
Fontes confiáveis para validar: Agenda Tributária Oficial da RFB, Resolução CGSN nº 140/2018.

---

## Feriados nacionais fixos

| Data | Feriado |
|---|---|
| 01/jan | Confraternização Universal |
| 21/abr | Tiradentes |
| 01/mai | Dia do Trabalho |
| 07/set | Independência do Brasil |
| 12/out | Nossa Senhora Aparecida |
| 02/nov | Finados |
| 15/nov | Proclamação da República |
| 25/dez | Natal |

## Feriados móveis (calculados por ano)

- Carnaval: 47 dias antes da Páscoa (segunda e terça)
- Sexta-Feira da Paixão: 2 dias antes da Páscoa
- Páscoa: calculada pelo algoritmo de Gauss
- Corpus Christi: 60 dias após a Páscoa

Fonte de dados recomendada: **FeriadosAPI.com** (calcula automaticamente, plano free inclui nacionais).

---

## Reforma Tributária 2026 — Impacto no produto

### O que muda em 2026

- NF-e, NFC-e, CT-e e NFS-e devem conter campos para CBS (0,9%) e IBS (0,1%)
- Split Payment começa: imposto retido na fonte no momento do pagamento da NF
- Transição gradual até 2033: ISS e ICMS não desaparecem imediatamente

### O que NÃO muda em 2026

- A agenda tributária não sofre alterações práticas para Simples e Lucro Presumido
- CBS e IBS ainda não são cobrados em 2026
- Prazos do DAS, PGDAS-D, eSocial, EFD-Reinf, DCTFWeb permanecem iguais

### Oportunidade de marketing

Reforma Tributária cria urgência: "Já preparado para 2026 — monitore todos os novos prazos automaticamente."

---

## Multas por atraso (referência)

| Obrigação | Multa por atraso |
|---|---|
| DAS | 0,33%/dia (máx 20%) + juros SELIC |
| PGDAS-D | R$100 por mês de omissão |
| eSocial | R$402,53 a R$805,06 por empregado/mês |
| EFD-Reinf | R$500 por mês (pessoa jurídica) |
| DCTFWeb | R$500 por mês + 75% do imposto não declarado |
| ECD | R$1.500 por mês de atraso |
| ECF | R$1.000 por mês de atraso |
| DIRF | R$200 por mês de atraso |

---

## ISS por município — SaaS/software

| Município | Alíquota para SaaS (CNAE 6203) | Regime |
|---|---|---|
| São Paulo/SP | **2%** (alíquota mínima para tecnologia) | No Simples, já no DAS |
| Salvador/BA | **5%** (alíquota padrão, sem redução específica) | No Simples, já no DAS |

Decisão da empresa: manter sede em SP por vantagem tributária do ISS.

---

## Fontes oficiais para manutenção

- Agenda Tributária RFB: `gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/agenda-tributaria`
- Portal e-CAC: `cav.receita.fazenda.gov.br`
- Simples Nacional: `www8.receita.fazenda.gov.br/SimplesNacional`
- FENACON (calendários mensais): `fenacon.org.br`
- CFC: `cfc.org.br`
