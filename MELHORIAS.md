# MELHORIAS: PBL8 (DSR Etapa 5)

Este documento registra o que a aplicação web mudou em relação à planilha usada até o PBL7 (`pbl6/Framework_Modelo_Limpo.xlsx`, `pbl6/Framework_Caso_A.xlsx` e os dois casos de `pbl7/filled-files/`). Ele cobre as seis correções de lógica e os quatro elementos de UX aprovados, e indica para cada item o arquivo onde ele foi resolvido. As regras de cálculo validadas no artigo (normalização, agregação, evidência ausente, barreiras, faixas, fronteira e 81 combinações) foram mantidas. Os testes em `tests/engine.test.ts` confirmam que os três casos da Tabela 2 continuam dando os mesmos resultados.

## Resultado da reprodução (Tabela 2 do artigo)

| Caso | S no artigo | S calculado | Faixa | Recomendação | Sensibilidade (mín.–máx.) |
|---|---|---|---|---|---|
| Caso A | 0,656 | 0,6560 | Pivotar | Pivotar | 0,5957–0,7139, instável (algumas combinações caem na faixa Escalar) |
| Conectahit | 0,615 | 0,6146 | Pivotar | Pivotar | 0,5957–0,6335, estável |
| Squad de Negociação | 0,785 | 0,7847 | Escalar | Pivotar | 0,7761–0,7937, estável |

Os dados foram transcritos das planilhas para `src/lib/data/examples.ts`, com uma única mudança de representação: percentuais passam a ser guardados em pontos percentuais (88 em vez de 0,88). Como a normalização é invariante à escala, as notas não mudam. Para seguir a M2, duas unidades também foram trocadas: no Conectahit, o tempo de liberação (que estava como "unidade") passou a "dias"; no Squad, o tempo até o primeiro contato passou de minutos (2880 → 240, observado 300) para horas (48 → 4, observado 5). As notas desses indicadores ficam iguais.

---

## Parte A: Correções de lógica

### 1. A hipótese de valor trava a recomendação Escalar

- **Problema na planilha.** A hipótese de valor era só um texto (`1 Configuração!B6`). Nenhuma fórmula a consultava, então S ≥ 0,70 levava a Escalar mesmo que a promessa do MVP não tivesse sido cumprida.
- **Correção.** A hipótese passou a ter três partes: o texto, um vínculo (por id) com o indicador que a mede e uma meta mensurável (`ValueHypothesis` em `src/lib/engine/types.ts`). `checkHypothesis()` (`src/lib/engine/engine.ts`) compara o valor observado com a meta, respeitando a direção do indicador, e classifica o resultado em `atingida`, `nao_atingida`, `nao_verificavel` (sem evidência válida) ou `nao_vinculada`. Em `decide()`, qualquer estado diferente de `atingida` vira uma restrição do tipo *teto*: se a faixa for Escalar, a saída é limitada a Pivotar, e a frase de explicação cita o motivo.
- **Efeito nos casos.** No Squad de Negociação, a recuperação observada foi de 12% contra uma meta de 15%. Com isso, mesmo que a barreira de credenciais estivesse atendida, a recomendação continuaria Pivotar. Essa é a leitura que o gestor fez no questionário do PBL7.
- **Interface.** `src/components/wizard/StepConfig.tsx` (bloco "Hipótese de valor", com a situação atual exibida em tempo real) e `StepResult.tsx` (cartão "Hipótese de valor e tipo de KPI").
- **Testes.** `Correção 1` em `tests/engine.test.ts`.

### 2. Barreira "Atendida" exige evidência

- **Problema na planilha.** Na `3 Barreiras`, o estado (coluna C) e a evidência (coluna D) eram independentes, e a fórmula de recomendação (`6 Resultado!B14`) só contava estados. Uma barreira podia ser "Atendida" com a evidência em branco.
- **Correção.** `validateBarriers()` gera um erro no campo de evidência quando o estado é Atendida e o texto está vazio (só espaços também conta como vazio). No motor, `effectiveBarrierStatus()` trata essa barreira como **Não avaliada**, e `barrierConstraints()` aplica o veto correspondente (Descontinuar), com a mensagem "marcada como Atendida sem evidência, tratada como Não avaliada". Isso segue o artigo: "sem verificação, é registrada como não avaliada". Também passaram a ser obrigatórios o plano, quando o estado é Em tratamento, e a aprovação desse plano. Sem aprovação, a recomendação fica pendente com a mensagem "Aguardando plano aprovado", como já fazia a planilha.
- **Interface.** `src/components/wizard/StepBarriers.tsx`: o campo Evidência fica marcado como obrigatório quando o estado é Atendida, e o erro é anunciado.
- **Testes.** `Correção 2` em `tests/engine.test.ts`.

