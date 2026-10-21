"use client";

import { useRef, useState } from "react";
import { Copy, Download, FilePlus2, FolderOpen, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_CASES } from "@/lib/data/examples";
import { evaluateCase } from "@/lib/engine/engine";
import { latestDecision } from "@/lib/engine/decisions";
import type { FrameworkCase } from "@/lib/engine/types";
import { downloadJson, duplicateCase, isCase, newCase, slugify, uid } from "@/lib/storage";
import { RecBadge } from "./wizard/RecBadge";

export function CaseList({
  cases,
  onChange,
  onOpen,
}: {
  cases: FrameworkCase[];
  onChange: (c: FrameworkCase[]) => void;
  onOpen: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const create = () => {
    const c = newCase();
    onChange([...cases, c]);
    onOpen(c.id);
  };

  const loadExample = (ex: FrameworkCase) => {
    const c = { ...duplicateCase(ex), id: uid() };
    onChange([...cases, c]);
    setMessage(`Exemplo "${ex.config.name}" adicionado.`);
  };

  const importFile = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const c = data?.case ?? data;
      if (!isCase(c)) throw new Error("formato");
      const imported = cases.some((x) => x.id === c.id) ? { ...c, id: uid() } : c;
      onChange([...cases, imported]);
      setMessage(`Caso "${c.config.name || "sem nome"}" importado.`);
    } catch {
      setMessage("Não foi possível importar: o arquivo não é um caso exportado por esta ferramenta.");
    }
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="casos-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="casos-title" className="text-2xl font-semibold">
            Casos salvos
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={create}>
              <FilePlus2 aria-hidden="true" /> Novo caso
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden="true" /> Importar JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Arquivo JSON do caso"
              tabIndex={-1}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
        {cases.length === 0 ? (
          <p className="text-muted-foreground">Nenhum caso salvo ainda. Crie um novo caso ou carregue um dos exemplos abaixo.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {cases.map((c) => {
              const ev = evaluateCase(c);
              const dec = latestDecision(c);
              return (
                <li key={c.id} className="rounded-md bg-card p-4 shadow-border">
                  <h2 className="font-medium">{c.config.name || "Caso sem nome"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    S = {c.indicators.length ? ev.score.toLocaleString("pt-BR", { maximumFractionDigits: 3 }) : "n/d"} ·{" "}
                    {c.indicators.length} indicador(es) · atualizado em {new Date(c.updatedAt).toLocaleString("pt-BR")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span>Recomendação:</span> <RecBadge rec={ev.outcome.recommendation} pending={ev.outcome.pending} />
                    {dec && <Badge variant="outline">Decisão v{dec.version}: {dec.decision}</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onOpen(c.id)}>
                      <FolderOpen aria-hidden="true" /> Abrir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadJson(`${slugify(c.config.name)}.json`, { format: "pbl8-framework-case", version: 1, case: c })}>
                      <Download aria-hidden="true" /> Exportar JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onChange([...cases, duplicateCase(c, " (cópia)")])}>
                      <Copy aria-hidden="true" /> Duplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm(`Excluir o caso "${c.config.name || "sem nome"}"? Esta ação não pode ser desfeita.`))
                          onChange(cases.filter((x) => x.id !== c.id));
                      }}
                    >
                      <Trash2 aria-hidden="true" /> Excluir
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="ex-title" className="space-y-3">
        <h2 id="ex-title" className="text-lg font-semibold">
          Exemplos do artigo (Tabela 2)
        </h2>
        <p className="text-sm text-muted-foreground">
          Os três casos avaliados no artigo, com dados simulados ou de referência. Carregar cria uma cópia editável.
        </p>
        <ul className="divide-y rounded-md bg-card shadow-border">
          {EXAMPLE_CASES.map((ex) => (
            <li key={ex.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">{ex.config.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ex.config.context}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => loadExample(ex)}>
                Carregar exemplo
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
