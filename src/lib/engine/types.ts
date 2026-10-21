/**
 * Modelo conceitual do framework (artigo, Seção "Projeto e desenvolvimento"):
 * caso de uso, configuração da avaliação, indicador, evidência, barreira,
 * pontuação/recomendação e registro da decisão.
 *
 * Todos os vínculos entre entidades usam identificadores estáveis (`id`),
 * nunca a posição em uma lista.
 */

export const DIMENSIONS = ["tecnica", "economica", "operacional", "governanca"] as const;
export type DimensionId = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  tecnica: "Qualidade técnica",
  economica: "Eficiência econômica",
  operacional: "Valor operacional e adoção",
  governanca: "Prontidão, risco e governança",
};

export type Direction = "maior" | "menor";
export type KpiType = "antecedente" | "resultado";
export type UnitId = "percentual" | "moeda" | "minutos" | "horas" | "dias" | "pontos" | "unidade" | "outra";
export type DataType = "real" | "referencia" | "simulado";

export type Recommendation = "Escalar" | "Pivotar" | "Descontinuar";

export interface Indicator {
  /** Identificador estável (uuid ou slug). Nunca deriva da posição. */
  id: string;
  dimension: DimensionId;
  name: string;
  kpiType: KpiType;
  direction: Direction;
  unit: UnitId;
  /** Usado quando unit === "outra". */
  customUnit?: string;
  /** Valores na unidade exibida (15 significa 15% quando unit = percentual). */
  baseline: number | null;
  target: number | null;
  observed: number | null;
  /** Peso na dimensão (os pesos de uma dimensão somam 1). */
  weight: number | null;
  /** Rastreabilidade da evidência. */
  evidenceSource: string;
  evidencePeriod: string;
  evidenceOwner: string;
  /** Só usado quando linha de base = meta (indicador binário). */
  binaryCriterion?: string;
  binaryMet?: boolean | null;
}

export type BarrierStatus = "atendida" | "em_tratamento" | "violada" | "nao_avaliada";

export const BARRIER_STATUS_LABELS: Record<BarrierStatus, string> = {
  atendida: "Atendida",
  em_tratamento: "Em tratamento",
  violada: "Violada",
  nao_avaliada: "Não avaliada",
};

export interface Barrier {
  id: string;
  name: string;
  criterion: string;
  status: BarrierStatus;
  /** Obrigatória (texto não vazio) quando status = atendida. */
  evidence: string;
  /** Obrigatório quando status = em_tratamento. */
  plan: string;
  planApproved: boolean;
  owner: string;
}

export interface Thresholds {
  /** Limiar inferior (Pivotar a partir dele). Padrão 0,40. */
  lower: number;
  /** Limiar de escala. Padrão 0,70. */
  scale: number;
  /** Distância de fronteira. Padrão 0,05. */
  border: number;
  /** Variação dos pesos na sensibilidade. Padrão 0,20. */
  variation: number;
}

export interface ValueHypothesis {
  /** Frase com número, ex.: "Reduzir o tempo médio de 12 para 8 min". */
  text: string;
  /** Indicador que mede a hipótese (id estável). */
  indicatorId: string | null;
  /** Meta mensurável da hipótese, na unidade do indicador. */
  target: number | null;
}

export interface CaseConfig {
  name: string;
  context: string;
  dataType: DataType;
  period: string;
  owners: string;
  hypothesis: ValueHypothesis;
  weights: Record<DimensionId, number>;
  thresholds: Thresholds;
  /** Julgamento de perda concentrada em dimensão corrigível (só usado quando S < limiar inferior). */
  correctableLoss: "sim" | "nao" | null;
  correctableDimension: DimensionId | null;
  correctableRationale: string;
}

export interface DecisionSnapshot {
  score: number | null;
  band: Recommendation | null;
  recommendation: Recommendation | null;
  pending: string | null;
}

export interface DecisionRecord {
  id: string;
  version: number;
  /** ISO timestamp de quando o registro foi salvo (congelado). */
  savedAt: string;
  decision: Recommendation;
  justification: string;
  actionPlan: string;
  owner: string;
  decisionDate: string;
  reviewDate: string;
  reviewCriterion: string;
  evidenceConsidered: string;
  /** Motivo informado ao reabrir (versões > 1). */
  reopenReason: string;
  /** Recomendação calculada no momento do registro. */
  snapshot: DecisionSnapshot;
}

export interface DecisionDraft {
  decision: Recommendation | "";
  justification: string;
  actionPlan: string;
  owner: string;
  decisionDate: string;
  reviewDate: string;
  reviewCriterion: string;
  evidenceConsidered: string;
  reopenReason: string;
}

export interface FrameworkCase {
  id: string;
  createdAt: string;
  updatedAt: string;
  config: CaseConfig;
  indicators: Indicator[];
  barriers: Barrier[];
  /** Histórico append-only de decisões. Nunca é sobrescrito. */
  decisions: DecisionRecord[];
  /** Rascunho em edição (null quando a última decisão está congelada). */
  decisionDraft: DecisionDraft | null;
}

export const DEFAULT_THRESHOLDS: Thresholds = { lower: 0.4, scale: 0.7, border: 0.05, variation: 0.2 };
export const DEFAULT_WEIGHTS: Record<DimensionId, number> = {
  tecnica: 0.25,
  economica: 0.25,
  operacional: 0.25,
  governanca: 0.25,
};
export const MAX_INDICATORS = 12;