### 3. O tipo de KPI (antecedente / resultado) entra na lógica

- **Problema na planilha.** A coluna "Tipo de KPI" (`2 Indicadores!D`) não era usada por nenhuma fórmula.
- **O que o artigo diz.** Antecedentes "mostram sinais iniciais" e indicadores de resultado medem o efeito. O artigo não define uma fórmula para isso. A regra abaixo é, portanto, **uma decisão de projeto desta etapa**, e não algo que o artigo especificava.
- **Correção adotada.**
  1. **S não muda.** A pontuação continua usando todos os indicadores, como no artigo. Isso é o que permite reproduzir 0,656, 0,615 e 0,785. Mudar a forma como os antecedentes entram em S alteraria a Tabela 2.
  2. `computeDimensions()` calcula, para cada dimensão, a nota só dos indicadores de resultado e a nota só dos antecedentes. `outcomeOnlyScore()` agrega as notas de resultado, renormalizando os pesos dimensionais entre as dimensões que têm algum indicador de resultado.
  3. Em `decide()`, Escalar só é permitido se houver pelo menos um indicador de resultado com evidência **e** se a pontuação só de resultados também alcançar o limiar de escala. Se uma dessas condições falhar, a saída fica limitada a Pivotar, com a explicação de que os antecedentes indicam tendência, mas não sustentam Escalar sozinhos.
  4. Quando, numa dimensão, a nota dos antecedentes supera a dos resultados em 0,20 ou mais, a tela mostra o aviso "sinais antecedentes à frente do resultado" (`leadingAhead` em `evaluateCase()`). O aviso é só informativo e não muda a recomendação.
- **Efeito nos casos.** Nenhum dos três casos muda de recomendação por causa desta regra. No Squad, a pontuação só de resultados é 0,731, acima de 0,70.
- **Interface.** O seletor de tipo de KPI tem rótulos explicativos e tooltip (`StepIndicators.tsx`). `StepResult.tsx` mostra a pontuação só de resultados, e a memória de cálculo traz as colunas "Só resultado" e "Só antecedente".
- **Testes.** `Correção 3` em `tests/engine.test.ts`.

### 4. Decisão final congelada e versionada

- **Problema na planilha.** As células da folha `7 Decisão` podiam ser editadas a qualquer momento, sem deixar rastro. O versionamento dependia de alguém lembrar de "salvar uma versão numerada do arquivo".
- **Correção.** `src/lib/engine/decisions.ts`:
  - O histórico `FrameworkCase.decisions` só recebe acréscimos (*append-only*). `saveDecision()` cria um `DecisionRecord` com `version`, timestamp `savedAt` (ISO), um *snapshot* da recomendação calculada naquele momento (S, faixa, recomendação) e aplica `Object.freeze`. Ela nunca altera registros anteriores.
  - `isDecisionFrozen()` indica que a decisão está congelada quando existe registro salvo e nenhum rascunho aberto. Nesse estado, a tela mostra a decisão somente para leitura.
  - `reopenDecision()` abre um **rascunho** pré-preenchido. Salvar esse rascunho acrescenta a versão N+1 e exige o campo "Motivo da reabertura". A versão anterior continua intacta no histórico.
  - `validateDraft()` define os campos obrigatórios (ver M5).
- **Interface.** `src/components/wizard/StepDecision.tsx`: componente `FrozenDecision` (somente leitura, botão "Reabrir decisão"), formulário de rascunho e "Histórico de versões". O relatório de impressão (`PrintReport.tsx`) informa a versão e quantas versões anteriores existem.
- **Limite honesto.** O congelamento vale para a interface. Quem edita o `localStorage` ou o JSON exportado à mão consegue alterar os dados, pois não há assinatura nem servidor. A planilha tinha o mesmo limite (o artigo diz que "a proteção das células … não garante integridade contra alterações intencionais").
- **Testes.** `Correção 4` em `tests/engine.test.ts`.

