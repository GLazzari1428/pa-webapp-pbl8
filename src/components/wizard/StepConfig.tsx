"use client";

import { NumberField, SelectField, TextAreaField, TextField, InfoTip } from "@/components/form";
import { HELP } from "@/lib/help";
import { DIMENSIONS, DIMENSION_LABELS, DEFAULT_THRESHOLDS, type CaseConfig, type DataType } from "@/lib/engine/types";
import { fmt } from "@/lib/engine/engine";
import { UNIT_OPTIONS, unitSuffix } from "@/lib/engine/units";
import { Button } from "@/components/ui/button";
import type { StepProps } from "./Wizard";
import { IssueList, issueFor } from "./IssueList";

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "real", label: "Reais (medições de produção)" },
  { value: "referencia", label: "De referência (valores acordados, não medidos)" },
  { value: "simulado", label: "Simulados (demonstração)" },
];

export function StepConfig({ c, update, ev }: StepProps) {
  const cfg = c.config;
  const set = (patch: Partial<CaseConfig>) => update((x) => ({ ...x, config: { ...x.config, ...patch } }));
  const err = (f: string) => issueFor(ev.configIssues, "config", f);
  const sumW = DIMENSIONS.reduce((a, d) => a + (cfg.weights[d] || 0), 0);
  const hypInd = c.indicators.find((i) => i.id === cfg.hypothesis.indicatorId);

  return (
    <div className="space-y-8">
      <IssueList issues={ev.configIssues} />

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Identificação</legend>
        <TextField label="Nome do caso" required help={HELP.caseName} value={cfg.name} onChange={(v) => set({ name: v })} error={err("name")} />
        <SelectField label="Tipo de dados" help={HELP.dataType} value={cfg.dataType} onChange={(v) => set({ dataType: v })} options={DATA_TYPES} />
        <TextAreaField className="md:col-span-2" label="Contexto" help={HELP.context} value={cfg.context} onChange={(v) => set({ context: v })} rows={2} />
        <TextField label="Período do piloto" help={HELP.period} value={cfg.period} onChange={(v) => set({ period: v })} />
        <TextField label="Responsáveis" help={HELP.owners} value={cfg.owners} onChange={(v) => set({ owners: v })} />
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Hipótese de valor</legend>
        <TextAreaField
          className="md:col-span-2"
          label="Hipótese de valor (texto)"
          required
          help={HELP.hypothesisText}
          value={cfg.hypothesis.text}
          onChange={(v) => set({ hypothesis: { ...cfg.hypothesis, text: v } })}
          error={err("hypothesis.text")}
          placeholder="Ex.: Reduzir o tempo médio de atendimento de 12 para 8 minutos, sem piorar a qualidade."
          rows={2}
        />
        <SelectField
          label="Indicador que mede a hipótese"
          help={HELP.hypothesisIndicator}
          value={cfg.hypothesis.indicatorId ?? ""}
          placeholder={c.indicators.length ? "Selecione um indicador" : "Cadastre indicadores na etapa 2"}
          onChange={(v) => set({ hypothesis: { ...cfg.hypothesis, indicatorId: v || null } })}
          options={c.indicators.map((i) => ({ value: i.id, label: i.name || "(indicador sem nome)" }))}
        />
        <NumberField
          label="Meta mensurável da hipótese"
          help={HELP.hypothesisTarget}
          value={cfg.hypothesis.target}
          unit={hypInd?.unit}
          suffix={hypInd ? unitSuffix(hypInd) : undefined}
          example={hypInd ? UNIT_OPTIONS.find((u) => u.id === hypInd.unit)?.example : "Escolha o indicador primeiro."}
          onChange={(v) => set({ hypothesis: { ...cfg.hypothesis, target: v } })}
        />
        <p className="text-sm text-muted-foreground md:col-span-2">
          Se a meta da hipótese não for atingida no indicador escolhido, a recomendação nunca será Escalar, mesmo com S
          na faixa de Escalar. Situação atual: <strong>{ev.hypothesis.message}</strong>
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 flex items-center gap-1 text-lg font-semibold">
          Pesos das dimensões <InfoTip text={HELP.weights} label="Pesos das dimensões" />
        </legend>
        <div className="grid gap-4 md:grid-cols-4">
          {DIMENSIONS.map((d) => (
            <NumberField
              key={d}
              label={DIMENSION_LABELS[d]}
              value={cfg.weights[d]}
              example="Ex.: 0,25"
              onChange={(v) => set({ weights: { ...cfg.weights, [d]: v ?? 0 } })}
            />
          ))}
        </div>
        <p className="mt-2 text-sm" aria-live="polite">
          Soma dos pesos: <strong>{fmt(sumW, 2)}</strong> {Math.abs(sumW - 1) > 1e-6 ? "(precisa ser 1,00)." : "✓"}
        </p>
        {err("weights") && <p className="text-sm font-medium text-destructive">{err("weights")}</p>}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-lg font-semibold">Limiares e parâmetros de decisão</legend>
        <div className="grid gap-4 md:grid-cols-4">
          <NumberField label="Limiar inferior" help={HELP.lower} value={cfg.thresholds.lower} example="Padrão 0,40" error={err("thresholds.lower")} onChange={(v) => set({ thresholds: { ...cfg.thresholds, lower: v ?? NaN } })} />
          <NumberField label="Limiar de escala" help={HELP.scale} value={cfg.thresholds.scale} example="Padrão 0,70" error={err("thresholds.scale")} onChange={(v) => set({ thresholds: { ...cfg.thresholds, scale: v ?? NaN } })} />
          <NumberField label="Distância de fronteira" help={HELP.border} value={cfg.thresholds.border} example="Padrão 0,05" error={err("thresholds.border")} onChange={(v) => set({ thresholds: { ...cfg.thresholds, border: v ?? NaN } })} />
          <NumberField label="Variação dos pesos (sensibilidade)" help={HELP.variation} value={cfg.thresholds.variation} example="Padrão 0,20 = ±20%" error={err("thresholds.variation")} onChange={(v) => set({ thresholds: { ...cfg.thresholds, variation: v ?? NaN } })} />
        </div>
        <Button variant="link" className="mt-1 px-0" onClick={() => set({ thresholds: { ...DEFAULT_THRESHOLDS } })}>
          Restaurar valores padrão
        </Button>
        <p className="text-sm text-muted-foreground">
          Pesos e limiares são parâmetros declarados do instrumento, não valores extraídos da literatura. Fixe-os antes de
          conhecer os resultados.
        </p>
      </fieldset>
    </div>
  );
}
