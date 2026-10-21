---
version: alpha
name: Framework Pos-MVP
description: Sistema acromatico e funcional, inspirado no Vercel/Geist, para uma ferramenta densa de apoio a decisao (nao uma pagina de marketing).
colors:
  primary: "oklch(0.205 0 0)"
  secondary: "oklch(0.556 0 0)"
  tertiary: "oklch(0.708 0 0)"
  neutral: "oklch(1 0 0)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  surface: "oklch(0.985 0 0)"
  border: "oklch(0.922 0 0)"
  muted: "oklch(0.97 0 0)"
  mutedForeground: "oklch(0.556 0 0)"
  focus: "oklch(0.546 0.245 262.881)"
  escalar: "#047857"
  pivotar: "#b45309"
  descontinuar: "oklch(0.577 0.245 27.325)"
typography:
  h1:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Geist
    fontSize: 1.375rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  ui-label:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.3
  mono-label:
    fontFamily: Geist Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.875rem
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 10px
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: 10px
  button-secondary-hover:
    backgroundColor: "{colors.muted}"
  badge-status:
    rounded: "{rounded.pill}"
    padding: 4px
    typography: "{typography.caption}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 16px
  focus-ring:
    backgroundColor: "{colors.focus}"
  caption-text:
    textColor: "{colors.mutedForeground}"
    typography: "{typography.caption}"
  badge-escalar:
    backgroundColor: "{colors.escalar}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: 4px
  badge-pivotar:
    backgroundColor: "{colors.pivotar}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: 4px
  badge-descontinuar:
    backgroundColor: "{colors.descontinuar}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: 4px
---

## Overview

Esta aplicacao e uma ferramenta de apoio a decisao (Escalar, Pivotar ou Descontinuar uma iniciativa de IA), usada por um gestor preenchendo um formulario em etapas, nao uma pagina de marketing. A superficie predominante e Configure (formulario, tutorial) com uma tela de Resultado que e Monitor (ler um estado calculado). Nenhuma tela desta aplicacao e Decide/Learn no sentido de "vender algo": o tutorial explica, nao convence, e por isso nao deve usar hero, selos decorativos ou grade de cards de marketing.

O sistema e deliberadamente acromatico (preto, branco e cinzas em oklch, ja usado no projeto), com cor reservada só para estado funcional: verde para Escalar, ambar para Pivotar, vermelho para Descontinuar ou erro. Nenhuma outra cor decorativa deve ser introduzida. Bordas sao feitas com sombra (`shadow-as-border`), nunca com uma tarja ou risco colorido do lado do elemento: isso e decoracao fingindo ser organizacao e e um dos sinais mais reconheciveis de interface gerada por IA sem direcao.

## Colors

- **Primary (texto e botao principal):** `oklch(0.205 0 0)`, quase preto, nunca preto puro.
- **Secondary / Tertiary (texto secundario e bordas de foco):** tons de cinza medio, usados so em texto de apoio e estados de foco.
- **Background / Surface:** branco puro para o fundo da pagina, um cinza quase imperceptivel (`oklch(0.985 0 0)`) para cards, para criar profundidade sem sombra pesada.
- **Escalar / Pivotar / Descontinuar:** as unicas tres cores com significado no sistema. Usar apenas em badges de status, no grafico de resultado e no texto que explica a recomendacao. Nunca usar essas cores em elementos decorativos (icone, fundo de card, tarja lateral) sem que o conteudo seja de fato sobre aquele estado.
- Os valores de `.dark` ja existentes em `globals.css` seguem a mesma logica invertida; nao adicionar uma paleta nova, so usar os tokens que ja existem la.

## Typography

Fonte unica: Geist (texto) e Geist Mono (rotulos tecnicos, se necessario), instalada via pacote npm oficial `geist` e aplicada com `next/font`, sem CDN externo. Tres pesos apenas: 400 para leitura, 500 para rotulos e elementos interativos, 600 para titulos. Nunca usar 700 (bold) no corpo do texto. `letterSpacing` levemente negativo nos titulos (h1/h2/h3), nulo no corpo: isso e a assinatura do sistema Geist e substitui qualquer necessidade de aumentar o tamanho da fonte para criar hierarquia.

## Layout

Espacamento em multiplos de 8px (`spacing.sm` a `spacing.2xl`). Evitar grades de 3 colunas com cards de peso identico (isso e o sinal mais comum de "gerado por IA"): cada tela deve ter no maximo um elemento de destaque por vez, os demais em lista ou texto corrido. No tutorial, cada conceito pode ter um titulo e um paragrafo; quando houver exemplo, ele e uma citacao tipografica (recuo + mudanca de peso/cor do texto), nao uma caixa com icone e borda colorida.

## Elevation & Depth

Nao usar `box-shadow` para elevar cards de forma chamativa. Usar a tecnica shadow-as-border do Vercel: `box-shadow: 0 0 0 1px var(--border)` no lugar de uma borda CSS tradicional, e no maximo mais uma camada suave (`0 2px 2px rgba(0,0,0,0.04)`) quando o card precisar parecer clicavel. Sem blur, sem glassmorphism, sem glow.

## Shapes

Raio de borda pequeno e consistente (`rounded.sm` a `rounded.md`, 6px a 10px) na maioria dos elementos. `rounded.pill` (9999px) e reservado para badges de status (Escalar/Pivotar/Descontinuar) e nada mais, nunca em botao de acao primaria.

## Components

`button-primary` e a unica acao de alta enfase por tela. `badge-status` usa `rounded.pill` e as cores funcionais acima. `card` usa a tecnica shadow-as-border da secao anterior, nunca uma borda lateral colorida.

## Do's and Don'ts

### Do

- Fundo branco (ou escuro, no tema dark), texto quase preto (ou quase branco), cor so em badge de status.
- Hierarquia por tamanho, peso (400/500/600) e espaco, nao por caixas decorativas.
- Um unico elemento de destaque por tela.
- Shadow-as-border em vez de borda ou tarja colorida.

### Don't

- Nao usar tarja ou borda lateral colorida em card ou callout ("accent rail").
- Nao repetir o padrao icone-redondo + titulo + frase em serie, para mais de um conceito seguido.
- Nao colocar badges coloridos lado a lado so para decorar uma explicacao (ex.: mostrar as quatro dimensoes como chips coloridos quando o texto já as nomeia).
- Nao usar gradiente, nao usar azul/indigo generico como cor de interface (so o "Focus" cinza-azulado para anel de foco de acessibilidade).
- Nao usar a fonte padrao do sistema (`system-ui`) como escolha final: a fonte e Geist, escolhida, nao o padrao do navegador.
