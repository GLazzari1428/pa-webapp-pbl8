# Versao 5: escrita acessivel e limiares escondidos por padrao

O orientador aprovou duas mudancas nesta rodada. Nao mude nenhuma regra de validacao, calculo, nome de campo interno ou valor padrao. So a redacao dos textos visiveis ao usuario e a apresentacao (nao a logica) dos quatro campos de limiares.

## Parte A: reescrever o conteudo seguindo um unico padrao

O cartao "Hipotese de valor" em `src/components/Onboarding.tsx` esta bom e e o modelo a seguir: define o conceito em uma ou duas frases simples, sem jargao, e logo em seguida um "Exemplo" concreto. Os outros cartoes do tutorial e os textos de `src/lib/help.ts` nao seguem esse padrao. Regras obrigatorias para reescrever TODOS os textos visiveis ao usuario (tutorial, tooltips em `help.ts`, qualquer outro texto de interface que encontrar com o mesmo problema):

1. Nunca mostrar a letra "S" nem simbolos matematicos (>=, <=, <, >, ÷) para o usuario. Troque por linguagem comum: "a pontuacao geral calculada pelo framework" (ou "o resultado calculado", "a nota geral"), nunca a variavel.
2. Toda frase tem que fazer sentido lida isoladamente, sem depender da frase anterior. Procure substantivos faltando (numeros soltos como "12" sem dizer o que e "12 de que").
3. Toda definicao e seguida, no mesmo cartao ou tooltip, por um exemplo concreto, como ja funciona em "Hipotese de valor". Nao deixe definicao sem exemplo nem exemplo sem definicao.
4. Frases compostas com duas ideias separadas por ponto e virgula devem ser quebradas em duas frases curtas, ou reescritas de forma mais direta.

### Problemas ja identificados (corrija pelo menos estes, depois faca uma revisao geral com as 4 regras acima)

- `Onboarding.tsx`, cartao "Indicador": "De um a tres por dimensao (até 12 no total)" esta sem o substantivo. Devia dizer algo como "De um a tres indicadores por dimensao, até 12 indicadores no total".
- `Onboarding.tsx`, cartao "Tipo de KPI": "Antecedente é um sinal inicial de que o efeito virá; de resultado é o próprio efeito buscado." Quebre em duas frases simples e diga por que isso importa pro usuario (ex.: só indicador de resultado sustenta Escalar).
- `Onboarding.tsx`, cartao "Limiares": o texto e o exemplo usam "S" e notacao matematica (S >= 0,70, etc). Como a Parte B esconde esses campos por padrao, reescreva o cartao inteiro em linguagem de politica de decisao: existe uma linha que separa "parar" de "ajustar" e outra que separa "ajustar" de "escalar"; o framework já vem com valores padrao sensatos (os mesmos usados nos exemplos do artigo) e normalmente nao precisam ser alterados.
- `Onboarding.tsx`, paragrafo de abertura da pagina 1: "A recomendação vem da pontuação S, de 0 a 1" também usa a letra S, reescreva.
- `help.ts`: `lower`, `scale`, `border`, `variation`, `band`, `sensitivity` usam "valor de S" ou "S" cru. Reescreva todos em linguagem comum. `variation` e `border` sao parametros avancados (ver Parte B), a tooltip pode dizer isso explicitamente, algo como "a maioria dos casos nao precisa mudar este valor".
- Revise tambem `weights`, `kpiType`, `coverage` e qualquer outra entrada de `help.ts` contra as 4 regras, mesmo que nao tenham "S".

## Parte B: esconder os quatro limiares avancados por padrao

Em `src/components/wizard/StepConfig.tsx`, os quatro campos de limiares (`lower`, `scale`, `border`, `variation`) ja vem preenchidos com os valores padrao do artigo (`DEFAULT_THRESHOLDS`, ver `src/lib/storage.ts`), entao nao ha pendencia quando o usuario nao toca neles. Hoje eles aparecem sempre visiveis e editaveis, o que faz o usuario pensar que precisa escolher um numero sem saber qual.

Mudanca: agrupe os quatro campos dentro de uma secao recolhivel "Configuracoes avancadas", fechada por padrao (use o componente `Collapsible` do shadcn/ui, instale se nao existir: `npx shadcn@latest add collapsible`). Quando fechada, mostre uma linha curta de texto explicando que o framework esta usando os limiares padrao do artigo e que a maioria dos casos nao precisa mudar isso, com um botao/link para abrir e editar se quiser. Quando aberta, os quatro campos continuam exatamente como sao hoje (mesmos valores, mesma validacao, mesmos tooltips corrigidos na Parte A).

Nao mude os valores padrao (`DEFAULT_THRESHOLDS`), nao mude a validacao em `engine.ts`, so a apresentacao visual.

## Depois de terminar

1. `npm run build`, `npm test` e `npm run lint` tem que passar sem erro.
2. Procure (`grep -rn` em `src`) pela letra "S" sozinha perto de "pontuação" ou "valor de" em textos de interface (tutorial, help.ts, labels) e confirme que nao sobrou nenhuma. E claro que "S" como parte de outras palavras (ex.: "São", "Squad") nao conta.
3. Confirme que nenhum em dash foi introduzido (`grep` recursivo pelo caractere "—" em `src`).
4. Atualize o `MELHORIAS.md` com uma secao "Versao 5" descrevendo as duas mudancas, com exemplos de antes/depois de pelo menos tres textos reescritos, honesto sobre qualquer coisa que nao deu para revisar.
5. Commit com mensagem clara.
6. Resumo final curto, dizendo se testou visualmente ou nao.
