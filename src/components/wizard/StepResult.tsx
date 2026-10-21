"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoTip, SelectField, TextAreaField } from "@/components/form";
import { HELP } from "@/lib/help";
import { fmt } from "@/lib/engine/engine";
import { DIMENSIONS, DIMENSION_LABELS, type CaseConfig } from "@/lib/engine/types";
import { formatValue } from "@/lib/engine/units";
import { downloadJson, slugify } from "@/lib/storage";
import type { StepProps } from "./Wizard";
import { RecBadge } from "./RecBadge";
import { ResultChart } from "./ResultChart";

const EFFECT_LABEL = { veto: "impõe Descontinuar", teto: "limita a Pivotar", pendente: "bloqueia a recomendação" };

export function StepResult({ c, update, ev }: StepProps) {
  const cfg = c.config;
  const t = cfg.thresholds;
  const o = ev.outcome;
  const setCfg = (patch: Partial<CaseConfig>) => update((x) => ({ ...x, config: { ...x.config, ...patch } }));
  const belowLower = ev.score < t.lower;
  const exportResults = () =>
    downloadJson(`${slugify(cfg.name)}-resultado.json`, {
      format: "pbl8-framework-result",
      generatedAt: new Date().toISOString(),
      case: c,
      result: {
        score: ev.score,
        band: o.band,
        recommendation: o.recommendation,
        pending: o.pending,
        explanation: ev.explanation,
        borderline: ev.borderline,
        hypothesis: ev.hypothesis,
        constraints: o.constraints,
        dimensions: ev.dimensions,
        indicators: ev.indicators,
        sensitivity: { ...ev.sensitivity },
      },
    });

  if (c.indicators.length === 0)
    return <p className="rounded-md bg-muted p-4 text-foreground shadow-border">Cadastre indicadores na etapa 2 para ver o resultado.</p>;

  return (
    <div className="space-y-8">
      {cfg.dataType !== "real" && (
        <p className="rounded-md bg-muted/50 p-3 shadow-border text-sm">
          Dados {cfg.dataType === "simulado" ? "simulados" : "de referência"}: o resultado demonstra o funcionamento do
          instrumento, não o desempenho real da iniciativa.
        </p>
      )}

      <section aria-labelledby="rec-title" className="grid gap-4 md:grid-cols-3">
        <h2 id="rec-title" className="sr-only">
          Recomendação
        </h2>
        <div className="rounded-md bg-card p-4 shadow-border">
          <p className="text-sm text-muted-foreground">Pontuação geral</p>
          <p className="text-3xl font-semibold tabular-nums">{fmt(ev.score)}</p>
          <p className="text-xs text-muted-foreground">
            Limiares: Pivotar a partir de {fmt(t.lower, 2)}. Escalar a partir de {fmt(t.scale, 2)}.
          </p>
          {ev.borderline && <p className="mt-1 text-sm font-medium text-pivotar">Zona de fronteira: a pontuação geral está a até {fmt(t.border, 2)} de um limiar.</p>}
        </div>
        <div className="rounded-md bg-card p-4 shadow-border">
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Faixa por pontuação <InfoTip text={HELP.band} label="Faixa por pontuação" />
          </p>
          <p className="mt-1">
            <RecBadge rec={o.band} pending={o.band ? null : "Aguardando julgamento"} large />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">O que a pontuação geral indicaria sozinha.</p>
        </div>
        <div className="rounded-md bg-card p-4 shadow-[0_0_0_1.5px_var(--foreground)]">
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Recomendação final <InfoTip text={HELP.recommendation} label="Recomendação final" />
          </p>
          <p className="mt-1">
            <RecBadge rec={o.recommendation} pending={o.pending} large />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Apoio à decisão; não é decisão automática.</p>
        </div>
      </section>

      <div role="status" aria-live="polite" className="rounded-md bg-muted/40 p-4 shadow-border">
        <p className="font-medium">{ev.explanation}</p>
        {o.constraints.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {o.constraints.map((k, i) => (
              <li key={i}>
                {k.message} <span className="text-muted-foreground">({EFFECT_LABEL[k.effect]}{o.binding.includes(k) ? ", aplicada" : ""})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {belowLower && (
        <fieldset className="grid gap-4 rounded-md p-4 shadow-[0_0_0_1px_var(--chart-pivot)] md:grid-cols-2">
          <legend className="px-1 font-semibold">Julgamento de perda corrigível</legend>
          <p className="text-sm md:col-span-2">
            A pontuação geral ficou abaixo do limiar inferior ({fmt(t.lower, 2)}). Se os decisores julgam que a perda está concentrada numa
            única dimensão que dá para corrigir, a faixa passa a Pivotar; caso contrário, Descontinuar.
          </p>
          <SelectField
            label="A perda está concentrada em uma dimensão corrigível?"
            required
            help={HELP.correctable}
            value={cfg.correctableLoss ?? ""}
            placeholder="Selecione"
            onChange={(v) => setCfg({ correctableLoss: (v || null) as CaseConfig["correctableLoss"] })}
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
          />
          {cfg.correctableLoss === "sim" && (
            <>
              <SelectField
                label="Dimensão corrigível"
                value={cfg.correctableDimension ?? ""}
                placeholder="Selecione"
                onChange={(v) => setCfg({ correctableDimension: v || null })}
                options={DIMENSIONS.map((d) => ({ value: d, label: DIMENSION_LABELS[d] }))}
              />
              <TextAreaField className="md:col-span-2" label="Fundamento do julgamento" value={cfg.correctableRationale} onChange={(v) => setCfg({ correctableRationale: v })} rows={2} />
            </>
          )}
        </fieldset>
      )}

      <section aria-labelledby="chart-title" className="space-y-3">
        <h2 id="chart-title" className="text-lg font-semibold">
          Pontuação por dimensão e sensibilidade
        </h2>
        <ResultChart ev={ev} t={t} />
      </section>

      <section aria-labelledby="sens-title" className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md bg-card p-4 shadow-border">
          <h2 id="sens-title" className="flex items-center gap-1 font-semibold">
            Resumo da sensibilidade <InfoTip text={HELP.sensitivity} label="Sensibilidade" />
          </h2>
          <p className="mt-2 text-sm">
            A pontuação geral varia de <strong>{fmt(ev.sensitivity.min)}</strong> a <strong>{fmt(ev.sensitivity.max)}</strong> nas{" "}
            {ev.sensitivity.combos.length} combinações.
          </p>
          <p className={`mt-1 text-sm font-medium ${ev.sensitivity.stable ? "text-escalar" : "text-pivotar"}`}>{ev.sensitivity.label}</p>
          <p className="mt-2 text-sm">
            Recomendação final nas combinações:{" "}
            {Object.entries(ev.sensitivity.distribution)
              .map(([k, n]) => `${k} (${n})`)
              .join(", ")}
            .
          </p>
          {!ev.sensitivity.stable && (
            <p className="mt-2 text-xs text-muted-foreground">
              A recomendação depende dos pesos adotados: revise as premissas, sem ajustar pesos retroativamente.
            </p>
          )}
        </div>
        <div className="rounded-md bg-card p-4 shadow-border">
          <h2 className="font-semibold">Hipótese de valor e tipo de KPI</h2>
          <p className="mt-2 text-sm">{ev.hypothesis.message}</p>
          <p className="mt-2 text-sm">
            Pontuação só com indicadores de <strong>resultado</strong>: {fmt(ev.outcomeScore)}{" "}
            <span className="text-muted-foreground">(Escalar exige que ela também alcance {fmt(t.scale, 2)}).</span>
          </p>
          {ev.leadingAhead.length > 0 && (
            <p className="mt-2 text-sm text-pivotar">
              Sinais antecedentes à frente do resultado em: {ev.leadingAhead.map((d) => DIMENSION_LABELS[d]).join(", ")}. A
              tendência é positiva, mas o efeito ainda não apareceu nos indicadores de resultado.
            </p>
          )}
        </div>
      </section>

      <details className="rounded-md bg-card p-4 shadow-border">
        <summary className="cursor-pointer font-semibold">Memória de cálculo (para auditoria)</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="mb-2 text-left text-muted-foreground">Notas por indicador</caption>
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">Indicador</th>
                <th className="py-1 pr-2">Dimensão</th>
                <th className="py-1 pr-2">Tipo</th>
                <th className="py-1 pr-2">Base → Meta</th>
                <th className="py-1 pr-2">Observado</th>
                <th className="py-1 pr-2">Nota</th>
                <th className="py-1 pr-2">Peso / renorm.</th>
                <th className="py-1">Situação</th>
              </tr>
            </thead>
            <tbody>
              {c.indicators.map((ind) => {
                const r = ev.indicators.find((x) => x.id === ind.id)!;
                return (
                  <tr key={ind.id} className="border-b last:border-0">
                    <td className="py-1 pr-2">{ind.name || "n/d"}</td>
                    <td className="py-1 pr-2">{DIMENSION_LABELS[ind.dimension]}</td>
                    <td className="py-1 pr-2">{ind.kpiType === "resultado" ? "Resultado" : "Antecedente"}</td>
                    <td className="py-1 pr-2">
                      {formatValue(ind.baseline, ind)} → {formatValue(ind.target, ind)}
                    </td>
                    <td className="py-1 pr-2">{formatValue(ind.observed, ind)}</td>
                    <td className="py-1 pr-2 tabular-nums">{fmt(r.score)}</td>
                    <td className="py-1 pr-2 tabular-nums">
                      {fmt(r.originalWeight, 2)} / {fmt(r.renormalizedWeight, 2)}
                    </td>
                    <td className="py-1">{r.available ? "Incluído" : `Excluído (falta ${r.missing.join(", ") || "dado válido"})`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <table className="mt-6 w-full min-w-[640px] text-sm">
            <caption className="mb-2 text-left text-muted-foreground">Agregação por dimensão</caption>
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">Dimensão</th>
                <th className="py-1 pr-2">Peso W</th>
                <th className="py-1 pr-2">
                  <span className="inline-flex items-center gap-1">
                    Cobertura <InfoTip text={HELP.coverage} label="Cobertura" />
                  </span>
                </th>
                <th className="py-1 pr-2">Nota S_j</th>
                <th className="py-1 pr-2">Só resultado</th>
                <th className="py-1 pr-2">Só antecedente</th>
                <th className="py-1">Contribuição</th>
              </tr>
            </thead>
            <tbody>
              {ev.dimensions.map((d) => (
                <tr key={d.dimension} className="border-b last:border-0">
                  <td className="py-1 pr-2">{DIMENSION_LABELS[d.dimension]}</td>
                  <td className="py-1 pr-2 tabular-nums">{fmt(d.weight, 2)}</td>
                  <td className="py-1 pr-2 tabular-nums">{fmt(d.coverage, 2)}</td>
                  <td className="py-1 pr-2 tabular-nums">{fmt(d.score, 4)}</td>
                  <td className="py-1 pr-2 tabular-nums">{fmt(d.outcomeScore)}</td>
                  <td className="py-1 pr-2 tabular-nums">{fmt(d.leadingScore)}</td>
                  <td className="py-1 tabular-nums">{fmt(d.contribution, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden="true" /> Exportar resultado em PDF (imprimir)
        </Button>
        <Button variant="outline" onClick={exportResults}>
          <Download aria-hidden="true" /> Exportar caso e resultado (JSON)
        </Button>
      </div>
    </div>
  );
}