### 5. Identificadores estáveis em vez de posição de linha

- **Problema na planilha.** As folhas se ligavam pela posição das linhas. Por exemplo, `4 Cálculo!C5` lê `2 Indicadores!K5`, `I5` e o registro de rastreabilidade em `B20:E20`, e a linha 6 lê a 21. Reordenar uma das tabelas misturava os indicadores com as evidências de outros.
- **Correção.** Cada indicador e cada barreira tem um `id` estável: `crypto.randomUUID()` em `newIndicator()`/`newBarrier()` (`src/lib/storage.ts`) ou um slug fixo nos exemplos. A evidência é guardada no próprio objeto do indicador, a hipótese aponta para `indicatorId` e os resultados (`IndicatorResult`) são procurados por `id`. Nenhuma função do motor usa índice de array para relacionar entidades.
- **Interface.** `StepIndicators.tsx` tem botões para mover indicadores para cima e para baixo. Reordenar não altera nenhum resultado. Remover o indicador vinculado à hipótese limpa o vínculo, em vez de apontá-lo para outro indicador.
- **Testes.** `Correção 5` em `tests/engine.test.ts`: os indicadores e as barreiras do Squad são invertidos e o teste confirma que S, a recomendação, a hipótese e a nota de cada id continuam iguais.

### 6. Um único motor de cálculo

- **Problema na planilha.** Comparando as fórmulas célula por célula (com `openpyxl`), as versões divergem. Em `Framework_Caso_A.xlsx`, a consistência da configuração (`1 Configuração!B27`) não exige o nome do caso e devolve "Revisar entradas". Em `Framework_Conectahit_Simulado.xlsx` e `Framework_Squad_Negociacao_preenchido.xlsx`, ela exige `B4` preenchido e devolve "Configuração pendente". Além disso, nessas duas versões todas as células de `4 Cálculo` são condicionadas a `'1 Configuração'!$B$27="Válida"`, o que não acontece no Caso A. A lógica era a mesma, mas implementada de formas diferentes em cópias diferentes.
- **Correção.** Existe um único módulo de cálculo, `src/lib/engine/engine.ts`. É TypeScript puro, sem React e sem acesso ao DOM ou ao armazenamento. `evaluateCase()` é o ponto de entrada usado pela lista de casos (`CaseList.tsx`), pelo wizard (`Wizard.tsx`) e pelos testes. A regra de validação da configuração está implementada uma única vez (`validateConfig()`, que exige o nome do caso) e vale para qualquer caso. A análise de sensibilidade (`sensitivity()`) reaproveita a mesma função `decide()` da recomendação principal, então "muda a saída?" usa exatamente as mesmas regras.
- **Testes.** Todos os testes de `tests/engine.test.ts` exercitam esse módulo, incluindo os três casos da Tabela 2.

---

## Parte B: Os quatro elementos de UX aprovados

### UX 1. Tooltips "i" com explicação e exemplo

