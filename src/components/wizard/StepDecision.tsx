"use client";

import { useState } from "react";
import { Lock, Printer, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextAreaField, TextField } from "@/components/form";
import { Input } from "@/components/ui/input";
import { HELP } from "@/lib/help";
import { fmt } from "@/lib/engine/engine";
import { EMPTY_DRAFT, isDecisionFrozen, reopenDecision, saveDecision, validateDraft } from "@/lib/engine/decisions";
import type { DecisionDraft, DecisionRecord, Recommendation } from "@/lib/engine/types";
import { uid } from "@/lib/storage";
import type { StepProps } from "./Wizard";
import { RecBadge } from "./RecBadge";
import { IssueList } from "./IssueList";

const RECS: Recommendation[] = ["Escalar", "Pivotar", "Descontinuar"];

export function StepDecision({ c, update, ev }: StepProps) {
  const [showErrors, setShowErrors] = useState(false);
  const frozen = isDecisionFrozen(c);
  const isReopen = c.decisions.length > 0;
  const draft = c.decisionDraft ?? EMPTY_DRAFT;
  const issues = validateDraft(draft, isReopen);
  const err = (f: keyof DecisionDraft) => (showErrors ? (issues.find((i) => i.field === f)?.message ?? null) : null);
  const setDraft = (patch: Partial<DecisionDraft>) => update((x) => ({ ...x, decisionDraft: { ...(x.decisionDraft ?? EMPTY_DRAFT), ...patch } }));
  const rec = ev.outcome.recommendation;

  const save = () => {
    if (issues.length > 0) {
      setShowErrors(true);
      return;
    }
    const snapshot = { score: ev.score, band: ev.outcome.band, recommendation: rec, pending: ev.outcome.pending };
    update((x) => saveDecision(x, x.decisionDraft ?? EMPTY_DRAFT, snapshot, new Date(), uid()));
    setShowErrors(false);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-md bg-muted/40 p-4 shadow-border text-sm">
        Recomendação calculada agora: <RecBadge rec={rec} pending={ev.outcome.pending} /> (S = {fmt(ev.score)}). {ev.explanation}
      </div>

      {frozen ? (
        <FrozenDecision record={c.decisions[c.decisions.length - 1]} onReopen={() => update((x) => reopenDecision(x, new Date()))} />
      ) : (
        <section aria-labelledby="dec-form-title" className="space-y-4">
          <h2 id="dec-form-title" className="text-lg font-semibold">
            {isReopen ? `Nova versão da decisão (v${c.decisions.length + 1})` : "Registrar decisão"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Campos com <span className="text-destructive">*</span> são obrigatórios. Depois de salva, a decisão fica
            congelada; para mudar, use “Reabrir decisão”, que cria uma nova versão e mantém a anterior.
          </p>
          {showErrors && <IssueList issues={issues} title="Para salvar, preencha" />}
          <div className="grid gap-4 md:grid-cols-2">
            {isReopen && (
              <TextAreaField className="md:col-span-2" label="Motivo da reabertura" required help={HELP.reopenReason} value={draft.reopenReason} error={err("reopenReason")} onChange={(v) => setDraft({ reopenReason: v })} rows={2} />
            )}
            <SelectField
              label="Decisão"
              required
              help={HELP.decision}
              value={draft.decision}
              placeholder="Selecione"
              error={err("decision")}
              onChange={(v) => setDraft({ decision: v })}
              options={RECS.map((r) => ({ value: r, label: r }))}
            />
            <div className="flex items-end pb-1 text-sm" aria-live="polite">
              {draft.decision && rec && (draft.decision === rec ? <span>Concordância com a recomendação.</span> : <span className="font-medium text-pivotar">Divergência da recomendação ({rec}): justifique com as evidências consideradas.</span>)}
            </div>
            <TextAreaField className="md:col-span-2" label="Justificativa" required help={HELP.justification} value={draft.justification} error={err("justification")} onChange={(v) => setDraft({ justification: v })} />
            <TextAreaField className="md:col-span-2" label="Plano de ação" required help={HELP.actionPlan} value={draft.actionPlan} error={err("actionPlan")} onChange={(v) => setDraft({ actionPlan: v })} />
            <TextField label="Responsável pela decisão" required help={HELP.decisionOwner} value={draft.owner} error={err("owner")} onChange={(v) => setDraft({ owner: v })} />
            <Field2 label="Data da decisão" required value={draft.decisionDate} error={err("decisionDate")} onChange={(v) => setDraft({ decisionDate: v })} />
            <Field2 label="Revisão prevista" help={HELP.reviewDate} value={draft.reviewDate} onChange={(v) => setDraft({ reviewDate: v })} />
            <TextField label="Critério para revisão" value={draft.reviewCriterion} onChange={(v) => setDraft({ reviewCriterion: v })} placeholder="Ex.: nova avaliação com dados atualizados de custo" />
            <TextAreaField className="md:col-span-2" label="Evidências consideradas" value={draft.evidenceConsidered} onChange={(v) => setDraft({ evidenceConsidered: v })} rows={2} placeholder="Ex.: indicadores, pareceres das barreiras, cálculo e sensibilidade" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>
              <Save aria-hidden="true" /> Salvar e congelar decisão
            </Button>
            {isReopen && (
              <Button variant="outline" onClick={() => update((x) => ({ ...x, decisionDraft: null }))}>
                Cancelar reabertura
              </Button>
            )}
          </div>
        </section>
      )}

      {c.decisions.length > 0 && (
        <section aria-labelledby="hist-title">
          <h2 id="hist-title" className="mb-2 text-lg font-semibold">
            Histórico de versões
          </h2>
          <ol className="space-y-2">
            {[...c.decisions].reverse().map((d) => (
              <li key={d.id} className="rounded-md bg-card p-3 shadow-border text-sm">
                <p>
                  <strong>v{d.version}</strong> · salva em {new Date(d.savedAt).toLocaleString("pt-BR")} · decisão{" "}
                  <RecBadge rec={d.decision} /> · recomendação na época: {d.snapshot.recommendation ?? "pendente"} (S = {fmt(d.snapshot.score)})
                </p>
                {d.reopenReason && <p className="mt-1 text-muted-foreground">Motivo da reabertura: {d.reopenReason}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <Button variant="outline" onClick={() => window.print()}>
        <Printer aria-hidden="true" /> Exportar relatório em PDF (imprimir)
      </Button>
    </div>
  );
}

function Field2(props: { label: string; required?: boolean; help?: string; value: string; error?: string | null; onChange: (v: string) => void }) {
  const { onChange, value, ...rest } = props;
  return <Field {...rest}>{(p) => <Input {...p} type="date" value={value} onChange={(e) => onChange(e.target.value)} />}</Field>;
}

function FrozenDecision({ record, onReopen }: { record: DecisionRecord; onReopen: () => void }) {
  const rows: [string, string][] = [
    ["Decisão", record.decision],
    ["Justificativa", record.justification],
    ["Plano de ação", record.actionPlan],
    ["Responsável", record.owner],
    ["Data da decisão", record.decisionDate],
    ["Revisão prevista", record.reviewDate || "n/d"],
    ["Critério para revisão", record.reviewCriterion || "n/d"],
    ["Evidências consideradas", record.evidenceConsidered || "n/d"],
  ];
  return (
    <section aria-labelledby="frozen-title" className="rounded-md bg-card p-4 shadow-[0_0_0_1.5px_var(--foreground)]">
      <h2 id="frozen-title" className="flex items-center gap-2 text-lg font-semibold">
        <Lock className="size-4" aria-hidden="true" /> Decisão registrada (v{record.version}), somente leitura
      </h2>
      <p className="text-sm text-muted-foreground">Salva em {new Date(record.savedAt).toLocaleString("pt-BR")}. Este registro não pode ser alterado.</p>
      <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm md:grid-cols-[12rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-medium">{k}</dt>
            <dd className="whitespace-pre-wrap">{v}</dd>
          </div>
        ))}
      </dl>
      <Button variant="outline" className="mt-4" onClick={onReopen}>
        <RotateCcw aria-hidden="true" /> Reabrir decisão
      </Button>
      <p className="mt-1 text-xs text-muted-foreground">Reabrir cria uma nova versão com data e hora; esta versão continua no histórico.</p>
    </section>
  );
}
