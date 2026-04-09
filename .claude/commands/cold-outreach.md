# Command: Cold Outreach

## Objetivo

Gerar scripts prontos para abordar escritórios de contabilidade e apresentar
o calendário fiscal SaaS da Tresbits.

## Como usar

```
Execute @commands/cold-outreach.md [canal] [contexto]
```

Parâmetros:
- `canal`: whatsapp | email | linkedin | grupo-whatsapp
- `contexto`: primeiro contato | follow-up | pós-indicação

## O que deve ser gerado

Para cada canal solicitado, gerar **texto completo e pronto para copiar**,
adaptado ao tom do canal:

### WhatsApp (primeiro contato direto)

- Tom informal, curto (máximo 4 linhas)
- Abre com pergunta sobre a dor ("você usa planilha para controlar prazos?")
- Não explica o produto na primeira mensagem — primeiro qualifica
- CTA: pedir 10 minutos de conversa

### E-mail (contato frio)

- Assunto curto e específico
- Corpo: 3 parágrafos (dor → solução → CTA)
- Sem anexo na primeira mensagem
- Tom: profissional mas direto

### LinkedIn (mensagem direta)

- Máximo 3 linhas (LinkedIn corta o resto)
- Mencionar algo específico do perfil se possível
- CTA: pedir conexão ou resposta

### Grupos de WhatsApp (mensagem para grupo)

- Tom de compartilhamento, não de venda
- Apresenta como "ferramenta que estou testando"
- Pede feedback, não converte diretamente

### Follow-up (para quem não respondeu)

- Referencia a mensagem anterior brevemente
- Novo ângulo: urgência da Reforma Tributária 2026
- Tom: sem pressão

## Referências obrigatórias

- `@context/produto.md` — planos, benefícios reais, preços
- `@context/roadmap.md` — pitch central, ICP, posicionamento

## Restrições de estilo

- Não usar "solução inovadora", "plataforma disruptiva" ou termos de marketing genérico
- Não listar features na primeira mensagem — foca na dor
- Não mencionar preço no primeiro contato
- Sempre terminar com uma pergunta ou CTA claro
