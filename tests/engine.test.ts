import { describe, expect, it } from "vitest";
import {
  evaluateCase,
  normalizeIndicator,
  validateBarriers,
  effectiveBarrierStatus,
} from "../src/lib/engine/engine";
import { CASO_A, CONECTAHIT, SQUAD } from "../src/lib/data/examples";
import type { FrameworkCase, Indicator } from "../src/lib/engine/types";
import { parseNumberInput } from "../src/lib/engine/units";
import { isDecisionFrozen, reopenDecision, saveDecision, EMPTY_DRAFT } from "../src/lib/engine/decisions";

const TOL = 0.0005;
const clone = (c: FrameworkCase): FrameworkCase => structuredClone(c);

describe("Tabela 2 do artigo: os três casos", () => {
  it("Caso A: S = 0,656, faixa Pivotar, recomendação Pivotar, fronteira, instável", () => {
    const r = evaluateCase(CASO_A);
    expect(Math.abs(r.score - 0.656)).toBeLessThan(TOL);
    expect(r.outcome.band).toBe("Pivotar");
    expect(r.outcome.recommendation).toBe("Pivotar");
    expect(r.borderline).toBe(true);
    // Artigo: S variou de 0,5957 a 0,7139 e algumas combinações levam a Escalar.
    expect(r.sensitivity.combos).toHaveLength(81);
    expect(r.sensitivity.min).toBeCloseTo(0.5957, 4);
    expect(r.sensitivity.max).toBeCloseTo(0.7139, 4);
    expect(r.sensitivity.combos.some((c) => c.band === "Escalar")).toBe(true);
    expect(r.sensitivity.stable).toBe(false);
  });

  it("Caso A: notas dimensionais do artigo", () => {
    const r = evaluateCase(CASO_A);
    const s = Object.fromEntries(r.dimensions.map((d) => [d.dimension, d.score]));
    expect(s.tecnica).toBeCloseTo(0.9133, 4);
    expect(s.economica).toBeCloseTo(0.35, 4);
    expect(s.operacional).toBeCloseTo(0.938, 4);
    expect(s.governanca).toBeCloseTo(0.3, 4);
  });

  it("Conectahit: S = 0,615, Pivotar, estável entre 0,596 e 0,634", () => {
    const r = evaluateCase(CONECTAHIT);
    expect(Math.abs(r.score - 0.615)).toBeLessThan(TOL);
    expect(r.outcome.band).toBe("Pivotar");
    expect(r.outcome.recommendation).toBe("Pivotar");
    expect(r.sensitivity.min).toBeCloseTo(0.5957, 3);
    expect(r.sensitivity.max).toBeCloseTo(0.6335, 3);
    expect(r.sensitivity.stable).toBe(true);
  });

  it("Squad de Negociação: S = 0,785, faixa Escalar limitada a Pivotar pela barreira em tratamento", () => {
    const r = evaluateCase(SQUAD);
    expect(Math.abs(r.score - 0.785)).toBeLessThan(TOL);
    expect(r.outcome.band).toBe("Escalar");
    expect(r.outcome.recommendation).toBe("Pivotar");
    expect(r.outcome.binding.some((c) => c.kind === "barreira_tratamento")).toBe(true);
    expect(r.explanation).toMatch(/Faixa Escalar .* limitada a Pivotar/);
    expect(r.explanation).toContain("Segurança de credenciais");
    expect(r.sensitivity.min).toBeCloseTo(0.7761, 4);
    expect(r.sensitivity.max).toBeCloseTo(0.7937, 4);
  });
});

