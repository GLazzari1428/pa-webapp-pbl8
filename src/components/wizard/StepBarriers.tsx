"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField, Field } from "@/components/form";
import { HELP } from "@/lib/help";
import { BARRIER_STATUS_LABELS, type Barrier, type BarrierStatus } from "@/lib/engine/types";
import { newBarrier } from "@/lib/storage";
import type { StepProps } from "./Wizard";
import { IssueList, issueFor } from "./IssueList";

const STATUS: BarrierStatus[] = ["atendida", "em_tratamento", "violada", "nao_avaliada"];

export function StepBarriers({ c, update, ev }: StepProps) {
  const setBar = (id: string, patch: Partial<Barrier>) =>
    update((x) => ({ ...x, barriers: x.barriers.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <strong>Violada</strong> ou <strong>Não avaliada</strong> impõem Descontinuar, qualquer que seja a pontuação geral.{" "}
        <strong>Em tratamento</strong> com plano aprovado limita a saída a Pivotar. <strong>Atendida</strong> exige
        evidência registrada; sem ela, a barreira é tratada como Não avaliada.
      </p>
      <IssueList issues={ev.barrierIssues} />
      <ol className="space-y-6">
        {c.barriers.map((b, idx) => {
          const e = (f: string) => issueFor(ev.barrierIssues, b.id, f);
          const headingId = `bar-${b.id}-title`;
          return (
            <li key={b.id}>
              <fieldset aria-labelledby={headingId} className="rounded-md bg-card p-4 shadow-border">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 id={headingId} className="font-semibold">
                    Barreira {idx + 1}: {b.name || "sem nome"}
                  </h2>
                  <Button size="icon-sm" variant="destructive" aria-label={`Remover barreira "${b.name || "sem nome"}"`} onClick={() => update((x) => ({ ...x, barriers: x.barriers.filter((y) => y.id !== b.id) }))}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <TextField label="Barreira" required help={HELP.barrierName} value={b.name} error={e("name")} onChange={(v) => setBar(b.id, { name: v })} />
                  <TextField className="md:col-span-2" label="Critério declarado" help={HELP.barrierCriterion} value={b.criterion} onChange={(v) => setBar(b.id, { criterion: v })} />
                  <SelectField label="Estado" required help={HELP.barrierStatus} value={b.status} onChange={(v) => setBar(b.id, { status: v })} options={STATUS.map((s) => ({ value: s, label: BARRIER_STATUS_LABELS[s] }))} />
                  <TextField label="Responsável pela verificação" help={HELP.barrierOwner} value={b.owner} onChange={(v) => setBar(b.id, { owner: v })} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Evidência"
                    required={b.status === "atendida"}
                    help={HELP.barrierEvidence}
                    value={b.evidence}
                    error={e("evidence")}
                    onChange={(v) => setBar(b.id, { evidence: v })}
                    rows={2}
                  />
                  {b.status === "em_tratamento" && (
                    <div className="space-y-3">
                      <TextAreaField label="Plano de tratamento" required help={HELP.barrierPlan} value={b.plan} error={e("plan")} onChange={(v) => setBar(b.id, { plan: v })} rows={2} />
                      <Field label="Plano aprovado" help={HELP.barrierPlanApproved} error={e("planApproved")}>
                        {(p) => (
                          <div className="flex items-center gap-2">
                            <input {...p} type="checkbox" className="size-4 accent-primary" checked={b.planApproved} onChange={(ev2) => setBar(b.id, { planApproved: ev2.target.checked })} />
                            <span className="text-sm">O plano foi aprovado pelos responsáveis</span>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
      <Button onClick={() => update((x) => ({ ...x, barriers: [...x.barriers, newBarrier()] }))}>
        <Plus aria-hidden="true" /> Adicionar barreira
      </Button>
    </div>
  );
}
