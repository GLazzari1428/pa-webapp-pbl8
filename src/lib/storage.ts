/** Persistência 100% no navegador (localStorage). Sem backend. */
import { DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS, type Barrier, type FrameworkCase, type Indicator } from "./engine/types";

const CASES_KEY = "pbl8.framework.cases.v1";
const ONBOARDING_KEY = "pbl8.framework.onboardingSeen.v1";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadCases(): FrameworkCase[] {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCase) : [];
  } catch {
    return [];
  }
}

export function saveCases(cases: FrameworkCase[]): void {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export function isCase(x: unknown): x is FrameworkCase {
  if (!x || typeof x !== "object") return false;
  const c = x as FrameworkCase;
  return (
    typeof c.id === "string" &&
    typeof c.config === "object" &&
    c.config !== null &&
    Array.isArray(c.indicators) &&
    Array.isArray(c.barriers) &&
    Array.isArray(c.decisions)
  );
}

export function newIndicator(dimension: Indicator["dimension"] = "tecnica"): Indicator {
  return {
    id: uid(),
    dimension,
    name: "",
    kpiType: "resultado",
    direction: "maior",
    unit: "percentual",
    baseline: null,
    target: null,
    observed: null,
    weight: null,
    evidenceSource: "",
    evidencePeriod: "",
    evidenceOwner: "",
    binaryCriterion: "",
    binaryMet: null,
  };
}

export function newBarrier(name = "", criterion = ""): Barrier {
  return { id: uid(), name, criterion, status: "nao_avaliada", evidence: "", plan: "", planApproved: false, owner: "" };
}

export function newCase(): FrameworkCase {
  const now = new Date().toISOString();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    config: {
      name: "",
      context: "",
      dataType: "real",
      period: "",
      owners: "",
      hypothesis: { text: "", indicatorId: null, target: null },
      weights: { ...DEFAULT_WEIGHTS },
      thresholds: { ...DEFAULT_THRESHOLDS },
      correctableLoss: null,
      correctableDimension: null,
      correctableRationale: "",
    },
    indicators: [],
    barriers: [
      newBarrier("Confiabilidade essencial", ""),
      newBarrier("Segurança e acesso", ""),
      newBarrier("Privacidade", ""),
      newBarrier("Conformidade legal e ética", ""),
    ],
    decisions: [],
    decisionDraft: null,
  };
}

/** Cópia de um caso com novos ids de caso (os ids de indicadores/barreiras são preservados). */
export function duplicateCase(c: FrameworkCase, suffix = ""): FrameworkCase {
  const now = new Date().toISOString();
  const copy: FrameworkCase = structuredClone(c);
  return { ...copy, id: uid(), createdAt: now, updatedAt: now, config: { ...copy.config, name: copy.config.name + suffix } };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugify(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "caso"
  );
}
