"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberField, SelectField, TextField } from "@/components/form";
import { HELP } from "@/lib/help";
import { fmt, isBinary } from "@/lib/engine/engine";
import { DIMENSIONS, DIMENSION_LABELS, MAX_INDICATORS, type Indicator } from "@/lib/engine/types";
import { UNIT_OPTIONS, unitSuffix } from "@/lib/engine/units";
import { newIndicator } from "@/lib/storage";
import type { StepProps } from "./Wizard";
import { IssueList, issueFor } from "./IssueList";

export function StepIndicators({ c, update, ev }: StepProps) {
  const setInd = (id: string, patch: Partial<Indicator>) =>
    update((x) => ({ ...x, indicators: x.indicators.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const move = (id: string, delta: number) =>
    update((x) => {
      const arr = [...x.indicators];
      const k = arr.findIndex((i) => i.id === id);
      const j = k + delta;
      if (k < 0 || j < 0 || j >= arr.length) return x;
      [arr[k], arr[j]] = [arr[j], arr[k]];
      return { ...x, indicators: arr };
    });
  const remove = (id: string) =>
    update((x) => ({
      ...x,
      indicators: x.indicators.filter((i) => i.id !== id),
      config:
        x.config.hypothesis.indicatorId === id ? { ...x.config, hypothesis: { ...x.config.hypothesis, indicatorId: null } } : x.config,
    }));
  const add = () => update((x) => ({ ...x, indicators: [...x.indicators, newIndicator()] }));
  const full = c.indicators.length >= MAX_INDICATORS;

  return (
    <div className="space-y-6">
      <IssueList issues={c.indicators.length === 0 ? [{ message: "Cadastre ao menos um indicador." }, ...ev.indicatorIssues] : ev.indicatorIssues} />

      <div className="rounded-md bg-muted/40 p-3 shadow-border text-sm">
        <p className="font-medium">Soma dos pesos por dimensão (cada uma deve somar 1):</p>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          {DIMENSIONS.map((d) => {
            const list = c.indicators.filter((i) => i.dimension === d);
            const s = list.reduce((a, i) => a + (i.weight ?? 0), 0);
            return (
              <li key={d}>
                {DIMENSION_LABELS[d]}: {list.length} indicador(es), soma {fmt(s, 2)}{" "}
                {list.length > 0 && Math.abs(s - 1) > 1e-6 ? <strong className="text-destructive">(ajustar)</strong> : null}
                {list.length === 0 ? <span className="text-pivotar">(sem indicador: cobertura zero, impede Escalar)</span> : null}
              </li>
            );
          })}
        </ul>
      </div>

      <ol className="space-y-6">
        {c.indicators.map((ind, idx) => {
          const res = ev.indicators.find((r) => r.id === ind.id);
          const e = (f: string) => issueFor(ev.indicatorIssues, ind.id, f);
          const unitOpt = UNIT_OPTIONS.find((u) => u.id === ind.unit);
          const suffix = unitSuffix(ind);
          const headingId = `ind-${ind.id}-title`;
          return (
            <li key={ind.id}>
              <fieldset aria-labelledby={headingId} className="rounded-md bg-card p-4 shadow-border">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 id={headingId} className="font-semibold">
                    Indicador {idx + 1}: {ind.name || "sem nome"}
                  </h2>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="outline" aria-label={`Mover "${ind.name || "indicador"}" para cima`} onClick={() => move(ind.id, -1)} disabled={idx === 0}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button size="icon-sm" variant="outline" aria-label={`Mover "${ind.name || "indicador"}" para baixo`} onClick={() => move(ind.id, 1)} disabled={idx === c.indicators.length - 1}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" aria-label={`Remover "${ind.name || "indicador"}"`} onClick={() => remove(ind.id)}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <TextField className="md:col-span-3" label="Nome do indicador" required help={HELP.indName} value={ind.name} error={e("name")} onChange={(v) => setInd(ind.id, { name: v })} placeholder="Ex.: Atendimentos refeitos por erro da IA" />
                  <SelectField label="Dimensão" help={HELP.dimension} value={ind.dimension} onChange={(v) => setInd(ind.id, { dimension: v })} options={DIMENSIONS.map((d) => ({ value: d, label: DIMENSION_LABELS[d] }))} />
                  <SelectField
                    label="Direção"
                    help={HELP.direction}
                    value={ind.direction}
                    onChange={(v) => setInd(ind.id, { direction: v })}
                    options={[
                      { value: "maior", label: "Melhor quando maior" },
                      { value: "menor", label: "Melhor quando menor" },
                    ]}
                  />
                  <SelectField
                    label="Tipo de KPI"
                    help={HELP.kpiType}
                    value={ind.kpiType}
                    onChange={(v) => setInd(ind.id, { kpiType: v })}
                    options={[
                      { value: "resultado", label: "Resultado (efeito desejado)" },
                      { value: "antecedente", label: "Antecedente (sinal de tendência)" },
                    ]}
                  />
                  <SelectField label="Unidade" help={HELP.unit} value={ind.unit} onChange={(v) => setInd(ind.id, { unit: v })} options={UNIT_OPTIONS.map((u) => ({ value: u.id, label: u.label }))} />
                  {ind.unit === "outra" && (
                    <TextField label="Descreva a unidade" required value={ind.customUnit ?? ""} error={e("customUnit")} onChange={(v) => setInd(ind.id, { customUnit: v })} placeholder="Ex.: chamados/semana" />
                  )}
                  <NumberField label="Peso na dimensão" required help={HELP.weight} value={ind.weight} example="Ex.: 0,6 (os pesos da dimensão somam 1)" error={e("weight")} onChange={(v) => setInd(ind.id, { weight: v })} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <NumberField label="Linha de base" required help={HELP.baseline} value={ind.baseline} unit={ind.unit} suffix={suffix} example={unitOpt?.example} error={e("baseline")} onChange={(v) => setInd(ind.id, { baseline: v })} />
                  <NumberField label="Meta" required help={HELP.target} value={ind.target} unit={ind.unit} suffix={suffix} example={unitOpt?.example} error={e("target")} onChange={(v) => setInd(ind.id, { target: v })} />
                  <NumberField label="Valor observado" help={HELP.observed} value={ind.observed} unit={ind.unit} suffix={suffix} example={unitOpt?.example} onChange={(v) => setInd(ind.id, { observed: v })} />
                </div>

                {isBinary(ind) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <TextField className="md:col-span-2" label="Critério binário" required help={HELP.binary} value={ind.binaryCriterion ?? ""} error={e("binaryCriterion")} onChange={(v) => setInd(ind.id, { binaryCriterion: v })} />
                    <SelectField
                      label="Critério atendido?"
                      required
                      value={ind.binaryMet === true ? "sim" : ind.binaryMet === false ? "nao" : ""}
                      placeholder="Selecione"
                      error={e("binaryMet")}
                      onChange={(v) => setInd(ind.id, { binaryMet: v === "sim" ? true : v === "nao" ? false : null })}
                      options={[
                        { value: "sim", label: "Sim" },
                        { value: "nao", label: "Não" },
                      ]}
                    />
                  </div>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <TextField label="Origem da evidência" help={HELP.evidenceSource} value={ind.evidenceSource} onChange={(v) => setInd(ind.id, { evidenceSource: v })} placeholder="Ex.: sistema de chamados" />
                  <TextField label="Período" help={HELP.evidencePeriod} value={ind.evidencePeriod} onChange={(v) => setInd(ind.id, { evidencePeriod: v })} placeholder="Ex.: meses 1 a 3" />
                  <TextField label="Responsável pela medição" help={HELP.evidenceOwner} value={ind.evidenceOwner} onChange={(v) => setInd(ind.id, { evidenceOwner: v })} placeholder="Ex.: supervisor do atendimento" />
                </div>

                <p className="mt-3 text-sm" aria-live="polite">
                  {res?.available ? (
                    <>
                      Nota normalizada: <strong>{fmt(res.score)}</strong> · incluída no cálculo
                    </>
                  ) : (
                    <span className="text-pivotar">
                      Fora do cálculo (sem evidência válida). Falta: {res?.missing.length ? res.missing.join(", ") : "linha de base/meta válidas"}.
                    </span>
                  )}
                </p>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-3">
        <Button onClick={add} disabled={full}>
          <Plus aria-hidden="true" /> Adicionar indicador
        </Button>
        <span className="text-sm text-muted-foreground">
          {c.indicators.length} de {MAX_INDICATORS} indicadores
        </span>
      </div>
    </div>
  );
}
