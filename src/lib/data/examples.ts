/**
 * Os três casos avaliados no artigo (Tabela 2), transcritos das planilhas
 * pbl6/Framework_Caso_A.xlsx, pbl7/filled-files/Framework_Conectahit_Simulado.xlsx
 * e pbl7/filled-files/Framework_Squad_Negociacao_preenchido.xlsx.
 *
 * Percentuais estão em pontos percentuais (88 = 88%), não em fração.
 * Os valores são simulados ou de referência, como declarado no artigo.
 */
import {
  DEFAULT_THRESHOLDS,
  type Barrier,
  type DimensionId,
  type FrameworkCase,
  type Indicator,
  type KpiType,
  type UnitId,
} from "../engine/types";

type Row = [
  id: string,
  dim: DimensionId,
  name: string,
  kpi: KpiType,
  dir: "maior" | "menor",
  unit: UnitId,
  b: number,
  g: number,
  v: number,
  w: number,
  source: string,
  period: string,
  owner: string,
];

const ind = (r: Row): Indicator => ({
  id: r[0],
  dimension: r[1],
  name: r[2],
  kpiType: r[3],
  direction: r[4],
  unit: r[5],
  baseline: r[6],
  target: r[7],
  observed: r[8],
  weight: r[9],
  evidenceSource: r[10],
  evidencePeriod: r[11],
  evidenceOwner: r[12],
  binaryCriterion: "",
  binaryMet: null,
});

const bar = (
  id: string,
  name: string,
  criterion: string,
  status: Barrier["status"],
  evidence: string,
  plan: string,
  planApproved: boolean,
  owner: string,
): Barrier => ({ id, name, criterion, status, evidence, plan, planApproved, owner });

const STAMP = "2026-10-21T00:00:00.000Z";

export const CASO_A: FrameworkCase = {
  id: "exemplo-caso-a",
  createdAt: STAMP,
  updatedAt: STAMP,
  config: {
    name: "Caso A — assistente de atendimento com LLM",
    context: "Assistente virtual com IA (LLM) que responde clientes no primeiro nível do suporte.",
    dataType: "simulado",
    period: "Meses 1 a 3 do piloto",
    owners: "Supervisor do atendimento e gerente de operações",
    hypothesis: {
      text: "Reduzir o tempo médio de atendimento de 12 para 8 minutos, sem piorar a qualidade das respostas nem a conformidade.",
      indicatorId: "casoa-tempo-atendimento",
      target: 8,
    },
    weights: { tecnica: 0.3, economica: 0.25, operacional: 0.25, governanca: 0.2 },
    thresholds: { ...DEFAULT_THRESHOLDS },
    correctableLoss: null,
    correctableDimension: null,
    correctableRationale: "",
  },
  indicators: [
    ["casoa-respostas-corretas", "tecnica", "Respostas corretas da IA", "resultado", "maior", "percentual", 70, 90, 88, 0.6, "SIM-A-01: auditoria amostral de respostas", "Meses 1 a 3", "Supervisor do atendimento"],
    ["casoa-atendimentos-refeitos", "tecnica", "Atendimentos refeitos por erro da IA", "resultado", "menor", "percentual", 25, 10, 11, 0.4, "SIM-A-02: contagem de atendimentos refeitos no sistema de chamados", "Meses 1 a 3", "Supervisor do atendimento"],
    ["casoa-custo-atendimento", "economica", "Custo médio por atendimento", "resultado", "menor", "moeda", 4, 2, 3.3, 1, "SIM-A-03: custos de API e infraestrutura ÷ atendimentos", "Meses 1 a 3", "Gerente de operações"],
    ["casoa-tempo-atendimento", "operacional", "Tempo médio de atendimento", "resultado", "menor", "minutos", 12, 8, 8.2, 0.6, "SIM-A-04: relatório de tempo do sistema de chamados", "Meses 1 a 3", "Supervisor do atendimento"],
    ["casoa-adesao-atendentes", "operacional", "Atendentes que usam a IA", "antecedente", "maior", "percentual", 30, 80, 76, 0.4, "SIM-A-05: log de uso da ferramenta", "Meses 1 a 3", "Supervisor do atendimento"],
    ["casoa-controles", "governanca", "Controles de segurança previstos já implantados", "antecedente", "maior", "percentual", 40, 80, 56, 0.6, "SIM-A-06: checklist de controles de TI", "Meses 1 a 3", "Equipe de TI"],
    ["casoa-documentacao", "governanca", "Documentação de conformidade concluída", "antecedente", "maior", "percentual", 50, 90, 56, 0.4, "SIM-A-07: checklist do jurídico", "Meses 1 a 3", "Jurídico"],
  ].map((r) => ind(r as Row)),
  barriers: [
    bar("casoa-bar-confiabilidade", "Confiabilidade essencial", "A IA não causou nenhum erro grave ao cliente.", "atendida", "SIM-A-BAR-01: relatório de erros do piloto, sem erro grave.", "", false, "Gerente de operações"),
    bar("casoa-bar-seguranca", "Segurança e acesso", "Nenhum acesso ao sistema sem permissão.", "atendida", "SIM-A-BAR-02: registro de acessos, sem acesso indevido.", "", false, "Equipe de TI"),
    bar("casoa-bar-privacidade", "Privacidade", "Dados dos clientes usados só para o atendimento.", "atendida", "SIM-A-BAR-03: revisão do encarregado de dados, uso dentro da finalidade.", "", false, "Encarregado de dados (DPO)"),
    bar("casoa-bar-conformidade", "Conformidade legal e ética", "Nenhum uso de conteúdo sem autorização nem impedimento legal.", "atendida", "SIM-A-BAR-04: parecer do jurídico, sem pendências.", "", false, "Jurídico"),
  ],
  decisions: [],
  decisionDraft: null,
};

