"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { evaluateCase, type CaseEvaluation } from "@/lib/engine/engine";
import type { FrameworkCase } from "@/lib/engine/types";
import { StepConfig } from "./StepConfig";
import { StepIndicators } from "./StepIndicators";
import { StepBarriers } from "./StepBarriers";
import { StepResult } from "./StepResult";
import { StepDecision } from "./StepDecision";
import { PrintReport } from "./PrintReport";

export interface StepProps {
  c: FrameworkCase;
  update: (fn: (c: FrameworkCase) => FrameworkCase) => void;
  ev: CaseEvaluation;
}

const STEPS = [
  { key: "config", title: "Configuração", subtitle: "Identificação do caso, hipótese de valor, pesos e limiares." },
  { key: "indicators", title: "Indicadores", subtitle: "Até 12 indicadores, com linha de base, meta, valor observado e evidência." },
  { key: "barriers", title: "Barreiras", subtitle: "Requisitos mínimos não compensáveis pela pontuação." },
  { key: "result", title: "Resultado", subtitle: "Pontuação, recomendação e sensibilidade aos pesos (memória de cálculo ao final)." },
  { key: "decision", title: "Decisão", subtitle: "Registro humano da decisão, congelado após salvo." },
] as const;

export function Wizard({ c, update, onClose }: { c: FrameworkCase; update: StepProps["update"]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const ev = useMemo(() => evaluateCase(c), [c]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const pendingCount = [
    ev.configIssues.length,
    ev.indicatorIssues.length + (c.indicators.length === 0 ? 1 : 0),
    ev.barrierIssues.length,
    0,
    c.decisions.length === 0 ? 1 : 0,
  ];
  const props: StepProps = { c, update, ev };
  const current = STEPS[step];

  return (
    <div>
      <div className="print:hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft aria-hidden="true" /> Todos os casos
          </Button>
          <p className="text-sm text-muted-foreground">
            Caso: <strong className="text-foreground">{c.config.name || "sem nome"}</strong> · salvo automaticamente neste navegador
          </p>
        </div>

        <nav aria-label="Etapas do preenchimento" className="mb-6">
          <Progress value={((step + 1) / STEPS.length) * 100} aria-label={`Etapa ${step + 1} de ${STEPS.length}`} className="mb-3" />
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === step ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      i === step ? "border-primary-foreground" : "border-foreground/40",
                    )}
                    aria-hidden="true"
                  >
                    {i < step && pendingCount[i] === 0 ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span>
                    {s.title}
                    {pendingCount[i] > 0 && i !== 3 && (
                      <span className={cn("block text-xs", i === step ? "text-primary-foreground/90" : "text-amber-800 dark:text-amber-300")}>
                        {pendingCount[i]} pendência(s)
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="step-title">
          <h1 id="step-title" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
            {step + 1}. {current.title}
          </h1>
          <p className="mb-6 text-muted-foreground">{current.subtitle}</p>
          {step === 0 && <StepConfig {...props} />}
          {step === 1 && <StepIndicators {...props} />}
          {step === 2 && <StepBarriers {...props} />}
          {step === 3 && <StepResult {...props} />}
          {step === 4 && <StepDecision {...props} />}
        </section>

        <div className="mt-8 flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ArrowLeft aria-hidden="true" /> Anterior
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Próximo: {STEPS[step + 1].title} <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Concluir e voltar aos casos
            </Button>
          )}
        </div>
      </div>
      <PrintReport c={c} ev={ev} />
    </div>
  );
}
