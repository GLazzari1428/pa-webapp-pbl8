/**
 * Textos curtos dos tooltips "i". Cada texto traz uma explicação e um exemplo
 * concreto. A origem de cada um está nas melhorias M1–M8 (Tabela 5 do artigo)
 * e no questionário de usabilidade do PBL7.
 */
export const HELP = {
  // Configuração
  caseName: "Nome curto que identifica a iniciativa avaliada. Ex.: \"Assistente de atendimento com LLM\".",
  dataType:
    "Diz se os números vêm de produção (reais), são valores de referência acordados ou simulados. Aparece no relatório para não confundir simulação com medição (M7).",
  context: "Uma ou duas frases sobre o que o MVP faz e para quem. Ex.: \"Assistente que responde clientes no 1º nível do suporte\".",
  period: "Janela em que o piloto foi medido. Ex.: \"Meses 1 a 3 do piloto\".",
  owners: "Pessoas ou áreas responsáveis pela avaliação. Ex.: \"Supervisor do atendimento e gerente de operações\".",
  hypothesisText:
    "O resultado que o projeto prometeu quando o MVP foi aprovado, numa frase com número. Ex.: \"Reduzir o tempo médio de atendimento de 12 para 8 minutos\".",
  hypothesisIndicator:
    "Qual indicador mede a promessa. Se a meta da hipótese não for atingida nesse indicador, o resultado não pode ser Escalar. Ex.: \"Tempo médio de atendimento\".",
  hypothesisTarget:
    "Valor que o indicador precisa alcançar para a hipótese ser considerada cumprida, na unidade do indicador. Ex.: 8 (minutos). Vazio = usa a meta do indicador.",
  weights:
    "Importância de cada dimensão na nota final; os quatro pesos somam 1. Defina antes de ver os resultados. Ex.: cada decisor distribui 100 pontos e a média ÷ 100 vira o peso.",
  lower: "Abaixo deste valor de S a faixa é Descontinuar (salvo perda corrigível). Padrão 0,40.",
  scale: "A partir deste valor de S a faixa é Escalar. Padrão 0,70. Torne mais exigente se o risco do projeto for alto.",
  border: "Se S ficar a esta distância de um limiar, o resultado é marcado como de fronteira. Padrão 0,05. Ex.: S = 0,656 está a 0,044 de 0,70.",
  variation: "Quanto cada peso varia na análise de sensibilidade (para baixo e para cima). Padrão 0,20 = ±20%, o que gera 81 combinações.",
  correctable:
    "Só aparece quando S fica abaixo do limiar inferior (M6). Responda Sim se a perda está concentrada numa dimensão que dá para corrigir; nesse caso a faixa vira Pivotar em vez de Descontinuar.",

  // Indicadores (M1, M2, M3)
  indName: "Nome que qualquer gestor entenda, sem siglas de fórmula. Ex.: \"Atendimentos refeitos por erro da IA\".",
  dimension: "Dimensão que o indicador mede. Ex.: custo por atendimento → Eficiência econômica.",
  unit: "Unidade dos números deste indicador. Ex.: tempo de liberação em dias; custo em R$; adesão em %.",
  baseline: "Valor antes do MVP, normalmente a média dos últimos meses. Ex.: 25% de atendimentos refeitos.",
  target: "Valor que o projeto pretende atingir, retirado da hipótese ou acordado com o gestor. Ex.: 10%.",
  observed: "Valor medido durante o piloto, pelo mesmo método da linha de base. Ex.: 11%. Sem dado? Deixe vazio: o indicador sai do cálculo, não vira zero.",
  weight: "Importância do indicador dentro da sua dimensão; os pesos de uma dimensão somam 1. Ex.: respostas corretas 0,6 e atendimentos refeitos 0,4.",
  direction: "Melhor quando maior: subir é bom (ex.: % de respostas corretas). Melhor quando menor: cair é bom (ex.: tempo de atendimento, custo).",
  kpiType:
    "Antecedente: sinal inicial de tendência (ex.: % de atendentes que usam a IA). Resultado: o efeito que se quer de fato (ex.: tempo de atendimento). Só antecedentes não sustentam Escalar.",
  evidenceSource: "De onde veio o número. Ex.: \"Sistema de chamados, contagem dos atendimentos refeitos\".",
  evidencePeriod: "Período que o número cobre. Ex.: \"Meses 1 a 3 do piloto\".",
  evidenceOwner: "Pessoa ou área que fez a medição. Ex.: \"Supervisor do atendimento\".",
  binary:
    "Linha de base igual à meta: o indicador vira sim/não. Declare o critério e se foi atendido. Ex.: \"Relatório de auditoria entregue\".",

  // Barreiras
  barrierName: "Requisito mínimo que nenhuma nota alta compensa. Ex.: Confiabilidade, Segurança e acesso, Privacidade, Conformidade legal e ética.",
  barrierCriterion: "Critério verificável. Ex.: \"Nenhum acesso ao sistema sem permissão\".",
  barrierStatus:
    "Atendida: há documento que comprova. Em tratamento: há plano aprovado (limita a Pivotar). Violada ou Não avaliada: impõe Descontinuar, qualquer que seja S.",
  barrierEvidence: "Obrigatória para Atendida. Documento, parecer ou relatório que comprova. Ex.: \"Parecer do jurídico de 10/03, sem pendências\".",
  barrierPlan: "Obrigatório para Em tratamento. O que será feito e até quando. Ex.: \"Migrar chaves para cofre antes da escala\".",
  barrierPlanApproved: "Em tratamento só limita a saída a Pivotar quando o plano está aprovado; sem aprovação, a recomendação fica pendente.",
  barrierOwner: "Área que verificou a barreira. Ex.: segurança com a TI, privacidade com o DPO.",

  // Resultado (M4, M8)
  band: "Faixa por pontuação: o que S indicaria sozinho, só comparando com os limiares.",
  recommendation:
    "Recomendação final: a faixa depois de aplicar barreiras, hipótese de valor e tipo de KPI. Pode ser mais restritiva que a faixa, nunca menos.",
  sensitivity:
    "Recalcula S com cada peso de dimensão multiplicado por 0,8, 1,0 ou 1,2 (81 combinações). Se a recomendação muda em alguma, ela depende das suas escolhas de peso.",
  coverage: "Parte do peso da dimensão que tem evidência válida. 1 = todos os indicadores medidos. Cobertura 0 impede Escalar.",

  // Decisão (M5)
  decision: "Decisão humana. Não precisa seguir a recomendação, mas uma divergência deve ser justificada.",
  justification: "Por que essa decisão, mesmo quando concorda com a recomendação. Ex.: \"Custo e governança ainda não sustentam a escala\".",
  actionPlan: "Próximos passos concretos. Ex.: \"Reduzir custo por atendimento; implantar controles pendentes; reavaliar em 60 dias\".",
  decisionOwner: "Quem responde pela decisão. Ex.: \"Gerente de operações\".",
  reviewDate: "Quando o caso deve ser reavaliado.",
  reopenReason: "Por que a decisão anterior está sendo revista. A versão anterior continua guardada.",
} as const;
