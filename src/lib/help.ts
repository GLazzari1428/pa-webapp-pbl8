/**
 * Textos curtos dos tooltips "i". Cada texto traz uma explicação e um exemplo
 * concreto. A origem de cada um está nas melhorias M1–M8 (Tabela 5 do artigo)
 * e no questionário de usabilidade do PBL7.
 */
export const HELP = {
  // Configuração
  caseName: "Nome curto que identifica a iniciativa avaliada. Ex.: \"Assistente de atendimento com LLM\".",
  dataType: "Diz se os números vêm de produção (reais), são valores de referência acordados ou são simulados. O tipo aparece no relatório para que uma simulação não seja confundida com uma medição real (M7). Ex.: um piloto medido no sistema de chamados usa \"Reais\".",
  context: "Uma ou duas frases sobre o que o MVP faz e para quem. Ex.: \"Assistente que responde clientes no 1º nível do suporte\".",
  period: "Janela em que o piloto foi medido. Ex.: \"Meses 1 a 3 do piloto\".",
  owners: "Pessoas ou áreas responsáveis pela avaliação. Ex.: \"Supervisor do atendimento e gerente de operações\".",
  hypothesisText:
    "O resultado que o projeto prometeu quando o MVP foi aprovado, numa frase com número. Ex.: \"Reduzir o tempo médio de atendimento de 12 para 8 minutos\".",
  hypothesisIndicator: "O indicador que mede a promessa da hipótese. Se a meta da hipótese não for atingida nesse indicador, a recomendação não pode ser Escalar. Ex.: \"Tempo médio de atendimento\".",
  hypothesisTarget: "O valor que o indicador precisa alcançar para a hipótese ser considerada cumprida, na unidade do indicador. Se ficar vazio, o framework usa a meta do próprio indicador. Ex.: 8 (minutos).",
  weights: "O peso diz quanto cada dimensão importa na nota geral. Os quatro pesos somam 1. Defina os pesos antes de ver os resultados. Ex.: cada decisor distribui 100 pontos entre as dimensões. Se a média da qualidade técnica for 30 pontos, o peso dela é 0,30.",
  lower: "Linha que separa parar de ajustar. Se a pontuação geral calculada pelo framework ficar abaixo deste valor, a recomendação é Descontinuar, salvo se a perda for corrigível. O padrão do artigo é 0,40. Ex.: um projeto com pontuação geral 0,35 recebe Descontinuar.",
  scale: "Linha que separa ajustar de escalar. Se a pontuação geral calculada pelo framework atingir este valor, a faixa é Escalar. O padrão do artigo é 0,70. Ex.: um projeto com pontuação geral 0,75 fica na faixa Escalar. Use um valor mais alto se o risco do projeto for alto.",
  border: "Parâmetro avançado: a maioria dos casos não precisa mudar este valor. Quando a pontuação geral fica perto de um limiar, o resultado é marcado como de fronteira. Este valor define o que conta como perto. O padrão é 0,05. Ex.: uma pontuação geral de 0,656 está 0,044 abaixo do limiar de 0,70 e é marcada como de fronteira.",
  variation: "Parâmetro avançado: a maioria dos casos não precisa mudar este valor. A análise de sensibilidade recalcula o resultado com cada peso de dimensão um pouco menor e um pouco maior. Este valor define quanto cada peso varia. Ex.: o padrão 0,20 testa cada peso 20% abaixo e 20% acima, num total de 81 combinações.",
  correctable: "Esta pergunta só aparece quando a pontuação geral fica abaixo do limiar inferior (M6). Responda Sim se a perda está concentrada numa dimensão que dá para corrigir. Nesse caso, a faixa vira Pivotar em vez de Descontinuar. Ex.: só o custo está ruim, e há um plano para reduzi-lo.",

  // Indicadores (M1, M2, M3)
  indName: "Nome que qualquer gestor entenda, sem siglas de fórmula. Ex.: \"Atendimentos refeitos por erro da IA\".",
  dimension: "A dimensão que o indicador mede. Ex.: custo por atendimento pertence à dimensão Eficiência econômica.",
  unit: "A unidade em que os números deste indicador são expressos. Ex.: tempo de liberação em dias, custo em reais, adesão em percentual.",
  baseline: "O valor do indicador antes do MVP, normalmente a média dos últimos meses. Ex.: 25% de atendimentos refeitos antes do piloto.",
  target: "O valor que o projeto pretende atingir neste indicador, retirado da hipótese ou acordado com o gestor. Ex.: 10% de atendimentos refeitos.",
  observed: "O valor medido durante o piloto, pelo mesmo método da linha de base. Ex.: 11% de atendimentos refeitos. Se não houver dado, deixe vazio. O indicador sai do cálculo e não vira zero.",
  weight: "Quanto o indicador importa dentro da sua dimensão. Os pesos dos indicadores de uma mesma dimensão somam 1. Ex.: respostas corretas com peso 0,6 e atendimentos refeitos com peso 0,4.",
  direction: "Diz se o indicador melhora quando sobe ou quando cai. Ex.: em respostas corretas, maior é melhor. Em tempo de atendimento e custo, menor é melhor.",
  kpiType: "Um indicador antecedente é um sinal inicial de que o efeito pode vir. Um indicador de resultado mede o próprio efeito buscado. Só indicadores de resultado sustentam a recomendação Escalar. Ex.: o percentual de atendentes que usam a IA é antecedente. O tempo de atendimento é de resultado.",
  evidenceSource: "De onde veio o número. Ex.: \"Sistema de chamados, contagem dos atendimentos refeitos\".",
  evidencePeriod: "Período que o número cobre. Ex.: \"Meses 1 a 3 do piloto\".",
  evidenceOwner: "Pessoa ou área que fez a medição. Ex.: \"Supervisor do atendimento\".",
  binary: "Quando a linha de base é igual à meta, o indicador vira uma pergunta de sim ou não. Declare o critério e diga se ele foi atendido. Ex.: \"Relatório de auditoria entregue\".",

  // Barreiras
  barrierName: "Uma barreira é um requisito mínimo que nenhuma nota alta compensa. Ex.: Confiabilidade, Segurança e acesso, Privacidade, Conformidade legal e ética.",
  barrierCriterion: "O critério verificável que diz se a barreira foi cumprida. Ex.: \"Nenhum acesso ao sistema sem permissão\".",
  barrierStatus: "Atendida: há documento que comprova. Em tratamento: há plano aprovado, e a recomendação fica limitada a Pivotar. Violada ou Não avaliada: a recomendação é Descontinuar, qualquer que seja a pontuação geral. Ex.: segurança sem relatório de testes fica Não avaliada.",
  barrierEvidence: "O documento, parecer ou relatório que comprova a barreira. É obrigatório para marcar Atendida. Ex.: \"Parecer do jurídico de 10/03, sem pendências\".",
  barrierPlan: "O que será feito para cumprir a barreira e até quando. É obrigatório para marcar Em tratamento. Ex.: \"Migrar chaves para cofre antes da escala\".",
  barrierPlanApproved: "Uma barreira Em tratamento só limita a recomendação a Pivotar quando o plano está aprovado. Sem aprovação, a recomendação fica pendente. Ex.: plano de migração de chaves aprovado pelo gestor de TI.",
  barrierOwner: "A área que verificou a barreira. Ex.: segurança verificada com a TI, privacidade com o encarregado de dados.",

  // Resultado (M4, M8)
  band: "A faixa por pontuação é a recomendação que a pontuação geral daria sozinha, só comparando com os limiares. Ex.: com os limiares padrão, uma pontuação geral de 0,656 fica na faixa Pivotar.",
  recommendation: "A recomendação final é a faixa por pontuação depois de aplicar barreiras, hipótese de valor e tipo de indicador. Ela pode ser mais restritiva que a faixa, nunca menos. Ex.: faixa Escalar com uma barreira em tratamento vira Pivotar.",
  sensitivity: "A análise de sensibilidade recalcula a pontuação geral com cada peso de dimensão 20% menor, igual e 20% maior, num total de 81 combinações. Se a recomendação muda em alguma combinação, ela depende das suas escolhas de peso. Ex.: no Caso A, algumas combinações levam a Escalar em vez de Pivotar.",
  coverage: "A cobertura é a parte do peso da dimensão que tem evidência válida. Cobertura 1 significa que todos os indicadores da dimensão foram medidos. Uma dimensão com cobertura 0 impede Escalar. Ex.: se falta o indicador com peso 0,4, a cobertura é 0,6.",

  // Decisão (M5)
  decision: "A decisão humana sobre o caso. Ela não precisa seguir a recomendação, mas uma divergência deve ser justificada. Ex.: a recomendação é Pivotar e a equipe decide Pivotar.",
  justification: "Por que essa decisão, mesmo quando concorda com a recomendação. Ex.: \"Custo e governança ainda não sustentam a escala\".",
  actionPlan: "Próximos passos concretos. Ex.: \"Reduzir custo por atendimento; implantar controles pendentes; reavaliar em 60 dias\".",
  decisionOwner: "Quem responde pela decisão. Ex.: \"Gerente de operações\".",
  reviewDate: "A data em que o caso deve ser reavaliado. Ex.: 60 dias depois da decisão.",
  reopenReason: "Por que a decisão anterior está sendo revista. A versão anterior continua guardada. Ex.: \"O custo por atendimento caiu após a troca de modelo\".",
} as const;