- **Componente.** `InfoTip` em `src/components/form.tsx`, que usa o ícone `Info` do `lucide-react` e o `Tooltip` do shadcn/ui (`src/components/ui/tooltip.tsx`, baseado em Base UI). O gatilho é um `<button>` com `aria-label="Ajuda: <campo>"`, então o tooltip abre com o foco do teclado e é lido por leitores de tela.
- **Textos.** Ficam centralizados em `src/lib/help.ts`. Cada um tem uma explicação curta e um exemplo concreto, tirado sempre que possível do Caso A. Ligação com a Tabela 5 do artigo:
  - **M1** (letras de fórmula). Os campos agora se chamam "Linha de base", "Meta", "Valor observado" e "Peso na dimensão" (`StepIndicators.tsx`). Não sobrou nenhum "Base b" ou "Peso w" na interface.
  - **M2** (unidades e percentuais). A lista de unidades inclui %, R$, minutos, horas, dias, pontos, contagem e "Outra" com descrição (`UNIT_OPTIONS` em `src/lib/engine/units.ts`). Percentuais aceitam "15" e "15%" com o mesmo significado (`parseNumberInput()`), e o exemplo da unidade aparece abaixo do campo. Se a pessoa digita "0,15" num campo percentual, aparece o aviso "Entendido como 0,15%. Se quis dizer 15%, digite 15".
  - **M3** (direção e tipo de KPI). Os rótulos são "Melhor quando maior/menor" e "Resultado (efeito desejado)/Antecedente (sinal de tendência)", cada um com tooltip.
  - **M4** (faixa × recomendação). Ver UX 4.
  - **M5** (pendências genéricas). Ver UX 2.
  - **M6** (perda corrigível). A pergunta só aparece na etapa Resultado quando S fica abaixo do limiar inferior, com uma explicação (`StepResult.tsx`).
  - **M7** (rótulo fixo "simulado"). Foi criado o campo "Tipo de dados" (reais / de referência / simulados) na Configuração. O aviso no Resultado e no PDF depende desse campo, e cada etapa tem título e subtítulo próprios (`STEPS` em `Wizard.tsx`).
  - **M8** (folhas de cálculo e sensibilidade sem uso). O resumo da sensibilidade foi levado para a tela de Resultado, e as tabelas detalhadas ficam num bloco recolhível chamado "Memória de cálculo (para auditoria)".

### UX 2. Fluxo em etapas (wizard) com barra de progresso

- **Componente.** `src/components/wizard/Wizard.tsx`, com cinco etapas: Configuração → Indicadores → Barreiras → Resultado → Decisão (`StepConfig`, `StepIndicators`, `StepBarriers`, `StepResult`, `StepDecision`). Mostra um bloco por vez, a barra `Progress` do shadcn/ui e a navegação por etapas (`<nav>` com `aria-current="step"`). Ao mudar de etapa, o foco vai para o título.
- **Pendências (M5).** Cada etapa mostra quantas pendências tem e lista exatamente o que falta, por exemplo "Custo por atendimento: informe a meta." (`IssueList.tsx`). Os erros ficam ligados ao campo por `aria-describedby` e são anunciados por `role="alert"`/`aria-live`. Os campos obrigatórios têm `*` e o texto "(obrigatório)" para leitores de tela.
- **Navegação livre.** É possível avançar mesmo com pendências, e o Resultado mostra "Recomendação não emitida: …" enquanto as entradas forem inválidas. Isso reproduz o comportamento da planilha ("Revisar entradas", "Aguardando plano aprovado", "Aguardando julgamento"), mas com mensagens que indicam o campo.

### UX 3. Onboarding obrigatório na primeira visita

- **Componente.** `src/components/Onboarding.tsx`, com quatro páginas adaptadas de `pbl6/04_Tutorial.md`: propósito do framework; Fase 1 (hipótese, pesos e limiares); indicadores e evidências; barreiras e como funciona o preenchimento.
- **Regra.** Na primeira visita não aparece o botão "Pular". É preciso chegar à última página e clicar em "Entendi, começar", o que grava a flag `pbl8.framework.onboardingSeen.v1` no `localStorage` (`markOnboardingSeen()` em `src/lib/storage.ts`). Nas visitas seguintes o app abre direto na lista de casos. O link **"Ver tutorial de novo"** fica sempre visível no cabeçalho (`App.tsx`) e, a partir da segunda visita, o tutorial mostra "Pular tutorial".

### UX 4. Tela de resultado com gráfico (recharts, padrão "Analytics Chart")

- **Componente.** `src/components/wizard/ResultChart.tsx`, que reimplementa com recharts e Tailwind o visual do "Analytics Chart" do cult-ui (o pacote cult-ui não foi instalado). O cartão tem no topo duas métricas clicáveis, em formato de abas acessíveis (`role="tablist"`, setas do teclado):
  - **Pontuação S**: gráfico de barras com a nota S_j de cada dimensão e linhas de referência nos limiares de Pivotar e Escalar. Uma dimensão sem cobertura aparece em cinza.
  - **Intervalo na sensibilidade**: gráfico de área com as 81 pontuações S ordenadas, faixas de fundo (verde = Escalar, âmbar = Pivotar, vermelho = Descontinuar) e uma linha marcando o S atual.
  - Há uma tabela equivalente só para leitores de tela (`sr-only`), e as figuras têm legenda em texto.
