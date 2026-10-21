# Versao 4: unificar o sistema de design em todo o app

O orientador percebeu (e esta certo) que o tutorial e o cabecalho (V3) seguem o `DESIGN.md`, mas o resto do app (wizard, lista de casos, alertas de pendencia) ainda usa o estilo antigo, e os dois ficam visualmente dissonantes. Esta rodada estende o `DESIGN.md` para o app inteiro.

Regra mais importante: NAO mude nenhuma regra de validacao, nenhuma mensagem de erro/pendencia, nenhuma formula do motor de calculo. Mude so a apresentacao visual (cor, borda, peso de fonte, espacamento) desses estados que ja existem.

## Problemas concretos ja identificados (corrija estes primeiro)

1. `src/components/wizard/IssueList.tsx`: a caixa "O que falta nesta etapa" usa Tailwind cru (`border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100`). Troque para os tokens do projeto (ex.: fundo `bg-muted`, texto `text-foreground`, borda via shadow-as-border do `DESIGN.md`, talvez um icone pequeno de alerta do `lucide-react` em vez de cor saturada). O conteudo (titulo, lista de mensagens, `role="status" aria-live="polite"`) nao muda.
2. `src/components/wizard/Wizard.tsx`, o indicador de etapas (`STEPS.map`): a etapa ativa hoje e `border-primary bg-primary text-primary-foreground`, uma inversao total de cor que fica muito mais forte que o tratamento discreto do resto do app. Troque por um destaque mais sutil (borda mais forte + peso 600 no texto, por exemplo), consistente com o que o `DESIGN.md` pede (hierarquia por peso e espaco, nao por caixa decorativa). O rotulo "N pendencia(s)" usa `text-amber-800 dark:text-amber-300`: troque para um tom neutro (`text-muted-foreground` ou similar), porque amber ja tem significado proprio (Pivotar) e nao deveria ser reaproveitado para "pendente".

## Depois disso, faca uma varredura completa

Procure (`grep -rn` em `src/components`) por qualquer classe Tailwind de cor crua fora dos tokens do projeto: `amber-`, `red-`, `green-`, `blue-`, `yellow-`, `violet-`, `indigo-`, `purple-`, `pink-`, `orange-` (exceto onde a cor e literalmente Escalar, Pivotar, Descontinuar/erro, usando os tokens que ja existem em `globals.css`, como `--destructive`, `--chart-scale`, `--chart-pivot`, nao a classe Tailwind generica). Troque cada ocorrencia pelo token equivalente do `DESIGN.md` ou por uma cor neutra, mantendo o significado semantico (erro continua vermelho, Escalar continua verde, Pivotar continua ambar, mas via token, nao via classe Tailwind generica espalhada pelo codigo).

Confira tambem se cards, badges e bordas em `CaseList.tsx`, nos `Step*.tsx` e em `PrintReport.tsx` usam a mesma tecnica de shadow-as-border e a mesma paleta de raio (`rounded.sm`/`rounded.md`) do tutorial, em vez de borda tradicional com `border-2` ou cores de fundo diferentes das do `DESIGN.md`.

## Depois de terminar

1. `npm run build`, `npm test` e `npm run lint` tem que passar sem erro.
2. Rode de novo o autodiagnostico dos 10 sinais de "AI design slop" (mesma lista da Versao 3), agora olhando o app inteiro (Casos, wizard em todas as 5 etapas, alertas de pendencia), nao so o tutorial e o cabecalho. Registre o resultado numa secao nova "Versao 4" do `MELHORIAS.md`, ao lado do que ja existe, e seja honesto se algo nao ficou resolvido.
3. Confirme que nenhum em dash foi introduzido (`grep` recursivo pelo caractere "—" em `src`).
4. Commit com mensagem clara.
5. Resumo final curto do que mudou, dizendo explicitamente se conseguiu testar visualmente (abrir no navegador) ou nao.
