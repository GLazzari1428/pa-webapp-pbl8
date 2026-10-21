import { fmt, type CaseEvaluation } from "@/lib/engine/engine";
import { BARRIER_STATUS_LABELS, DIMENSION_LABELS, type FrameworkCase } from "@/lib/engine/types";
import { formatValue } from "@/lib/engine/units";

const DATA_LABEL = { real: "Reais", referencia: "De referência", simulado: "Simulados" };

/** Relatório exibido só na impressão (Exportar PDF via "Salvar como PDF" do navegador). */
export function PrintReport({ c, ev }: { c: FrameworkCase; ev: CaseEvaluation }) {
  const cfg = c.config;
  const dec = c.decisions[c.decisions.length - 1];
  return (
    <article className="hidden text-[11pt] leading-snug text-black print:block">
      <h1 className="text-xl font-bold">Framework de decisão pós-MVP: {cfg.name || "caso sem nome"}</h1>
      <p>
        Gerado em {new Date().toLocaleString("pt-BR")} · Tipo de dados: {DATA_LABEL[cfg.dataType]} · Período: {cfg.period || "n/d"}
      </p>
      <p className="mt-2">
        <strong>Hipótese de valor:</strong> {cfg.hypothesis.text || "n/d"}
      </p>
      <p>{ev.hypothesis.message}</p>

      <h2 className="mt-4 text-lg font-bold">Resultado</h2>
      <p>
        Pontuação geral: <strong>{fmt(ev.score)}</strong> · Faixa por pontuação: <strong>{ev.outcome.band ?? "aguardando julgamento"}</strong> · Recomendação final:{" "}
        <strong>{ev.outcome.recommendation ?? `pendente (${ev.outcome.pending})`}</strong>
        {ev.borderline ? " · Zona de fronteira" : ""}
      </p>
      <p>{ev.explanation}</p>
      <ul className="list-disc pl-5">
        {ev.outcome.constraints.map((k, i) => (
          <li key={i}>{k.message}</li>
        ))}
      </ul>
      <p className="mt-1">
        Sensibilidade ({ev.sensitivity.combos.length} combinações, cada peso variando {fmt(cfg.thresholds.variation * 100, 0)}% para menos e para mais): pontuação geral de {fmt(ev.sensitivity.min)} a{" "}
        {fmt(ev.sensitivity.max)}. {ev.sensitivity.label}
      </p>

      <table className="mt-3 w-full border-collapse text-[10pt]">
        <thead>
          <tr>
            {["Dimensão", "Peso W", "Cobertura", "Nota S_j", "Contribuição"].map((h) => (
              <th key={h} className="border border-black px-1 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ev.dimensions.map((d) => (
            <tr key={d.dimension}>
              <td className="border border-black px-1">{DIMENSION_LABELS[d.dimension]}</td>
              <td className="border border-black px-1">{fmt(d.weight, 2)}</td>
              <td className="border border-black px-1">{fmt(d.coverage, 2)}</td>
              <td className="border border-black px-1">{fmt(d.score, 4)}</td>
              <td className="border border-black px-1">{fmt(d.contribution, 4)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-4 text-lg font-bold">Indicadores</h2>
      <table className="w-full border-collapse text-[9pt]">
        <thead>
          <tr>
            {["Indicador", "Dimensão", "Tipo", "Linha de base", "Meta", "Observado", "Peso", "Nota", "Origem da evidência"].map((h) => (
              <th key={h} className="border border-black px-1 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.indicators.map((i) => {
            const r = ev.indicators.find((x) => x.id === i.id)!;
            return (
              <tr key={i.id}>
                <td className="border border-black px-1">{i.name}</td>
                <td className="border border-black px-1">{DIMENSION_LABELS[i.dimension]}</td>
                <td className="border border-black px-1">{i.kpiType === "resultado" ? "Resultado" : "Antecedente"}</td>
                <td className="border border-black px-1">{formatValue(i.baseline, i)}</td>
                <td className="border border-black px-1">{formatValue(i.target, i)}</td>
                <td className="border border-black px-1">{formatValue(i.observed, i)}</td>
                <td className="border border-black px-1">{fmt(i.weight, 2)}</td>
                <td className="border border-black px-1">{r.available ? fmt(r.score) : "excluído"}</td>
                <td className="border border-black px-1">{i.evidenceSource}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="mt-4 text-lg font-bold">Barreiras</h2>
      <ul className="list-disc pl-5">
        {c.barriers.map((b) => (
          <li key={b.id}>
            <strong>{b.name}</strong>: {BARRIER_STATUS_LABELS[b.status]}
            {b.evidence ? `. Evidência: ${b.evidence}` : ""}
            {b.status === "em_tratamento" ? `. Plano${b.planApproved ? " aprovado" : " não aprovado"}: ${b.plan}` : ""}
          </li>
        ))}
      </ul>

      <h2 className="mt-4 text-lg font-bold">Decisão humana</h2>
      {dec ? (
        <div>
          <p>
            Versão {dec.version}, salva em {new Date(dec.savedAt).toLocaleString("pt-BR")}. Decisão: <strong>{dec.decision}</strong> (recomendação na
            época: {dec.snapshot.recommendation ?? "pendente"}). Responsável: {dec.owner}. Data: {dec.decisionDate}.
          </p>
          <p>Justificativa: {dec.justification}</p>
          <p>Plano de ação: {dec.actionPlan}</p>
          {c.decisions.length > 1 && <p>Há {c.decisions.length - 1} versão(ões) anterior(es) preservada(s) no histórico.</p>}
        </div>
      ) : (
        <p>Nenhuma decisão registrada.</p>
      )}
      <p className="mt-4 text-[9pt]">
        A recomendação não é decisão automática. Pesos e limiares são parâmetros declarados do instrumento; a análise de sensibilidade mostra
        quanto a recomendação depende deles.
      </p>
    </article>
  );
}
