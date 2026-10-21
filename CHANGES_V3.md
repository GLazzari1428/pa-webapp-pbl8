# Versao 3: sistema de design (tirar a cara de vibe coding)

O orientador aprovou o estilo Vercel/Geist como base. Escrevi `DESIGN.md` nesta pasta (tokens + principios), ja lintado sem erros (`npx -y @google/design.md lint DESIGN.md`). Esta rodada e so sobre isso: aplicar o `DESIGN.md`, rodar o autodiagnostico de "slop" no tutorial (pior ofensor, segundo o orientador) e no cabecalho/app, e corrigir. Nao toque no fluxo do formulario (Configuracao, Indicadores, Barreiras, Resultado, Decisao) nem no motor de calculo, so no sistema visual e no tutorial.

## Passo 1: ler o DESIGN.md e entender o porque

Leia `DESIGN.md` por completo antes de mudar qualquer CSS ou componente. Ele documenta: paleta acromatica com cor so em estado funcional (Escalar/Pivotar/Descontinuar), tipografia Geist com tres pesos, borda por sombra (shadow-as-border) em vez de borda colorida, e a lista explicita de "Don't" (nada de tarja lateral colorida, nada de grade de card repetida, nada de gradiente ou azul/indigo generico, nada de fonte padrao do sistema).

## Passo 2: autodiagnostico antes de mexer

Antes de editar qualquer arquivo, rode mentalmente a lista de 10 sinais de "AI design slop" abaixo contra `src/components/Onboarding.tsx` e o cabecalho em `src/components/App.tsx`, e escreva um score curto (quantos dos 10 bateram) no `MELHORIAS.md` no final. Os 10 sinais:

1. Gradiente tech generico (azul/violeta brilhante em tudo)
2. Cor de destaque indigo/violeta so por ser a padrao do modelo
3. Grade de cards repetidos (icone + titulo + frase, 3x+ com peso igual)
4. Tarja/borda lateral colorida em card decorando sem organizar de verdade
5. Blur/glassmorphism sem sistema real de profundidade
6. Numero gigante decorativo que nao conta a historia do produto
7. Icone redondo centralizado acima de cada titulo, repetido
8. Tudo centralizado por falta de uma composicao real
9. Fonte padrao (Inter/system-ui) usada por inercia
10. Superficie errada (ex.: tela de configurar/explicar tratada como pagina de vender produto)

Diagnostique primeiro, resolva depois, cada sinal com o remedio certo (sinais 3, 8, 10 pedem reorganizar o layout, nao só recolorir; sinais 1, 2, 9 pedem trocar cor/fonte; sinais 4, 5, 6, 7 pedem remover a decoracao e usar hierarquia real de tamanho/peso/espaco no lugar).

## Passo 3: instalar e aplicar a fonte Geist

Instale o pacote oficial `geist` (`npm install geist`), use `next/font` (`geist/font/sans` e `geist/font/mono`) no `layout.tsx` para aplicar as variaveis de fonte no `<html>`, e troque `--font-sans` em `globals.css` de `ui-sans-serif, system-ui...` para a variavel do Geist. Sem CDN externo, sem Google Fonts, o pacote e self-hosted.

## Passo 4: redesenhar o tutorial seguindo o DESIGN.md

Mantenha a separacao conceitual que o orientador gostou (definicao curta, depois o exemplo claramente distinto), mas troque a forma visual:

- O bloco de exemplo deixa de ser uma caixa com borda colorida na lateral esquerda (isso e o sinal 4, "accent rail", e foi apontado como o maior problema). Em vez disso, use uma citacao tipografica: recuo, leve mudanca de peso ou cor de texto (`colors.mutedForeground`), um rotulo pequeno "Exemplo" em caixa alta ou peso 500, sem caixa nem borda.
- Nao repita o padrao "icone redondo + titulo + paragrafo" para cada conceito em sequencia direta (isso e o sinal 7 combinado com o sinal 3). No maximo um ou dois conceitos por pagina podem ter um icone, os outros usam so hierarquia tipografica (titulo em peso 600, corpo em peso 400).
- Os badges coloridos de Escalar/Pivotar/Descontinuar e das quatro dimensoes na pagina 1 devem sumir se forem so decorativos (o texto ja nomeia os conceitos). Cor so aparece de novo na tela de Resultado de verdade, onde o estado é real.
- Pagina 1 do tutorial e a que mais precisa mudar, segundo o orientador: ela estava com elementos visuais demais e desconexos. Prefira menos elementos, mais hierarquia tipografica.
- Aplique shadow-as-border (`box-shadow: 0 0 0 1px var(--border)`, sem blur) em qualquer container que hoje tenha borda tradicional ou sombra chamativa.

## Passo 5: conferir o cabecalho (App.tsx)

O cabecalho ja é simples, só confirme que usa a mesma tipografia e que o botao "Mostrar Tutorial" e o ThemeToggle seguem os mesmos tokens (sem cor decorativa nova).

## Depois de terminar

1. `npm run build`, `npm test` e `npm run lint` tem que passar sem erro.
2. Rode de novo o autodiagnostico dos 10 sinais na mesma tela e registre o score novo ao lado do antigo no `MELHORIAS.md`, numa secao "Versao 3: sistema de design". Seja honesto, se algum sinal nao foi totalmente resolvido, diga isso em vez de inflar o resultado.
3. Confirme que nenhum em dash foi introduzido (`grep` recursivo pelo caractere "—" em `src`).
4. Commit com mensagem clara descrevendo a mudanca de sistema de design.
5. Resumo final curto do que mudou e, se algo ficou pendente, diga explicitamente.
