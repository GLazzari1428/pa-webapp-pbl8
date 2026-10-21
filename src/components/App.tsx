"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { Onboarding } from "./Onboarding";
import { CaseList } from "./CaseList";
import { Wizard } from "./wizard/Wizard";
import { ThemeToggle } from "./ThemeToggle";
import { hasSeenOnboarding, loadCases, markOnboardingSeen, saveCases } from "@/lib/storage";
import type { FrameworkCase } from "@/lib/engine/types";

type View = { kind: "loading" } | { kind: "list" } | { kind: "case"; id: string };

export function App() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [cases, setCases] = useState<FrameworkCase[]>([]);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // localStorage só existe no navegador: carrega após montar.
  useEffect(() => {
    const s = hasSeenOnboarding();
    /* eslint-disable react-hooks/set-state-in-effect */
    setCases(loadCases());
    setView({ kind: "list" });
    setTutorialOpen(!s);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = (next: FrameworkCase[]) => {
    setCases(next);
    saveCases(next);
  };

  const updateCase = (id: string, fn: (c: FrameworkCase) => FrameworkCase) => {
    persist(cases.map((c) => (c.id === id ? { ...fn(c), updatedAt: new Date().toISOString() } : c)));
  };

  const active = view.kind === "case" ? cases.find((c) => c.id === view.id) : undefined;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-card print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            className="text-left text-base font-semibold hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded"
            onClick={() => setView({ kind: "list" })}
          >
            Framework de decisão pós-MVP de iniciativas de IA
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTutorialOpen(true)}
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <BookOpen className="size-4" aria-hidden="true" suppressHydrationWarning />
              Mostrar Tutorial
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {view.kind === "loading" && <p aria-live="polite">Carregando…</p>}
        {view.kind === "list" && <CaseList cases={cases} onChange={persist} onOpen={(id) => setView({ kind: "case", id })} />}
        {view.kind === "case" && active && (
          <Wizard c={active} update={(fn) => updateCase(active.id, fn)} onClose={() => setView({ kind: "list" })} />
        )}
        {view.kind === "case" && !active && <p>Caso não encontrado.</p>}
      </main>
      <Onboarding
        open={tutorialOpen}
        onOpenChange={(open) => {
          setTutorialOpen(open);
          if (!open) markOnboardingSeen();
        }}
      />
      <footer className="border-t py-3 text-center text-xs text-muted-foreground print:hidden">
        Grupo 14 · Pesquisa Aplicada · PUCPR. Dados salvos apenas neste navegador.
      </footer>
    </div>
  );
}
