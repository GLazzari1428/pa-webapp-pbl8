/**
 * Motor de cálculo único do framework de decisão pós-MVP.
 *
 * Módulo TypeScript puro (sem React, sem DOM, sem armazenamento): recebe um
 * caso e devolve todas as notas, a recomendação e a análise de sensibilidade.
 * Todos os casos (Caso A, Conectahit, Squad de Negociação e casos novos) usam
 * exatamente estas funções. As regras seguem a Seção "Projeto do artefato" do
 * artigo (pbl6/artigo/main.tex), com as correções documentadas em MELHORIAS.md.
 */
import {
  BARRIER_STATUS_LABELS,
  DIMENSIONS,
  DIMENSION_LABELS,
  type Barrier,
  type CaseConfig,
  type DimensionId,
  type FrameworkCase,
  type Indicator,
  type Recommendation,
  type Thresholds,
  MAX_INDICATORS,
} from "./types";

const EPS = 1e-9;

export interface Issue {
  /** Identificador estável da entidade afetada (indicador/barreira) ou nome do campo. */
  targetId: string;
  field: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Validação                                                          */
/* ------------------------------------------------------------------ */

export function validateConfig(config: CaseConfig): Issue[] {
  const issues: Issue[] = [];
  const add = (field: string, message: string) => issues.push({ targetId: "config", field, message });

  if (!config.name.trim()) add("name", "Informe o nome do caso.");
  if (!config.hypothesis.text.trim()) add("hypothesis.text", "Descreva a hipótese de valor em uma frase com número.");

  const ws = DIMENSIONS.map((d) => config.weights[d]);
  if (ws.some((w) => !Number.isFinite(w) || w < 0)) add("weights", "Os pesos das dimensões devem ser números maiores ou iguais a zero.");
  const sum = ws.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  if (Math.abs(sum - 1) > 1e-6) add("weights", `Os pesos das dimensões devem somar 1 (soma atual: ${fmt(sum, 2)}).`);

  const t = config.thresholds;
  if (![t.lower, t.scale, t.border, t.variation].every(Number.isFinite)) add("thresholds", "Preencha todos os limiares.");
  else {
    if (t.lower < 0) add("thresholds.lower", "O limiar inferior não pode ser negativo.");
    if (!(t.scale > t.lower)) add("thresholds.scale", "O limiar de escala deve ser maior que o limiar inferior.");
    if (t.scale > 1) add("thresholds.scale", "O limiar de escala não pode passar de 1.");
    if (t.border < 0) add("thresholds.border", "A distância de fronteira não pode ser negativa.");
    if (t.variation < 0 || t.variation >= 1) add("thresholds.variation", "A variação dos pesos deve estar entre 0 e 1 (ex.: 0,20 = 20%).");
  }
  return issues;
}

/** Itens de rastreabilidade que faltam para a evidência de um indicador ser válida. */
export function missingEvidence(ind: Indicator): string[] {
  const missing: string[] = [];
  if (ind.observed === null || !Number.isFinite(ind.observed)) missing.push("valor observado");
  if (!ind.evidenceSource.trim()) missing.push("origem da evidência");
  if (!ind.evidencePeriod.trim()) missing.push("período");
  if (!ind.evidenceOwner.trim()) missing.push("responsável pela medição");
  return missing;
}

export function isBinary(ind: Indicator): boolean {
  return ind.baseline !== null && ind.target !== null && Math.abs(ind.baseline - ind.target) < EPS;
}

export function validateIndicators(indicators: Indicator[]): Issue[] {
  const issues: Issue[] = [];
  if (indicators.length > MAX_INDICATORS)
    issues.push({ targetId: "indicators", field: "indicators", message: `No máximo ${MAX_INDICATORS} indicadores.` });

  const seen = new Set<string>();
  for (const ind of indicators) {
    const add = (field: string, message: string) => issues.push({ targetId: ind.id, field, message });
    if (seen.has(ind.id)) add("id", "Identificador duplicado.");
    seen.add(ind.id);
    const label = ind.name.trim() || "Indicador sem nome";
    if (!ind.name.trim()) add("name", "Dê um nome ao indicador.");
    if (ind.unit === "outra" && !ind.customUnit?.trim()) add("customUnit", `${label}: descreva a unidade.`);
    if (ind.baseline === null) add("baseline", `${label}: informe a linha de base.`);
    if (ind.target === null) add("target", `${label}: informe a meta.`);
    if (ind.weight === null || ind.weight < 0) add("weight", `${label}: informe o peso na dimensão (zero ou mais).`);
    if (ind.baseline !== null && ind.target !== null) {
      if (ind.direction === "maior" && ind.target < ind.baseline - EPS)
        add("target", `${label}: com "melhor quando maior", a meta deve ser maior ou igual à linha de base.`);
      if (ind.direction === "menor" && ind.target > ind.baseline + EPS)
        add("target", `${label}: com "melhor quando menor", a meta deve ser menor ou igual à linha de base.`);
      if (isBinary(ind)) {
        if (!ind.binaryCriterion?.trim()) add("binaryCriterion", `${label}: linha de base igual à meta; declare o critério de atendimento.`);
        if (ind.binaryMet === null || ind.binaryMet === undefined)
          add("binaryMet", `${label}: indique se o critério binário foi atendido.`);
      }
    }
  }

  for (const d of DIMENSIONS) {
    const inDim = indicators.filter((i) => i.dimension === d);
    if (inDim.length === 0) continue;
    const sum = inDim.reduce((a, i) => a + (i.weight ?? 0), 0);
    if (Math.abs(sum - 1) > 1e-6)
      issues.push({
        targetId: `dim:${d}`,
        field: "weight",
        message: `${DIMENSION_LABELS[d]}: os pesos dos indicadores devem somar 1 (soma atual: ${fmt(sum, 2)}).`,
      });
  }
  return issues;
}

/**
 * Barreira "Atendida" sem evidência registrada é tratada como "Não avaliada"
 * (artigo: "sem verificação, é registrada como não avaliada").
 */
export function effectiveBarrierStatus(b: Barrier): Barrier["status"] {
  if (b.status === "atendida" && !b.evidence.trim()) return "nao_avaliada";
  return b.status;
}

export function validateBarriers(barriers: Barrier[]): Issue[] {
  const issues: Issue[] = [];
  for (const b of barriers) {
    const label = b.name.trim() || "Barreira sem nome";
    const add = (field: string, message: string) => issues.push({ targetId: b.id, field, message });
    if (!b.name.trim()) add("name", "Dê um nome à barreira.");
    if (b.status === "atendida" && !b.evidence.trim())
      add("evidence", `${label}: para marcar como Atendida, registre a evidência (documento, parecer ou relatório).`);
    if (b.status === "em_tratamento" && !b.plan.trim()) add("plan", `${label}: descreva o plano de tratamento.`);
    if (b.status === "em_tratamento" && !b.planApproved)
      add("planApproved", `${label}: o plano precisa estar aprovado para a barreira limitar a saída a Pivotar.`);
  }
  return issues;
}

/* ------------------------------------------------------------------ */
/* Normalização e agregação                                           */
/* ------------------------------------------------------------------ */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Nota normalizada n_i em [0,1] (artigo, "Normalização dos indicadores").
 * Retorna null quando não há dado suficiente.
 */
export function normalizeIndicator(ind: Indicator): number | null {
  const { baseline: b, target: g, observed: v } = ind;
  if (b === null || g === null || v === null) return null;
  if (Math.abs(b - g) < EPS) {
    if (ind.binaryMet === true) return 1;
    if (ind.binaryMet === false) return 0;
    return null;
  }
  if (ind.direction === "maior") return clamp01((v - b) / (g - b));
  return clamp01((b - v) / (b - g));
}

export interface IndicatorResult {
  id: string;
  dimension: DimensionId;
  kpiType: Indicator["kpiType"];
  available: boolean;
  missing: string[];
  score: number | null;
  originalWeight: number;
  renormalizedWeight: number | null;
  contribution: number | null;
}

export interface DimensionResult {
  dimension: DimensionId;
  weight: number;
  /** Soma dos pesos originais dos indicadores com evidência. */
  coverage: number;
  /** S_j, null quando a cobertura é zero. */
  score: number | null;
  contribution: number | null;
  /** S_j calculado só com indicadores de resultado (null se não houver). */
  outcomeScore: number | null;
  /** S_j calculado só com indicadores antecedentes (null se não houver). */
  leadingScore: number | null;
  indicatorCount: number;
}

function weightedMean(items: { w: number; n: number }[]): number | null {
  const total = items.reduce((a, x) => a + x.w, 0);
  if (total <= EPS) return null;
  return items.reduce((a, x) => a + x.w * x.n, 0) / total;
}

export function computeIndicators(indicators: Indicator[]): IndicatorResult[] {
  const base = indicators.map((ind) => {
    const missing = missingEvidence(ind);
    const score = normalizeIndicator(ind);
    const available = missing.length === 0 && score !== null;
    return { ind, missing, score, available };
  });
  return base.map(({ ind, missing, score, available }) => {
    const coverage = base
      .filter((x) => x.available && x.ind.dimension === ind.dimension)
      .reduce((a, x) => a + (x.ind.weight ?? 0), 0);
    const w = ind.weight ?? 0;
    const rw = available && coverage > EPS ? w / coverage : null;
    return {
      id: ind.id,
      dimension: ind.dimension,
      kpiType: ind.kpiType,
      available,
      missing,
      score,
      originalWeight: w,
      renormalizedWeight: rw,
      contribution: rw !== null && score !== null ? rw * score : null,
    };
  });
}

export function computeDimensions(
  indicatorResults: IndicatorResult[],
  weights: Record<DimensionId, number>,
): DimensionResult[] {
  return DIMENSIONS.map((d) => {
    const inDim = indicatorResults.filter((r) => r.dimension === d);
    const avail = inDim.filter((r) => r.available && r.score !== null);
    const coverage = avail.reduce((a, r) => a + r.originalWeight, 0);
    const score = coverage > EPS ? avail.reduce((a, r) => a + (r.contribution ?? 0), 0) : null;
    const pick = (t: Indicator["kpiType"]) =>
      weightedMean(avail.filter((r) => r.kpiType === t).map((r) => ({ w: r.originalWeight, n: r.score as number })));
    return {
      dimension: d,
      weight: weights[d],
      coverage,
      score,
      contribution: score !== null ? weights[d] * score : null,
      outcomeScore: pick("resultado"),
      leadingScore: pick("antecedente"),
      indicatorCount: inDim.length,
    };
  });
}

/**
 * S = Σ W_j S_j. Dimensão sem cobertura não contribui (soma parcial, sem
 * redistribuir pesos dimensionais), e a recomendação Escalar é impedida.
 */
export function aggregateScore(dims: DimensionResult[], weights: Record<DimensionId, number>): number {
  return dims.reduce((a, d) => a + (d.score !== null ? weights[d.dimension] * d.score : 0), 0);
}

/**
 * Pontuação considerando apenas indicadores de resultado, com os pesos
 * dimensionais renormalizados entre as dimensões que têm indicador de resultado.
 */
export function outcomeOnlyScore(dims: DimensionResult[], weights: Record<DimensionId, number>): number | null {
  return weightedMean(
    dims.filter((d) => d.outcomeScore !== null).map((d) => ({ w: weights[d.dimension], n: d.outcomeScore as number })),
  );
}

/* ------------------------------------------------------------------ */
/* Faixa, hipótese, barreiras e recomendação                          */
/* ------------------------------------------------------------------ */

/** Faixa por pontuação. null = aguardando julgamento de perda corrigível. */
export function scoreBand(
  score: number,
  t: Thresholds,
  correctableLoss: CaseConfig["correctableLoss"],
): Recommendation | null {
  if (score >= t.scale - EPS) return "Escalar";
  if (score >= t.lower - EPS) return "Pivotar";
  if (correctableLoss === "sim") return "Pivotar";
  if (correctableLoss === "nao") return "Descontinuar";
  return null;
}

export function isBorderline(score: number, t: Thresholds): boolean {
  return Math.min(Math.abs(score - t.lower), Math.abs(score - t.scale)) <= t.border + 1e-12;
}

export type HypothesisStatus = "atingida" | "nao_atingida" | "nao_verificavel" | "nao_vinculada";

export interface HypothesisCheck {
  status: HypothesisStatus;
  indicatorName: string | null;
  target: number | null;
  observed: number | null;
  message: string;
}

export function checkHypothesis(config: CaseConfig, indicators: Indicator[]): HypothesisCheck {
  const h = config.hypothesis;
  const ind = h.indicatorId ? indicators.find((i) => i.id === h.indicatorId) : undefined;
  if (!ind)
    return {
      status: "nao_vinculada",
      indicatorName: null,
      target: null,
      observed: null,
      message: "A hipótese de valor não está vinculada a um indicador mensurável.",
    };
  const target = h.target ?? ind.target;
  const observed = ind.observed;
  if (target === null || observed === null || missingEvidence(ind).length > 0)
    return {
      status: "nao_verificavel",
      indicatorName: ind.name,
      target,
      observed,
      message: `Não há evidência válida em "${ind.name}" para verificar a meta da hipótese de valor.`,
    };
  const met = ind.direction === "maior" ? observed >= target - EPS : observed <= target + EPS;
  return {
    status: met ? "atingida" : "nao_atingida",
    indicatorName: ind.name,
    target,
    observed,
    message: met
      ? `Meta da hipótese atingida em "${ind.name}" (observado ${fmtNum(observed)}; meta ${fmtNum(target)}).`
      : `Meta da hipótese não atingida em "${ind.name}" (observado ${fmtNum(observed)}; meta ${fmtNum(target)}).`,
  };
}

export type ConstraintKind =
  | "barreira_veto"
  | "barreira_tratamento"
  | "barreira_sem_plano"
  | "hipotese"
  | "cobertura_zero"
  | "kpi_resultado";

export interface Constraint {
  kind: ConstraintKind;
  /** veto = impõe Descontinuar; teto = limita a Pivotar; pendente = bloqueia a recomendação. */
  effect: "veto" | "teto" | "pendente";
  message: string;
  /** Rótulo curto usado na frase de rebaixamento ("pela barreira X"). */
  shortLabel: string;
}

export interface DecisionInputs {
  score: number;
  dims: DimensionResult[];
  weights: Record<DimensionId, number>;
  thresholds: Thresholds;
  correctableLoss: CaseConfig["correctableLoss"];
  barriers: Barrier[];
  hypothesis: HypothesisCheck;
  configValid: boolean;
  inputsValid: boolean;
}

export interface DecisionOutcome {
  band: Recommendation | null;
  recommendation: Recommendation | null;
  /** Motivo quando a recomendação não pode ser emitida. */
  pending: string | null;
  constraints: Constraint[];
  /** Restrições que efetivamente mudaram a saída em relação à faixa. */
  binding: Constraint[];
}

export function barrierConstraints(barriers: Barrier[]): Constraint[] {
  const out: Constraint[] = [];
  for (const b of barriers) {
    const eff = effectiveBarrierStatus(b);
    const name = b.name.trim() || "sem nome";
    if (eff === "violada" || eff === "nao_avaliada") {
      const why =
        b.status === "atendida"
          ? "marcada como Atendida sem evidência, tratada como Não avaliada"
          : BARRIER_STATUS_LABELS[eff];
      out.push({
        kind: "barreira_veto",
        effect: "veto",
        message: `Barreira "${name}" (${why}) impõe Descontinuar, qualquer que seja a pontuação geral.`,
        shortLabel: `barreira "${name}" (${why})`,
      });
    } else if (eff === "em_tratamento") {
      if (b.planApproved && b.plan.trim())
        out.push({
          kind: "barreira_tratamento",
          effect: "teto",
          message: `Barreira "${name}" em tratamento, com plano aprovado: saída limitada a Pivotar.`,
          shortLabel: `barreira "${name}" (em tratamento)`,
        });
      else
        out.push({
          kind: "barreira_sem_plano",
          effect: "pendente",
          message: `Barreira "${name}" em tratamento sem plano aprovado: aguardando plano aprovado.`,
          shortLabel: `barreira "${name}" (sem plano aprovado)`,
        });
    }
  }
  return out;
}

export function decide(input: DecisionInputs): DecisionOutcome {
  const { score, dims, weights, thresholds: t } = input;
  const band = scoreBand(score, t, input.correctableLoss);
  const constraints: Constraint[] = [...barrierConstraints(input.barriers)];

  for (const d of dims)
    if (d.score === null)
      constraints.push({
        kind: "cobertura_zero",
        effect: "teto",
        message: `${DIMENSION_LABELS[d.dimension]} sem nenhum indicador com evidência válida (cobertura zero): Escalar impedido.`,
        shortLabel: `cobertura zero em ${DIMENSION_LABELS[d.dimension]}`,
      });

  if (input.hypothesis.status !== "atingida")
    constraints.push({
      kind: "hipotese",
      effect: "teto",
      message: `${input.hypothesis.message} Escalar exige a meta da hipótese de valor atingida.`,
      shortLabel:
        input.hypothesis.status === "nao_atingida"
          ? "meta da hipótese de valor não atingida"
          : "hipótese de valor sem verificação",
    });

  const sR = outcomeOnlyScore(dims, weights);
  if (sR === null)
    constraints.push({
      kind: "kpi_resultado",
      effect: "teto",
      message:
        "Nenhum indicador de resultado com evidência válida. Indicadores antecedentes sinalizam tendência, mas não sustentam Escalar sozinhos.",
      shortLabel: "ausência de indicador de resultado",
    });
  else if (sR < t.scale - EPS)
    constraints.push({
      kind: "kpi_resultado",
      effect: "teto",
      message: `Considerando só os indicadores de resultado, a pontuação é ${fmt(sR)}, abaixo do limiar de escala (${fmt(t.scale, 2)}). Os antecedentes indicam tendência, mas o resultado ainda não sustenta Escalar.`,
      shortLabel: `indicadores de resultado abaixo do limiar (${fmt(sR)})`,
    });

  const result = (recommendation: Recommendation | null, pending: string | null, binding: Constraint[]) => ({
    band,
    recommendation,
    pending,
    constraints,
    binding,
  });

  if (!input.configValid) return result(null, "Revisar entradas da configuração.", []);
  const vetoes = constraints.filter((c) => c.effect === "veto");
  if (vetoes.length > 0) return result("Descontinuar", null, band === "Descontinuar" ? [] : vetoes);
  if (!input.inputsValid) return result(null, "Revisar entradas dos indicadores ou das barreiras.", []);
  const pend = constraints.filter((c) => c.effect === "pendente");
  if (pend.length > 0) return result(null, "Aguardando plano aprovado.", pend);
  if (band === null) return result(null, "Aguardando julgamento sobre perda corrigível (pontuação geral abaixo do limiar inferior).", []);
  if (band === "Escalar") {
    const caps = constraints.filter((c) => c.effect === "teto");
    if (caps.length > 0) return result("Pivotar", null, caps);
  }
  return result(band, null, []);
}

/* ------------------------------------------------------------------ */
/* Sensibilidade                                                      */
/* ------------------------------------------------------------------ */

export interface SensitivityCombo {
  factors: Record<DimensionId, number>;
  weights: Record<DimensionId, number>;
  score: number;
  band: Recommendation | null;
  recommendation: Recommendation | null;
  pending: string | null;
  bandChanged: boolean;
  outputChanged: boolean;
}

export interface SensitivityResult {
  combos: SensitivityCombo[];
  min: number;
  max: number;
  bandChanges: number;
  outputChanges: number;
  stable: boolean;
  /** Recomendações alcançadas nas combinações, com contagem. */
  distribution: Partial<Record<Recommendation | "Pendente", number>>;
  label: string;
}

export function sensitivity(
  base: Omit<DecisionInputs, "score" | "weights">,
  baseWeights: Record<DimensionId, number>,
  baseOutcome: DecisionOutcome,
): SensitivityResult {
  const v = base.thresholds.variation;
  const levels = [1 - v, 1, 1 + v];
  const combos: SensitivityCombo[] = [];
  for (const a of levels)
    for (const b of levels)
      for (const c of levels)
        for (const d of levels) {
          const factors = { tecnica: a, economica: b, operacional: c, governanca: d };
          const raw = DIMENSIONS.map((k) => baseWeights[k] * factors[k]);
          const total = raw.reduce((x, y) => x + y, 0);
          const weights = Object.fromEntries(
            DIMENSIONS.map((k, i) => [k, total > 0 ? raw[i] / total : 0]),
          ) as Record<DimensionId, number>;
          const score = aggregateScore(base.dims, weights);
          const out = decide({ ...base, score, weights });
          combos.push({
            factors,
            weights,
            score,
            band: out.band,
            recommendation: out.recommendation,
            pending: out.pending,
            bandChanged: out.band !== baseOutcome.band,
            outputChanged: out.recommendation !== baseOutcome.recommendation || out.pending !== baseOutcome.pending,
          });
        }
  const scores = combos.map((x) => x.score);
  const bandChanges = combos.filter((x) => x.bandChanged).length;
  const outputChanges = combos.filter((x) => x.outputChanged).length;
  const distribution: SensitivityResult["distribution"] = {};
  for (const x of combos) {
    const k = x.recommendation ?? "Pendente";
    distribution[k] = (distribution[k] ?? 0) + 1;
  }
  const stable = bandChanges === 0 && outputChanges === 0;
  let label = "Estável: nenhuma combinação muda a faixa ou a saída.";
  if (outputChanges > 0) label = `Instável: ${outputChanges} de ${combos.length} combinações mudam a recomendação final.`;
  else if (bandChanges > 0)
    label = `Instável na faixa: ${bandChanges} de ${combos.length} combinações mudam a faixa por pontuação, mas a recomendação final não muda.`;
  return { combos, min: Math.min(...scores), max: Math.max(...scores), bandChanges, outputChanges, stable, distribution, label };
}

/* ------------------------------------------------------------------ */
/* Avaliação completa de um caso                                      */
/* ------------------------------------------------------------------ */

export interface CaseEvaluation {
  configIssues: Issue[];
  indicatorIssues: Issue[];
  barrierIssues: Issue[];
  indicators: IndicatorResult[];
  dimensions: DimensionResult[];
  score: number;
  outcomeScore: number | null;
  borderline: boolean;
  hypothesis: HypothesisCheck;
  outcome: DecisionOutcome;
  explanation: string;
  sensitivity: SensitivityResult;
  /** Dimensões em que os antecedentes estão bem à frente do resultado (≥ 0,20). */
  leadingAhead: DimensionId[];
}

export function evaluateCase(c: Pick<FrameworkCase, "config" | "indicators" | "barriers">): CaseEvaluation {
  const configIssues = validateConfig(c.config);
  const indicatorIssues = validateIndicators(c.indicators);
  const barrierIssues = validateBarriers(c.barriers);
  const indicators = computeIndicators(c.indicators);
  const dimensions = computeDimensions(indicators, c.config.weights);
  const score = aggregateScore(dimensions, c.config.weights);
  const hypothesis = checkHypothesis(c.config, c.indicators);
  // Barreiras Atendidas sem evidência já viram veto (Não avaliada) no motor;
  // as demais pendências de barreira entram como restrição "pendente".
  const barrierBlocking = barrierIssues.filter((i) => i.field !== "evidence" && i.field !== "plan" && i.field !== "planApproved");
  const base = {
    dims: dimensions,
    thresholds: c.config.thresholds,
    correctableLoss: c.config.correctableLoss,
    barriers: c.barriers,
    hypothesis,
    configValid: configIssues.length === 0,
    inputsValid: indicatorIssues.length === 0 && barrierBlocking.length === 0 && c.indicators.length > 0,
  };
  const outcome = decide({ ...base, score, weights: c.config.weights });
  const sens = sensitivity(base, c.config.weights, outcome);
  const leadingAhead = dimensions
    .filter((d) => d.leadingScore !== null && d.outcomeScore !== null && d.leadingScore - d.outcomeScore >= 0.2)
    .map((d) => d.dimension);
  return {
    configIssues,
    indicatorIssues,
    barrierIssues,
    indicators,
    dimensions,
    score,
    outcomeScore: outcomeOnlyScore(dimensions, c.config.weights),
    borderline: isBorderline(score, c.config.thresholds),
    hypothesis,
    outcome,
    explanation: explain(score, outcome),
    sensitivity: sens,
    leadingAhead,
  };
}

/** Frase que explica quando a recomendação final difere da faixa por pontuação (M4). */
export function explain(score: number, o: DecisionOutcome): string {
  const s = fmt(score);
  if (o.pending) return `Recomendação não emitida: ${o.pending}`;
  if (o.band === null) return `Pontuação geral ${s}. Recomendação: ${o.recommendation}.`;
  if (o.recommendation === o.band) return `A pontuação geral ${s} está na faixa ${o.band}, e nenhuma barreira ou restrição alterou a saída. Recomendação: ${o.recommendation}.`;
  const by = o.binding.map((c) => c.shortLabel).join("; ");
  const verb = o.recommendation === "Descontinuar" ? "substituída por Descontinuar" : `limitada a ${o.recommendation}`;
  return `Faixa ${o.band} (pontuação geral ${s}) ${verb} por: ${by}.`;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                         */
/* ------------------------------------------------------------------ */

/** Número simples, até 2 casas, sem zeros à direita (ex.: 12 ou 8,2). */
export function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export function fmt(n: number | null | undefined, digits = 3): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "n/d";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