- **Explicação do rebaixamento (M4).** `explain()` em `engine.ts` gera frases como "Faixa Escalar (S = 0,785) limitada a Pivotar por: barreira "Segurança de credenciais e integrações" (em tratamento); meta da hipótese de valor não atingida.". A tela mostra lado a lado "Faixa por pontuação" e "Recomendação final" e lista todas as restrições, indicando quais foram aplicadas.

---

## Outros requisitos atendidos

- **Persistência e exportação.** Vários casos ficam salvos no `localStorage` (`src/lib/storage.ts`, `CaseList.tsx`). É possível exportar e importar o caso em JSON, exportar caso + resultado em JSON e gerar o PDF pela impressão do navegador. O relatório de impressão (`PrintReport.tsx`) só aparece em `@media print`.
- **Acessibilidade.** Rótulos associados (`htmlFor`/`id` via `useId`), link "Pular para o conteúdo", foco visível em todos os controles e `<select>` nativos (acessíveis por teclado). As cores de texto sobre fundo claro usam tons 800/900 do Tailwind para os estados e o cinza `muted-foreground` do shadcn (cerca de 4,7:1), dentro de WCAG AA para texto normal. Não houve auditoria formal com leitor de tela nem com ferramenta automática (axe/Lighthouse).
- **Limite de 12 indicadores.** `MAX_INDICATORS` em `types.ts`. O botão de adicionar fica desativado no limite, e o motor valida.

## O que não foi feito ou tem limites

- A regra do tipo de KPI (correção 3) é uma interpretação desta etapa. Precisa ser validada com o orientador e registrada no artigo, porque o artigo original não a formaliza.
- Não houve teste de usabilidade com usuários depois das mudanças. O questionário do PBL7 ainda precisa ser reaplicado.
- O PDF depende do "Salvar como PDF" do navegador. Não há geração de PDF por biblioteca.
- Não há deploy real na Vercel (sem credenciais). Foi verificado apenas que o `npm run build` passa.

---

## Versão 2

Mudanças pedidas pelo orientador depois da primeira entrega. O fluxo do formulário e o motor de cálculo não mudaram de comportamento; os 21 testes continuam passando.

1. **Sem em dash.** O caractere foi removido de código, comentários, textos da interface e documentos (`README.md`, `MELHORIAS.md`, `BRIEF.md`, `AGENTS.md`), trocado por vírgula, ponto, dois pontos ou parênteses. Nas células sem valor (tabelas, relatório de impressão, `fmt()` em `engine.ts` e `units.ts`) o marcador passou a ser "n/d". Observação: o bloco de `AGENTS.md` é regenerado pelo `next dev` com o texto original.
2. **Tutorial reescrito** (`src/components/Onboarding.tsx`). Cada conceito virou um cartão com ícone do `lucide-react`, uma definição curta e, separado, um bloco destacado "Exemplo:" com o Caso A. As quatro dimensões e as três recomendações aparecem como selos coloridos, e as cinco etapas do formulário como cartões numerados. O conteúdo técnico segue `pbl6/04_Tutorial.md`.
3. **Casos como tela principal, tutorial em modal.** O app abre sempre na lista de casos (`App.tsx`). O tutorial é um `Dialog` (`src/components/ui/dialog.tsx`, sobre Base UI) com rolagem interna, indicador de progresso e botões Anterior/Próximo. Na primeira visita ele abre sozinho; pode ser fechado a qualquer momento (fechar marca como visto). O botão "Mostrar Tutorial" no cabeçalho o reabre em qualquer tela, inclusive dentro do wizard, sem perder o caso aberto.
4. **Tema claro/escuro.** Botão sol/lua no cabeçalho (`src/components/ThemeToggle.tsx`) alterna a classe `dark` em `<html>`. A escolha fica em `localStorage`; sem escolha salva, vale `prefers-color-scheme`. Um script em `layout.tsx` aplica o tema antes da primeira pintura. As cores fixas de alertas, selos e gráfico ganharam variantes escuras (o gráfico usa os tokens do tema). Casos, tutorial e wizard (incluindo Resultado) foram conferidos em captura de tela nos dois temas; o relatório de impressão continua em preto e branco.

