/** Rótulo de pendência mostrado sob cada etapa do assistente. */
export type StepKey = "config" | "indicators" | "barriers" | "result" | "decision";

export function stepPendingLabel(step: StepKey, count: number): string | null {
  if (count <= 0 || step === "result") return null;
  if (step === "decision") return "Falta registrar a decisão";
  return `${count} pendência(s)`;
}
