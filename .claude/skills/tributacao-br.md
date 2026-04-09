# Skill: Tributação Brasileira para SaaS

## Visão geral do sistema tributário

O Brasil tem três regimes tributários principais para empresas:

| Regime | Limite de faturamento | Característica |
|---|---|---|
| Simples Nacional | Até R$4,8M/ano | Tributos unificados no DAS |
| Lucro Presumido | Até R$78M/ano | Margem de lucro presumida pela RF |
| Lucro Real | Sem limite (obrigatório acima de R$78M) | Imposto sobre lucro real |

## SaaS no Brasil — classificação tributária

**Decisão do STF (2021)**: Software é serviço. SaaS paga **ISS**, não ICMS.
Enquadramento: item 1.05 da Lista da LC 116/2003 ("Licenciamento ou cessão de direito de uso de programas de computação").

## Simples Nacional para SaaS

### CNAEs e Anexos

| CNAE | Descrição | Anexo padrão | Com Fator R |
|---|---|---|---|
| 6203-1/00 | Licenciamento de software não customizável | V (15,5%) | III (6%) |
| 6202-3/00 | Licenciamento de software customizável | V (15,5%) | III (6%) |
| 6201-5/01 | Desenvolvimento sob encomenda | V (15,5%) | III (6%) |

### Fator R

```
Fator R = Total de pró-labore + folha de pagamento (12 meses) ÷ Receita bruta (12 meses)
```

- Fator R ≥ 28% → Anexo III (começa em 6%)
- Fator R < 28% → Anexo V (começa em 15,5%)

**Na prática**: sócio solo com pró-labore de 28% do MRR fica no Anexo III.
Com MRR de R$10.000: pró-labore mínimo de R$2.800/mês.

### Alíquotas progressivas no Simples (Anexo III)

| Receita bruta acumulada (12 meses) | Alíquota nominal | Dedução |
|---|---|---|
| Até R$180k | 6,00% | — |
| De R$180k a R$360k | 11,20% | R$9.360 |
| De R$360k a R$720k | 13,20% | R$17.640 |
| De R$720k a R$1,8M | 16,00% | R$35.640 |
| De R$1,8M a R$3,6M | 21,00% | R$125.640 |
| De R$3,6M a R$4,8M | 33,00% | R$648.000 |

## ISS municipal

- Alíquota mínima: 2% (definida pela LC 116/2003)
- Alíquota máxima: 5%
- No Simples Nacional: ISS já está incluído no DAS (não recolhido separadamente)

| Cidade | Alíquota para SaaS/software |
|---|---|
| São Paulo/SP | 2% (mínimo legal — vantajoso) |
| Salvador/BA | 5% (máximo — desvantajoso) |
| Florianópolis/SC | 2% |
| Curitiba/PR | 2,5% |

## Obrigações da empresa SaaS no Simples

| Obrigação | Frequência | Observação |
|---|---|---|
| DAS | Mensal | Unifica todos os tributos |
| PGDAS-D | Mensal | Apuração do Simples |
| DEFIS | Anual (31/março) | Informações socioeconômicas |
| NFS-e | Por faturamento | Uma nota por cliente por período |

## NFS-e — Nota Fiscal de Serviço Eletrônica

SaaS é obrigado a emitir NFS-e para cada cliente pagante.
- Emitida pela prefeitura do município sede da empresa
- Código de serviço: geralmente item 1.05 da LC 116/2003
- Sem NFS-e: não pode registrar receita, não pode deduzir despesa pelo cliente

## Reforma Tributária — o que muda para SaaS

**2026 (fase de testes)**:
- NF-e deve incluir campos CBS (0,9%) e IBS (0,1%) — ainda não cobrados
- Split Payment começa a ser implementado

**2033 (transição completa)**:
- ISS e ICMS substituídos por IBS (estadual/municipal) + CBS (federal)
- Alíquota combinada estimada: ~26–28% (com créditos, pode ser menor)
- Impacto real para SaaS com poucos insumos: carga tributária pode aumentar

**Recomendação para o produto**: monitorar as mudanças anuais mas não alterar a engine fiscal antes de 2027.