describe("Normalização", () => {
  const base: Indicator = {
    id: "x", dimension: "tecnica", name: "x", kpiType: "resultado", direction: "menor", unit: "percentual",
    baseline: 25, target: 10, observed: 11, weight: 1, evidenceSource: "s", evidencePeriod: "p", evidenceOwner: "o",
  };
  it("menor é melhor: (25-11)/(25-10)", () => expect(normalizeIndicator(base)).toBeCloseTo(0.9333, 4));
  it("trunca em [0,1]", () => {
    expect(normalizeIndicator({ ...base, observed: 30 })).toBe(0);
    expect(normalizeIndicator({ ...base, observed: 5 })).toBe(1);
  });
  it("binário quando base = meta", () => {
    expect(normalizeIndicator({ ...base, baseline: 1, target: 1, binaryMet: true })).toBe(1);
    expect(normalizeIndicator({ ...base, baseline: 1, target: 1, binaryMet: false })).toBe(0);
  });
  it("evidência ausente exclui o indicador e renormaliza (não vira zero)", () => {
    const c = clone(CASO_A);
    c.indicators.find((i) => i.id === "casoa-atendimentos-refeitos")!.observed = null;
    const r = evaluateCase(c);
    const tec = r.dimensions.find((d) => d.dimension === "tecnica")!;
    expect(tec.coverage).toBeCloseTo(0.6, 6);
    expect(tec.score).toBeCloseTo(0.9, 6); // só "respostas corretas", peso renormalizado para 1
  });
});

describe("Correção 1: hipótese de valor trava Escalar", () => {
  it("S na faixa Escalar com meta da hipótese não atingida → Pivotar", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.status = "atendida";
    const r = evaluateCase(c);
    expect(r.outcome.band).toBe("Escalar");
    expect(r.hypothesis.status).toBe("nao_atingida"); // 12% observado < 15% da hipótese
    expect(r.outcome.recommendation).toBe("Pivotar");
    expect(r.outcome.binding.some((x) => x.kind === "hipotese")).toBe(true);
  });
  it("com a meta atingida e tudo atendido, Escalar é liberado", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.status = "atendida";
    c.indicators.find((i) => i.id === "sq-recuperacao")!.observed = 15;
    const r = evaluateCase(c);
    expect(r.hypothesis.status).toBe("atingida");
    expect(r.outcome.recommendation).toBe("Escalar");
  });
  it("hipótese sem indicador vinculado também impede Escalar", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.status = "atendida";
    c.indicators.find((i) => i.id === "sq-recuperacao")!.observed = 15;
    c.config.hypothesis.indicatorId = null;
    expect(evaluateCase(c).outcome.recommendation).toBe("Pivotar");
  });
});

describe("Correção 2: barreira Atendida exige evidência", () => {
  it("Atendida sem evidência gera erro de validação e é tratada como Não avaliada (Descontinuar)", () => {
    const c = clone(CASO_A);
    c.barriers[0].evidence = "   ";
    expect(validateBarriers(c.barriers).some((i) => i.field === "evidence")).toBe(true);
    expect(effectiveBarrierStatus(c.barriers[0])).toBe("nao_avaliada");
    const r = evaluateCase(c);
    expect(r.outcome.recommendation).toBe("Descontinuar");
    expect(r.explanation).toContain("sem evidência");
  });
  it("Violada impõe Descontinuar mesmo com S alto", () => {
    const c = clone(SQUAD);
    c.barriers[0].status = "violada";
    expect(evaluateCase(c).outcome.recommendation).toBe("Descontinuar");
  });
  it("Em tratamento sem plano aprovado deixa a recomendação pendente", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.planApproved = false;
    const r = evaluateCase(c);
    expect(r.outcome.recommendation).toBeNull();
    expect(r.outcome.pending).toMatch(/plano aprovado/);
  });
});

