# Objetivo

Construir uma aplicação web que substitui completamente a planilha Excel/LibreOffice usada até agora como o "Framework de decisão pós-MVP de iniciativas de IA" (Grupo 14, disciplina Pesquisa Aplicada, PUCPR). Isto é o PBL8 do projeto: DSR Etapa 5 (Melhorias). Esta pasta (`pbl8/webapp`) é um projeto novo e isolado; não toque em nada fora dela.

Não existe usuário real nem dado de produção. É uma ferramenta acadêmica, mas tem que funcionar de ponta a ponta e ser honesta sobre as limitações (não inventar precisão que o modelo não tem).

# Leia primeiro, nesta ordem

1. `/home/glazzari/PUC/pesquisa_aplicada/pbl6/artigo/main.tex`: artigo acadêmico completo do framework. Contém a especificação do modelo conceitual (sete entidades: caso de uso, configuração da avaliação, indicador, evidência, barreira, pontuação, decisão), as fórmulas de normalização e agregação, as faixas de recomendação (Pivotar / Escalar / Descontinuar), a análise de sensibilidade (81 combinações de peso), a Tabela 2 (três casos reais avaliados), a Tabela 3 (questionário de usabilidade), a Tabela 4 (objetivos x resultado) e a Tabela 5 (melhorias M1 a M8). Esta é a fonte de verdade da lógica de negócio e do vocabulário a usar na interface.
2. `/home/glazzari/PUC/pesquisa_aplicada/pbl6/Framework_Modelo_Limpo.xlsx` e `/home/glazzari/PUC/pesquisa_aplicada/pbl6/Framework_Caso_A.xlsx`: a planilha atual, com as fórmulas reais, aba por aba. Use para entender exatamente o que cada aba calcula hoje (abra com uma lib de leitura de xlsx, ex. `openpyxl` via Python, se precisar inspecionar fórmulas, não só valores).
3. `/home/glazzari/PUC/pesquisa_aplicada/pbl7/filled-files/Framework_Squad_Negociacao_preenchido.xlsx` e `Framework_Conectahit_Simulado.xlsx`: dois casos reais preenchidos, úteis como dados de teste para validar que a nova implementação reproduz os mesmos resultados (S e recomendação) que o artigo relata na Tabela 2.
4. `/home/glazzari/PUC/pesquisa_aplicada/pbl6/04_Tutorial.md` e `/home/glazzari/PUC/pesquisa_aplicada/pbl6/tutorial.tex`: conteúdo do tutorial de preenchimento já escrito. Reaproveite e adapte esse texto para a tela de onboarding (não precisa reescrever do zero).

# Bugs de cálculo a corrigir (não existiam na planilha de forma correta, fazem parte do escopo)

A lógica atual tem seis problemas documentados que devem ser corrigidos na reimplementação, não só copiados:

1. A hipótese de valor declarada no caso não trava a recomendação Escalar quando a meta da hipótese não foi atingida. Isso tem que impedir Escalar mesmo que a pontuação agregada S esteja na faixa de Escalar.
2. Uma barreira pode ser marcada como "Atendida" sem nenhuma evidência anexada/registrada, passa sem checagem. Exigir evidência (texto não vazio) sempre que o status for "Atendida".
3. O tipo de KPI (antecedente vs. resultado) é coletado mas ignorado no cálculo. Ele deve influenciar como o indicador é tratado (ex. indicadores antecedentes sinalizam tendência, não entram deflacionados na pontuação final da mesma forma que indicadores de resultado; siga a lógica descrita no artigo).
4. A decisão final (Escalar/Pivotar/Descontinuar + justificativa + plano) pode ser reaberta e alterada silenciosamente depois de registrada. Depois de salva, a decisão deve ficar congelada (read-only), com um botão explícito "Reabrir decisão" que gera um novo registro versionado com timestamp, nunca sobrescreve o anterior.
5. O vínculo entre abas/tabelas é por posição de linha (ex. o indicador na linha 3 da aba de configuração corresponde à linha 3 da aba de resultado), o que quebra se alguém reordenar. Use um identificador estável (uuid ou slug) para cada indicador/barreira, nunca a posição.
6. As fórmulas do Caso A e dos casos novos (Conectahit, Squad) divergiam entre si (mesma lógica implementada de formas diferentes nas duas versões da planilha). Na nova implementação só pode existir UM motor de cálculo (um módulo TypeScript puro, testável, sem duplicação), usado por todos os casos.

# Requisitos funcionais