---

## Versão 3: sistema de design

Aplicação do `DESIGN.md` (estilo Vercel/Geist) ao tutorial (`Onboarding.tsx`), ao cabeçalho (`App.tsx`) e aos componentes base. Fluxo do formulário e motor de cálculo não foram tocados; os 21 testes continuam passando.

### Autodiagnóstico dos 10 sinais de "AI design slop" (tutorial + cabeçalho)

| # | Sinal | Antes (V2) | Depois (V3) |
|---|-------|-----------|-------------|
| 1 | Gradiente tech genérico | Não | Não |
| 2 | Destaque índigo/violeta/azul por padrão | Sim (bloco "Exemplo" azul-céu, selo violeta, link do cabeçalho) | Não |
| 3 | Grade de cards repetidos | Sim (8 cartões em 2 colunas, 3 cartões de saída, 5 cartões de etapa) | Não |
| 4 | Tarja lateral colorida | Sim (`border-l-4` azul no "Exemplo") | Não |
| 5 | Blur/glassmorphism | Não | Não |
| 6 | Número gigante decorativo | Não | Não |
| 7 | Ícone repetido acima/ao lado de cada título | Sim (ícone em quadrado em todo conceito, círculos numerados) | Não |
| 8 | Tudo centralizado | Parcial (cartões de saída centralizados) | Não |
| 9 | Fonte padrão do sistema | Sim (`system-ui`) | Não (Geist via `next/font`) |
| 10 | Superfície errada (tela de explicar com cara de marketing) | Parcial (selos e cartões coloridos na página 1) | Não |

**Score: antes 7 de 10 (5 claros + 2 parciais); depois 0 de 10 no tutorial e no cabeçalho.**

Ressalvas honestas: (a) o score novo é autoavaliação, sem revisão do orientador nem teste com usuário; (b) o diagnóstico cobriu o tutorial e o cabeçalho, as telas do wizard só herdaram fonte, cartão e diálogo atualizados, sem revisão sinal a sinal (o Resultado continua com cor funcional, como pede o `DESIGN.md`); (c) o diálogo do tutorial mantém o fundo escurecido (`bg-black/50`) e uma camada suave de sombra para se separar da página, o que considero profundidade funcional, não decoração.

### O que mudou

1. **Fonte Geist** (pacote `geist`, self-hosted): `GeistSans`/`GeistMono` aplicados em `<html>` no `layout.tsx`; `--font-sans` e `--font-mono` em `globals.css` apontam para as variáveis do Geist. Títulos com `letter-spacing` levemente negativo.
2. **Shadow-as-border**: utilitários `shadow-border` (`0 0 0 1px var(--border)`) e `shadow-border-raised` (mais `0 2px 2px rgba(0,0,0,0.04)`) em `globals.css`. Usados no `Card` (no lugar do `ring`), no `Dialog` (no lugar de `border` + `shadow-lg`), no cabeçalho, no `ThemeToggle` e nos separadores do tutorial.
3. **Tutorial**: sem ícones, sem selos coloridos de dimensões e de Escalar/Pivotar/Descontinuar, sem grades de cartões. Cada conceito é título (peso 600) + parágrafo (400). O exemplo é uma citação tipográfica: recuo, texto em `muted-foreground` e rótulo "EXEMPLO" pequeno em peso 500, sem caixa nem borda. A página 1 virou três parágrafos curtos, o exemplo e a ressalva. As cinco etapas viraram lista numerada simples.
4. **Cabeçalho**: "Mostrar Tutorial" deixou de ser link sublinhado e passou a botão discreto com os mesmos tokens do `ThemeToggle` (texto `foreground`, hover `muted`).

## Versão 4: sistema de design no app inteiro

Extensão do `DESIGN.md` para Casos, as 5 etapas do wizard e os alertas de pendência. Nenhuma regra de validação, mensagem ou fórmula do motor foi alterada; só cor, borda, raio, peso e espaçamento.

### O que mudou