describe("Correção 3: tipo de KPI influencia a recomendação", () => {
  it("só indicadores antecedentes não sustentam Escalar, sem alterar S", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.status = "atendida";
    c.indicators.find((i) => i.id === "sq-recuperacao")!.observed = 15;
    const before = evaluateCase(c);
    for (const i of c.indicators) i.kpiType = "antecedente";
    const after = evaluateCase(c);
    expect(after.score).toBeCloseTo(before.score, 10);
    expect(after.outcome.band).toBe("Escalar");
    expect(after.outcome.recommendation).toBe("Pivotar");
    expect(after.outcome.binding.some((x) => x.kind === "kpi_resultado")).toBe(true);
  });
  it("resultado abaixo do limiar de escala limita a Pivotar mesmo com antecedentes altos", () => {
    const c = clone(SQUAD);
    c.barriers.find((b) => b.id === "sq-bar-credenciais")!.status = "atendida";
    c.indicators.find((i) => i.id === "sq-recuperacao")!.observed = 15;
    // derruba os indicadores de resultado e eleva os antecedentes
    for (const i of c.indicators) {
      if (i.kpiType === "resultado" && i.id !== "sq-recuperacao") i.observed = i.baseline;
      if (i.kpiType === "antecedente") i.observed = i.target;
    }
    const r = evaluateCase(c);
    expect(r.outcomeScore!).toBeLessThan(0.7);
  });
});

describe("Correção 5: identificador estável", () => {
  it("reordenar indicadores e barreiras não muda nada", () => {
    const c = clone(SQUAD);
    c.indicators.reverse();
    c.barriers.reverse();
    const a = evaluateCase(SQUAD);
    const b = evaluateCase(c);
    expect(b.score).toBeCloseTo(a.score, 12);
    expect(b.outcome.recommendation).toBe(a.outcome.recommendation);
    expect(b.hypothesis.status).toBe(a.hypothesis.status);
    for (const ir of a.indicators) expect(b.indicators.find((x) => x.id === ir.id)!.score).toBe(ir.score);
  });
});

describe("Correção 4: decisão congelada e versionada", () => {
  it("salvar congela; reabrir cria nova versão sem alterar a anterior", () => {
    const snap = { score: 0.656, band: "Pivotar" as const, recommendation: "Pivotar" as const, pending: null };
    const draft = { ...EMPTY_DRAFT, decision: "Pivotar" as const, justification: "j", actionPlan: "p", owner: "o", decisionDate: "2026-01-31" };
    const c1 = saveDecision(clone(CASO_A), draft, snap, new Date("2026-01-31T10:00:00Z"), "d1");
    expect(isDecisionFrozen(c1)).toBe(true);
    expect(Object.isFrozen(c1.decisions[0])).toBe(true);
    const c2 = reopenDecision(c1, new Date("2026-02-01T10:00:00Z"));
    expect(isDecisionFrozen(c2)).toBe(false);
    expect(() => saveDecision(c2, { ...c2.decisionDraft!, decisionDate: "2026-02-01" }, snap, new Date(), "d2")).toThrow(/reaberta/);
    const c3 = saveDecision(c2, { ...c2.decisionDraft!, decision: "Escalar", decisionDate: "2026-02-01", reopenReason: "novos dados" }, snap, new Date("2026-02-01T11:00:00Z"), "d2");
    expect(c3.decisions).toHaveLength(2);
    expect(c3.decisions[0].decision).toBe("Pivotar");
    expect(c3.decisions[0].savedAt).toBe("2026-01-31T10:00:00.000Z");
    expect(c3.decisions[1].version).toBe(2);
    expect(c3.decisions[1].decision).toBe("Escalar");
  });
});

describe("Entrada de percentuais", () => {
  it("15% e 15 significam o mesmo valor", () => {
    expect(parseNumberInput("15%", "percentual").value).toBe(15);
    expect(parseNumberInput("15", "percentual").value).toBe(15);
    expect(parseNumberInput("15,5 %", "percentual").value).toBe(15.5);
  });
  it("avisa quando parece fração", () => {
    expect(parseNumberInput("0,15", "percentual").hint).toMatch(/15/);
  });
  it("rejeita % fora da unidade percentual e texto inválido", () => {
    expect(parseNumberInput("15%", "dias").error).not.toBeNull();
    expect(parseNumberInput("abc", "dias").error).not.toBeNull();
    expect(parseNumberInput("R$ 3,30", "moeda").value).toBe(3.3);
  });
});