- Configuração do caso: nome, hipótese de valor (texto + meta mensurável), pesos por dimensão, limiares das faixas (editáveis, com valor padrão sensato).
- Indicadores: até 12, cada um com nome acessível (sem letras de fórmula tipo "Base b"), unidade explícita (incluir horas e dias na lista, não só percentual e moeda), linha de base, meta, valor observado, peso na dimensão, direção (melhor quando maior / melhor quando menor), tipo de KPI (antecedente / resultado), origem da evidência. Percentual deve aceitar entrada como "15%" e também "15" sem ambiguidade (normalizar e mostrar um exemplo ao lado do campo).
- Barreiras não compensáveis: lista, status (Atendida / Em tratamento / Violada), evidência obrigatória quando Atendida, plano quando Em tratamento. Uma barreira Violada ou Em tratamento limita o resultado conforme o artigo (nunca é compensada pela pontuação agregada).
- Motor de cálculo: normalização por indicador, agregação por dimensão com os pesos, pontuação geral S, faixa por limiar, recomendação final após aplicar hipótese de valor e barreiras (regra de não compensação), e a mensagem explicando quando a recomendação final difere da faixa por pontuação (ex. "faixa Escalar limitada a Pivotar pela barreira X").
- Análise de sensibilidade: recalcular S variando os pesos dentro de uma grade (equivalente às 81 combinações do artigo) e mostrar o intervalo de resultado e quão estável/instável é a recomendação.
- Decisão final: registrar decisão, justificativa, plano de ação, responsável, data; congelada após salvar (ver bug 4 acima).
- Persistência: 100% no navegador (localStorage ou IndexedDB), sem backend nem banco de dados. Permitir múltiplos casos salvos e exportar um caso (JSON) e os resultados (PDF, pode ser via impressão do navegador ou lib leve de PDF client-side).

# Requisitos de UI/UX (já aprovados pelo orientador, implementar exatamente estes quatro)

1. Tooltip com ícone "i" (lucide-react `Info`, componente `Tooltip` do shadcn/ui) em todo campo que precisar de explicação, com texto curto e um exemplo concreto. Use como fonte de texto os achados já documentados na Tabela 5 do artigo (M1 a M8) e na pasta `pbl7` (arquivos de usabilidade), que listam exatamente que nome/unidade/explicação faltava.
2. Fluxo em etapas (wizard, um bloco por vez, com barra de progresso), substituindo as antigas abas separadas da planilha: Configuração → Indicadores → Barreiras → Resultado → Decisão.
3. Tela inicial de onboarding/tutorial obrigatória na primeira visita (antes de chegar ao formulário), explicando como coletar os dados antes de preencher (baseada no tutorial já escrito em `pbl6/04_Tutorial.md`). Só pode ser pulada depois de ter sido vista pelo menos uma vez (guardar flag em localStorage), mas deve ter um link "ver tutorial de novo" sempre visível.
4. Tela de resultado com um gráfico (biblioteca `recharts`, inspirado no padrão "Analytics Chart" do cult-ui: https://www.cult-ui.com/docs/components/analytics-chart; reimplemente o visual com recharts + shadcn, não precisa instalar o cult-ui) mostrando a pontuação por dimensão e o intervalo da análise de sensibilidade.

# Stack obrigatória

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, 100% client-side (sem servidor, sem banco de dados, sem variável de ambiente secreta). O projeto precisa buildar com `npm run build` sem erros e ser compatível com deploy estático/edge gratuito na Vercel (não tente fazer login nem deploy real, não há credenciais; só garanta que o build passa). Acessibilidade: labels associados aos inputs, navegação por teclado, contraste de cor adequado (WCAG AA), mensagens de erro de formulário anunciadas (aria-live ou aria-describedby).

# Entregáveis, dentro de `pbl8/webapp/`

- O projeto Next.js completo e funcional, buildando sem erros.
- `README.md` com instruções de instalação (`npm install`, `npm run dev`, `npm run build`) e um parágrafo de como conectar o repositório à Vercel para deploy gratuito.
- `MELHORIAS.md` documentando, em português, cada uma das seis correções de backend e cada um dos quatro elementos de UX implementados, ligando cada item a onde no código ele foi resolvido (arquivo/componente). Este arquivo vai alimentar o relatório acadêmico do PBL8 depois, então seja específico e factual, sem inflar o que foi feito.
- Alguns testes automatizados (Vitest ou Jest) cobrindo o motor de cálculo puro, incluindo casos que replicam os três casos do artigo (Caso A, Conectahit, Squad de Negociação) e confirmam que a pontuação S calculada bate com os valores da Tabela 2 do artigo (0,656 / 0,615 / 0,785), dentro de uma tolerância pequena.

Ao terminar, rode o build e os testes, confira que passam, e escreva um resumo final do que foi feito e do que ainda falta (se algo ficou faltando, diga explicitamente, não omita).
