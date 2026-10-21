"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { fmt, type CaseEvaluation } from "@/lib/engine/engine";
import { DIMENSION_LABELS, type Thresholds } from "@/lib/engine/types";

/**
 * Cartão de gráfico inspirado no padrão "Analytics Chart" do cult-ui
 * (cabeçalho com métricas clicáveis + gráfico), reimplementado com recharts.
 */
const SHORT: Record<string, string> = {
  tecnica: "Técnica",
  economica: "Econômica",
  operacional: "Operacional",
  governanca: "Governança",
};

const BAR_COLOR = "#1d4ed8"; // azul 700: contraste 6,7:1 sobre branco
const MISSING_COLOR = "#9ca3af";
// Tooltip segue os tokens do tema para ficar legível no claro e no escuro.
const TOOLTIP_STYLE = { background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 8 };

export function ResultChart({ ev, t }: { ev: CaseEvaluation; t: Thresholds }) {
  const [tab, setTab] = useState<"dim" | "sens">("dim");
  const dimData = ev.dimensions.map((d) => ({
    key: d.dimension,
    name: SHORT[d.dimension],
    full: DIMENSION_LABELS[d.dimension],
    score: d.score ?? 0,
    missing: d.score === null,
    weight: d.weight,
  }));
  const sensData = [...ev.sensitivity.combos]
    .sort((a, b) => a.score - b.score)
    .map((c, i) => ({ i: i + 1, score: c.score }));

  const metrics = [
    { key: "dim" as const, label: "Pontuação S", value: fmt(ev.score), sub: "por dimensão" },
    {
      key: "sens" as const,
      label: "Intervalo na sensibilidade",
      value: `${fmt(ev.sensitivity.min)} – ${fmt(ev.sensitivity.max)}`,
      sub: `${ev.sensitivity.combos.length} combinações de pesos`,
    },
  ];

  return (
    <div className="rounded-xl border bg-card">
      <div role="tablist" aria-label="Gráficos do resultado" className="grid grid-cols-2 border-b">
        {metrics.map((m) => (
          <button
            key={m.key}
            role="tab"
            id={`tab-${m.key}`}
            aria-selected={tab === m.key}
            aria-controls={`panel-${m.key}`}
            onClick={() => setTab(m.key)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const next = tab === "dim" ? "sens" : "dim";
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            tabIndex={tab === m.key ? 0 : -1}
            className={cn(
              "flex flex-col items-start gap-0.5 px-5 py-4 text-left first:border-r focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50",
              tab === m.key ? "bg-muted/60" : "hover:bg-muted/30",
            )}
          >
            <span className="text-xs text-muted-foreground">{m.label}</span>
            <span className="text-2xl font-semibold tabular-nums">{m.value}</span>
            <span className="text-xs text-muted-foreground">{m.sub}</span>
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "dim" ? (
          <div role="tabpanel" id="panel-dim" aria-labelledby="tab-dim">
            <figure>
              <div className="h-72 w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dimData} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <ReferenceLine y={t.scale} stroke="var(--chart-scale)" strokeDasharray="4 4" label={{ value: `Escalar ${fmt(t.scale, 2)}`, position: "insideTopRight", fill: "var(--chart-scale)", fontSize: 11 }} />
                    <ReferenceLine y={t.lower} stroke="var(--chart-pivot)" strokeDasharray="4 4" label={{ value: `Pivotar ${fmt(t.lower, 2)}`, position: "insideTopRight", fill: "var(--chart-pivot)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ fill: "var(--muted)" }}
                      formatter={(v, _n, p) => [(p.payload as { missing: boolean }).missing ? "sem cobertura" : fmt(Number(v)), "Nota S_j"]}
                      labelFormatter={(_l, p) => (p?.[0]?.payload as { full?: string })?.full ?? ""}
                    />
                    <Bar isAnimationActive={false} dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {dimData.map((d) => (
                        <Cell key={d.key} fill={d.missing ? MISSING_COLOR : BAR_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <figcaption className="mt-2 text-sm text-muted-foreground">
                Nota de cada dimensão (0 a 1) com as linhas dos limiares. A pontuação S é a média ponderada dessas notas.
              </figcaption>
            </figure>
            <table className="sr-only">
              <caption>Nota por dimensão</caption>
              <thead>
                <tr>
                  <th>Dimensão</th>
                  <th>Nota</th>
                  <th>Peso</th>
                </tr>
              </thead>
              <tbody>
                {dimData.map((d) => (
                  <tr key={d.key}>
                    <td>{d.full}</td>
                    <td>{d.missing ? "sem cobertura" : fmt(d.score)}</td>
                    <td>{fmt(d.weight, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="tabpanel" id="panel-sens" aria-labelledby="tab-sens">
            <figure>
              <div className="h-72 w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sensData} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
                    <defs>
                      <linearGradient id="sensFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BAR_COLOR} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={BAR_COLOR} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <ReferenceArea y1={t.scale} y2={1} fill="#10b981" fillOpacity={0.08} />
                    <ReferenceArea y1={t.lower} y2={t.scale} fill="#f59e0b" fillOpacity={0.08} />
                    <ReferenceArea y1={0} y2={t.lower} fill="#ef4444" fillOpacity={0.06} />
                    <XAxis dataKey="i" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} label={{ value: "combinações, da menor para a maior S", position: "insideBottom", offset: -2, fill: "var(--muted-foreground)", fontSize: 11 }} height={36} />
                    <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <ReferenceLine y={ev.score} stroke="var(--foreground)" strokeDasharray="2 3" label={{ value: `S atual ${fmt(ev.score)}`, position: "insideBottomLeft", fill: "var(--foreground)", fontSize: 11 }} />
                    <ReferenceLine y={t.scale} stroke="var(--chart-scale)" strokeDasharray="4 4" />
                    <ReferenceLine y={t.lower} stroke="var(--chart-pivot)" strokeDasharray="4 4" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [fmt(Number(v)), "S"]} labelFormatter={(l) => `Combinação ${l}`} />
                    <Area isAnimationActive={false} type="monotone" dataKey="score" stroke={BAR_COLOR} strokeWidth={2} fill="url(#sensFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <figcaption className="mt-2 text-sm text-muted-foreground">
                As {sensData.length} pontuações S obtidas variando cada peso de dimensão em ±{fmt(t.variation * 100, 0)}%. Faixas:
                verde = Escalar, âmbar = Pivotar, vermelho = Descontinuar. {ev.sensitivity.label}
              </figcaption>
            </figure>
          </div>
        )}
      </div>
    </div>
  );
}