1. **Tokens funcionais**: `globals.css` expõe `--color-escalar` e `--color-pivotar` (mapeados para `--chart-scale` e `--chart-pivot`, já existentes, com variante dark). Assim, `text-escalar`, `text-pivotar`, `bg-escalar` etc. substituem as classes cruas `emerald-*`, `amber-*`, `red-*` e `slate-*`. Descontinuar/erro usa `--destructive`.
2. **`IssueList`** ("O que falta nesta etapa"): fundo `bg-muted`, texto `foreground`, borda por `shadow-border`, raio `rounded-md` e ícone pequeno `CircleAlert` em cinza no lugar do âmbar saturado. Título, lista e `role="status" aria-live="polite"` continuam iguais.
3. **Indicador de etapas** (`Wizard.tsx`): a etapa ativa deixou de ser invertida (fundo preto). Agora tem contorno de 1,5px em `foreground` e texto peso 600; as demais usam `shadow-border` e texto `muted-foreground`. "N pendência(s)" virou `text-muted-foreground`, porque âmbar fica reservado para Pivotar.
4. **`RecBadge`**: pill (`rounded-full`) com fundo na cor funcional e texto `background`, como `badge-escalar/pivotar/descontinuar` do `DESIGN.md`; "Pendente"/"n/d" ficou neutro (`bg-muted`).
5. **Cards e caixas** em `CaseList`, `StepIndicators`, `StepBarriers`, `StepDecision`, `StepResult` e `ResultChart`: `border` + `rounded-xl`/`rounded-lg` viraram `shadow-border` + `rounded-md`. Os dois `border-2` (card da recomendação e decisão congelada) viraram um contorno por sombra de 1,5px em `foreground`, que é o único destaque da tela. O fieldset "Julgamento de perda corrigível" mantém contorno em âmbar via `--chart-pivot`, porque o conteúdo é de fato sobre Pivotar.
6. **Exemplos em Casos**: a grade de 3 cards virou uma lista com divisores dentro de uma só superfície.

### Autodiagnóstico dos 10 sinais (app inteiro: Casos, etapas 1 a 5, pendências)

| # | Sinal | Antes (V3) | Depois (V4) |
|---|-------|-----------|-------------|
| 1 | Gradiente tech genérico | Não | Não |
| 2 | Destaque índigo/violeta/azul por padrão | Não (cor crua era âmbar/esmeralda/vermelho/slate) | Não |
| 3 | Grade de cards repetidos | Sim (3 cards de exemplo em Casos) | Parcial (a lista de casos salvos continua em 2 colunas de cards; mantida porque cada card tem conteúdo e ações diferentes) |
| 4 | Tarja lateral colorida | Não | Não |
| 5 | Blur/glassmorphism | Não | Não |
| 6 | Número gigante decorativo | Não | Não (o `RecBadge` grande no resultado é o estado calculado, não decoração) |
| 7 | Ícone repetido em cada título | Não | Não (só um ícone pequeno no alerta de pendência) |
| 8 | Tudo centralizado | Não | Não |
| 9 | Fonte padrão do sistema | Não | Não |
| 10 | Superfície errada / cor sem função | Sim (âmbar usado para "pendente", caixas âmbar saturadas, etapa ativa invertida) | Não |

**Score: antes 2 de 10 no app inteiro; depois 0 claros + 1 parcial.**

Ressalvas honestas: (a) é autoavaliação, sem revisão do orientador nem teste com usuário; (b) **não houve teste visual no navegador** nesta rodada, a verificação foi por `grep`, build, testes e lint, então contraste real no tema escuro (texto escuro sobre `#34d399`/`#fbbf24`) e o contorno de 1,5px da etapa ativa precisam ser conferidos na tela; (c) `PrintReport.tsx` mantém `border border-black` nas tabelas de propósito: é só para impressão, onde sombra não é impressa de forma confiável; (d) os componentes base `ui/input`, `ui/textarea` e `ui/button` mantêm borda CSS (`border-input`) e `rounded-lg`, já que campo de formulário precisa de borda visível e de anel de foco; não foram mexidos.

## Versão 5: escrita acessível e limiares escondidos por padrão

Pedido em `CHANGES_V5.md`. Nenhuma regra de validação, cálculo, nome de campo interno ou valor padrão mudou.

### Parte A: textos reescritos num único padrão