export const CONECTAHIT: FrameworkCase = {
  id: "exemplo-conectahit",
  createdAt: STAMP,
  updatedAt: STAMP,
  config: {
    name: "Conectahit — licenciamento musical",
    context:
      "Plataforma Marketplace + SaaS de licenciamento musical para usos audiovisuais e comerciais. Parte assistida por IA (enriquecimento de metadados).",
    dataType: "referencia",
    period: "Primeiros 3 meses de operação do MVP (simulado)",
    owners: "Liderança de produto, operação de licenciamento, TI/segurança e jurídico",
    hypothesis: {
      text: "Reduzir o tempo de liberação de uma licença de sincronização de 21 para 3 dias, sem piorar a segurança jurídica nem elevar o custo operacional por licença.",
      indicatorId: "ch-tempo-liberacao",
      target: 3,
    },
    weights: { tecnica: 0.25, economica: 0.3, operacional: 0.25, governanca: 0.2 },
    thresholds: { ...DEFAULT_THRESHOLDS },
    correctableLoss: null,
    correctableDimension: null,
    correctableRationale: "",
  },
  indicators: [
    ["ch-licencas-sem-correcao", "tecnica", "Licenças emitidas sem correção manual de regra ou preço", "resultado", "maior", "percentual", 60, 95, 86, 0.6, "SIM-CH-01", "3 meses", "Operação de licenciamento"],
    ["ch-metadados", "tecnica", "Faixas com metadados enriquecidos corretamente pela IA", "resultado", "maior", "percentual", 50, 90, 82, 0.4, "SIM-CH-02", "3 meses", "Liderança de produto"],
    ["ch-custo-licenca", "economica", "Custo operacional médio por licença emitida", "resultado", "menor", "moeda", 180, 60, 120, 1, "SIM-CH-03", "3 meses", "Liderança de produto"],
    ["ch-tempo-liberacao", "operacional", "Tempo médio de liberação da licença", "resultado", "menor", "dias", 21, 3, 6, 0.5, "SIM-CH-04", "3 meses", "Operação de licenciamento"],
    ["ch-fluxo-automatico", "operacional", "Licenças liberadas por regra pré-configurada (fluxo automático)", "antecedente", "maior", "percentual", 0, 50, 20, 0.2, "SIM-CH-05", "3 meses", "Operação de licenciamento"],
    ["ch-conversao", "operacional", "Cotações convertidas em licença", "resultado", "maior", "percentual", 15, 40, 28, 0.3, "SIM-CH-06", "3 meses", "Liderança de produto"],
    ["ch-controles", "governanca", "Controles de segurança previstos já implantados", "antecedente", "maior", "percentual", 40, 90, 70, 0.5, "SIM-CH-07", "3 meses", "TI / segurança"],
    ["ch-catalogos", "governanca", "Catálogos com contrato de adesão assinado e direitos comprovados", "antecedente", "maior", "percentual", 30, 90, 60, 0.5, "SIM-CH-08", "3 meses", "Jurídico"],
  ].map((r) => ind(r as Row)),
  barriers: [
    bar("ch-bar-confiabilidade", "Confiabilidade essencial", "Nenhuma licença emitida sem aprovação da obra e, quando houver escopo, do fonograma.", "atendida", "SIM-CH-BAR-01: relatório de licenças e aprovações, sem emissão sem aprovação.", "", false, "Operação de licenciamento"),
    bar("ch-bar-seguranca", "Segurança e acesso", "Nenhum acesso indevido a dados e arquivos; proteção por linha (RLS) em todas as tabelas expostas.", "em_tratamento", "SIM-CH-BAR-02: verificação de segurança do banco apontou tabela de backup sem RLS.", "Ativar RLS e remover as tabelas de backup após validação.", true, "TI / segurança"),
    bar("ch-bar-privacidade", "Privacidade", "Dados pessoais de clientes, artistas e titulares usados só para licenciar, contratar e pagar.", "atendida", "SIM-CH-BAR-03: revisão do encarregado de dados (simulada), uso dentro da finalidade.", "", false, "Encarregado de dados (DPO)"),
    bar("ch-bar-conformidade", "Conformidade legal e ética", "Licenciar apenas o que tem estrutura de direitos comprovada e escopo habilitado.", "atendida", "SIM-CH-BAR-04: parecer do jurídico (simulado), sem pendências.", "", false, "Jurídico"),
  ],
  decisions: [],
  decisionDraft: null,
};

