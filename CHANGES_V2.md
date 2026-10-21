# Mudancas pedidas pelo orientador (versao 2)

Projeto ja funcional (build, 21 testes e lint passando, commit inicial feito). A partir de agora, foque SO no que esta listado abaixo. Nao toque no fluxo do formulario em si (Configuracao, Indicadores, Barreiras, Resultado, Decisao) nem no motor de calculo: isso ja esta aprovado e nao deve mudar de comportamento. As unicas mudancas no formulario sao as que decorrem diretamente dos itens 1 e 4 abaixo (tema escuro/claro e virar modal).

## 1. Nunca usar em dash (o caractere "—", U+2014) em nenhum lugar

Procure o caractere em todo o repositorio (codigo, comentarios, strings de UI, `MELHORIAS.md`, `README.md`) e substitua por virgula, ponto, dois pontos ou parenteses, o que ficar mais natural em cada frase. Nao use travessao nenhum tipo (nem "--", nem "-" isolado como pausa). Isso vale tambem para qualquer texto novo que voce escrever nesta rodada.

## 2. Reescrever o conteudo do tutorial: definicao separada do exemplo, mais visual

O tutorial (`src/components/Onboarding.tsx`) hoje mistura definicao e exemplo na mesma frase, por exemplo: "Hipotese de valor. O resultado que o projeto prometeu quando o MVP foi aprovado (...). Caso A: reduzir o tempo medio de atendimento de 12 para 8 minutos (...)". Isso fica confuso e pesado.

Para CADA conceito do tutorial (hipotese de valor, pesos das dimensoes, limiares, indicador, direcao, linha de base/meta/valor observado, unidade, tipo de KPI, peso na dimensao, barreira, e qualquer outro que exista), separe sempre em duas partes visualmente distintas:

- Uma definicao curta e direta: o que o conceito e, numa ou duas frases, sem exemplo misturado.
- Um bloco de exemplo rotulado "Exemplo:", visualmente destacado (outro fundo, outra borda, ou um card separado), com o caso concreto (Caso A ou outro exemplo do artigo).

Alem disso, torne as paginas mais visuais e menos paragrafo corrido:

- Use icones do `lucide-react` por conceito (ex.: um icone diferente para hipotese de valor, pesos, limiares, indicador, barreira).
- Prefira cards curtos lado a lado ou empilhados, em vez de listas longas de `<li>` com frases compridas.
- Pode usar um pequeno indicador visual (badge ou cor) para as quatro dimensoes (tecnica, economica, operacional, governanca) quando aparecerem.
- O objetivo e que cada pagina passe a ideia so de olhar, antes mesmo de ler o texto todo.

Mantenha o conteudo tecnico correto (o que esta descrito em `pbl6/artigo/main.tex` e em `pbl6/04_Tutorial.md`), so mude a forma de apresentar.

## 3. Trocar a navegacao: Casos como pagina principal, tutorial como modal

Hoje o app abre direto no tutorial em tela cheia, paginado, e so depois mostra a lista de casos. Isso deve mudar:

- A pagina de Casos (`CaseList`, hoje mostrada depois do onboarding) passa a ser a tela principal, sempre. O usuario cai nela direto ao abrir o site.
- O tutorial deixa de ser uma rota/tela cheia separada e passa a ser um modal (`Dialog` do shadcn/ui, ou componente equivalente) sobreposto a tela de Casos.
- Na primeira visita (quando `seenBefore` for falso), o modal do tutorial abre automaticamente por cima da tela de Casos. O usuario ainda deve poder fechar e reabrir livremente (nao precisa forcar ir até o fim, mas mantenha o indicador de progresso dentro do modal).
- O botao no cabecalho, hoje chamado "Ver tutorial de novo", passa a se chamar "Mostrar Tutorial" e abre esse mesmo modal, em qualquer pagina do app (Casos ou dentro do wizard), para que o usuario possa tirar qualquer duvida sobre como preencher um campo sem perder o que estava fazendo.
- Dentro do modal, mantenha a navegacao por paginas (Anterior/Proximo) que ja existe, so adapte o layout para caber bem num `Dialog` (scroll interno se precisar, max-height razoavel).

## 4. Alternador de tema claro/escuro no cabecalho

Adicione um botao pequeno no cabecalho (ao lado de "Mostrar Tutorial"), com icone de sol/lua (`lucide-react`), que alterna entre tema claro e escuro. Persista a escolha em `localStorage` e respeite a preferencia do sistema (`prefers-color-scheme`) na primeira visita. O projeto ja usa Tailwind v4 com variaveis de tema (`globals.css` tem `@theme inline` e tokens de cor); use a convencao `class="dark"` na tag `html` (ou `data-theme`, o que for mais simples de integrar com os tokens existentes) e confirme visualmente que todas as telas (Casos, tutorial, wizard) ficam legiveis nos dois temas, nao so a tela inicial.

## Depois de terminar

1. Rode `npm run build`, `npm test` e `npm run lint`. Os tres tem que passar sem erro.
2. Confirme que nao sobrou nenhum caractere "—" no repositorio (`grep` recursivo).
3. Atualize o `MELHORIAS.md` com uma secao nova "Versao 2" descrevendo essas quatro mudancas, sem inflar o que foi feito.
4. Faca um commit git com uma mensagem clara descrevendo essas quatro mudancas (nao precisa commit por item, um commit para esta versao esta bom, mas se preferir separar em commits logicos tambem pode).
5. Escreva um resumo final do que foi feito e do que, se algo, ficou pendente.
