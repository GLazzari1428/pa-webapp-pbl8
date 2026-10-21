/**
 * Registro versionado da decisão humana. Registros salvos são imutáveis:
 * reabrir cria um rascunho, e salvar o rascunho acrescenta uma nova versão.
 */
import type { DecisionDraft, DecisionRecord, DecisionSnapshot, FrameworkCase } from "./types";

export const EMPTY_DRAFT: DecisionDraft = {
  decision: "",
  justification: "",
  actionPlan: "",
  owner: "",
  decisionDate: "",
  reviewDate: "",
  reviewCriterion: "",
  evidenceConsidered: "",
  reopenReason: "",
};

export interface DraftIssue {
  field: keyof DecisionDraft;
  message: string;
}

/** Campos obrigatórios da folha de decisão (M5). */
export function validateDraft(draft: DecisionDraft, isReopen: boolean): DraftIssue[] {
  const issues: DraftIssue[] = [];
  if (!draft.decision) issues.push({ field: "decision", message: "Escolha a decisão (Escalar, Pivotar ou Descontinuar)." });
  if (!draft.justification.trim()) issues.push({ field: "justification", message: "Escreva a justificativa, mesmo quando concordar com a recomendação." });
  if (!draft.actionPlan.trim()) issues.push({ field: "actionPlan", message: "Descreva o plano de ação." });
  if (!draft.owner.trim()) issues.push({ field: "owner", message: "Informe o responsável pela decisão." });
  if (!draft.decisionDate) issues.push({ field: "decisionDate", message: "Informe a data da decisão." });
  if (isReopen && !draft.reopenReason.trim()) issues.push({ field: "reopenReason", message: "Explique por que a decisão foi reaberta." });
  return issues;
}

/** Acrescenta uma nova versão congelada. Nunca altera registros anteriores. */
export function saveDecision(
  c: FrameworkCase,
  draft: DecisionDraft,
  snapshot: DecisionSnapshot,
  now: Date,
  newId: string,
): FrameworkCase {
  const issues = validateDraft(draft, c.decisions.length > 0);
  if (issues.length > 0) throw new Error(issues.map((i) => i.message).join(" "));
  const record: DecisionRecord = Object.freeze({
    id: newId,
    version: c.decisions.length + 1,
    savedAt: now.toISOString(),
    decision: draft.decision as DecisionRecord["decision"],
    justification: draft.justification.trim(),
    actionPlan: draft.actionPlan.trim(),
    owner: draft.owner.trim(),
    decisionDate: draft.decisionDate,
    reviewDate: draft.reviewDate,
    reviewCriterion: draft.reviewCriterion.trim(),
    evidenceConsidered: draft.evidenceConsidered.trim(),
    reopenReason: draft.reopenReason.trim(),
    snapshot: { ...snapshot },
  });
  return { ...c, decisions: [...c.decisions, record], decisionDraft: null, updatedAt: now.toISOString() };
}

/** Abre um rascunho pré-preenchido com a última versão; a versão anterior continua intacta. */
export function reopenDecision(c: FrameworkCase, now: Date): FrameworkCase {
  const last = c.decisions[c.decisions.length - 1];
  if (!last) return c;
  return {
    ...c,
    updatedAt: now.toISOString(),
    decisionDraft: {
      decision: last.decision,
      justification: last.justification,
      actionPlan: last.actionPlan,
      owner: last.owner,
      decisionDate: "",
      reviewDate: last.reviewDate,
      reviewCriterion: last.reviewCriterion,
      evidenceConsidered: last.evidenceConsidered,
      reopenReason: "",
    },
  };
}

export function latestDecision(c: FrameworkCase): DecisionRecord | null {
  return c.decisions[c.decisions.length - 1] ?? null;
}

/** A decisão está congelada quando há registro salvo e nenhum rascunho aberto. */
export function isDecisionFrozen(c: FrameworkCase): boolean {
  return c.decisions.length > 0 && c.decisionDraft === null;
}