export const SQUAD: FrameworkCase = {
  id: "exemplo-squad-negociacao",
  createdAt: STAMP,
  updatedAt: STAMP,
  config: {
    name: "Squad de Negociação — recuperação de pedidos abandonados",
    context:
      "Agentes de IA identificam pedidos abandonados na Plataforma de Canais, enviam follow-up por e-mail com respostas apoiadas em RAG e registram o andamento no CRM.",
    dataType: "referencia",
    period: "Ciclo 1 do piloto: 8 semanas",
    owners: "Product owner da Divisão Canais; desenvolvedor de automação e IA; gestor comercial; DPO/Jurídico",
    hypothesis: {
      text: "O follow-up automatizado com IA recupera ao menos 15% dos pedidos abandonados, reduz o primeiro contato para até 4 h e custa menos por venda recuperada que o follow-up manual.",
      indicatorId: "sq-recuperacao",
      target: 15,
    },
    weights: { tecnica: 0.25, economica: 0.25, operacional: 0.3, governanca: 0.2 },
    thresholds: { ...DEFAULT_THRESHOLDS },
    correctableLoss: null,
    correctableDimension: null,
    correctableRationale: "",
  },
  indicators: [
    ["sq-aderencia", "tecnica", "Respostas aderentes à Política de Canais (auditoria amostral)", "resultado", "maior", "percentual", 80, 95, 91, 0.6, "EV-T1-01: auditoria amostral de 50 e-mails", "Semanas 1–8", "Gestor comercial de Canais"],
    ["sq-fluxo-sem-falha", "tecnica", "Execuções do fluxo sem falha", "antecedente", "maior", "percentual", 90, 99, 97, 0.4, "EV-T2-01: log de execuções", "Semanas 1–8", "Desenvolvedor de automação e IA"],
    ["sq-custo-venda", "economica", "Custo por venda recuperada", "resultado", "menor", "moeda", 180, 60, 85, 0.6, "EV-E1-01: custo de API + infra + revisão ÷ vendas recuperadas", "Semanas 1–8", "Product owner da Divisão Canais"],
    ["sq-tempo-equipe", "economica", "Tempo da equipe comercial por pedido acompanhado", "antecedente", "menor", "minutos", 25, 5, 8, 0.4, "EV-E2-01: apontamento de tempo", "Semanas 1–8", "Gestor comercial de Canais"],
    ["sq-recuperacao", "operacional", "Taxa de recuperação de pedidos abandonados", "resultado", "maior", "percentual", 6, 15, 12, 0.5, "EV-O1-01: pedidos abandonados × concluídos após follow-up", "Semanas 1–8", "Product owner da Divisão Canais"],
    ["sq-primeiro-contato", "operacional", "Tempo até o primeiro contato com o parceiro", "antecedente", "menor", "horas", 48, 4, 5, 0.25, "EV-O2-01: abandono do pedido × envio do 1º e-mail no CRM", "Semanas 1–8", "Desenvolvedor de automação e IA"],
    ["sq-resposta", "operacional", "Taxa de resposta dos parceiros ao follow-up", "antecedente", "maior", "percentual", 18, 35, 29, 0.25, "EV-O3-01: respostas ÷ e-mails enviados", "Semanas 1–8", "Gestor comercial de Canais"],
    ["sq-rastreabilidade", "governanca", "Interações com rastreabilidade completa no CRM", "antecedente", "maior", "percentual", 40, 95, 93, 0.5, "EV-G1-01: conferência de negócios no CRM", "Semanas 1–8", "Product owner da Divisão Canais"],
    ["sq-escalonamento", "governanca", "Casos fora da política escalados corretamente para humano", "resultado", "maior", "percentual", 50, 90, 80, 0.5, "EV-G2-01: revisão de casos fora de alçada", "Semanas 1–8", "Gestor comercial de Canais"],
  ].map((r) => ind(r as Row)),
  barriers: [
    bar("sq-bar-lgpd", "LGPD no contato com parceiros", "Base legal definida, dados mínimos no prompt e opção de descadastro em todo e-mail.", "atendida", "Parecer do DPO e checklist de privacidade do fluxo (simulado).", "", false, "DPO/Jurídico"),
    bar("sq-bar-politica", "Conformidade com a Política de Canais", "Nenhuma oferta de preço, desconto ou condição fora da alçada definida na política.", "atendida", "Auditoria amostral EV-T1-01 sem ofertas fora de alçada (simulado).", "", false, "Gestor comercial de Canais"),
    bar("sq-bar-credenciais", "Segurança de credenciais e integrações", "Chaves de CRM, e-mail e LLM em cofre, com permissões mínimas e rotação definida.", "em_tratamento", "Chave de API do CRM com escopo amplo identificada na revisão (simulado).", "Migrar chaves para cofre, restringir escopo e definir rotação trimestral antes da escala.", true, "Desenvolvedor de automação e IA"),
    bar("sq-bar-supervisao", "Supervisão humana", "Envio automático só dentro de regras aprovadas; demais casos exigem revisão humana.", "atendida", "Fila de revisão no CRM e registro de escalonamentos EV-G2-01 (simulado).", "", false, "Product owner da Divisão Canais"),
  ],
  decisions: [],
  decisionDraft: null,
};

export const EXAMPLE_CASES = [CASO_A, CONECTAHIT, SQUAD];