Modelo: o cartão "Hipótese de valor" (definição curta e simples, seguida de um exemplo concreto). Regras aplicadas: sem a letra "S" nem símbolos matemáticos (≥, ≤, <, >, ÷, ±) para o usuário; toda frase faz sentido sozinha; toda definição tem exemplo; frases com ponto e vírgula foram quebradas.

Onde: todos os cartões do tutorial (`Onboarding.tsx`), todas as entradas de `help.ts` que tinham problema, e os textos de interface que mostravam "S" em `StepConfig`, `StepResult`, `ResultChart`, `StepBarriers`, `StepDecision`, `PrintReport`, `CaseList` e nas frases de explicação geradas em `engine.ts` (`explain`, mensagem de barreira e de perda corrigível; só o texto, a lógica é a mesma).

Antes e depois:

- Tutorial, "Indicador". Antes: "De um a três por dimensão (até 12 no total)". Depois: "Escolha de um a três indicadores por dimensão, até 12 indicadores no total."
- Tutorial, "Tipo de KPI". Antes: "Antecedente é um sinal inicial de que o efeito virá; de resultado é o próprio efeito buscado." Depois: "Um indicador antecedente é um sinal inicial de que o efeito pode vir. Um indicador de resultado mede o próprio efeito buscado. Isso importa porque só indicadores de resultado sustentam uma recomendação de Escalar."
- Tutorial, "Limiares". Antes: "Os cortes que convertem a pontuação S em recomendação…" com exemplo "S ≥ 0,70: Escalar; 0,40 ≤ S < 0,70: Pivotar…". Depois: "Os limiares são a política de decisão do framework. Uma linha separa parar (Descontinuar) de ajustar (Pivotar). Outra linha separa ajustar (Pivotar) de escalar (Escalar)…", com exemplo "um projeto com pontuação geral 0,82 recebe Escalar. Um com 0,55 recebe Pivotar. Um com 0,30 recebe Descontinuar."
- `help.ts`, `lower`. Antes: "Abaixo deste valor de S a faixa é Descontinuar (salvo perda corrigível). Padrão 0,40." Depois: "Linha que separa parar de ajustar. Se a pontuação geral calculada pelo framework ficar abaixo deste valor, a recomendação é Descontinuar, salvo se a perda for corrigível. O padrão do artigo é 0,40. Ex.: um projeto com pontuação geral 0,35 recebe Descontinuar."
- `help.ts`, `weights`. Antes: "…a média ÷ 100 vira o peso." Depois: "…Se a média da qualidade técnica for 30 pontos, o peso dela é 0,30."
- Tela de resultado. Antes: "Pontuação total S" e "Limiares: Pivotar ≥ 0,40; Escalar ≥ 0,70". Depois: "Pontuação geral" e "Limiares: Pivotar a partir de 0,40. Escalar a partir de 0,70."

`border` e `variation` agora dizem explicitamente que são parâmetros avançados e que a maioria dos casos não precisa mudá-los.

### Parte B: limiares em "Configurações avançadas"

Em `StepConfig.tsx`, os quatro campos (`lower`, `scale`, `border`, `variation`) ficam dentro de um `Collapsible` do shadcn/ui (instalado com `npx shadcn@latest add collapsible`), fechado por padrão. Fechado, mostra uma linha dizendo que o framework usa os limiares padrão do artigo e que a maioria dos casos não precisa mudar isso, com o link "Ver e editar limiares". Aberto, os campos são os mesmos de antes. Dois cuidados extras: se os valores foram alterados, a linha diz isso em vez de afirmar que são os padrões; e se algum limiar tem erro de validação ao abrir a etapa, a seção já abre expandida para o erro não ficar escondido.

### Limitações honestas

- A revisão foi feita lendo o código; não abri o app no navegador, então o Collapsible não foi testado visualmente (só build, testes e lint).
- Textos curtos de rótulo (nomes de campo, opções de select) e as mensagens de validação de `engine.ts` não foram reescritos uma a uma contra a regra 3 (exemplo para toda definição); só removi o símbolo "≥" de uma delas.
- Os dados de exemplo (`src/lib/data/examples.ts`) ainda usam "÷" nas descrições de origem da evidência, porque são conteúdo dos casos do artigo e não texto de interface.
- Comentários de código ainda usam "S" e notação matemática; não aparecem para o usuário.
