import type { Issue } from "@/lib/engine/engine";

/** Lista de pendências que diz exatamente o que falta (M5). Anunciada a leitores de tela. */
export function IssueList({ issues, title = "O que falta nesta etapa" }: { issues: { message: string }[] | Issue[]; title?: string }) {
  return (
    <div role="status" aria-live="polite">
      {issues.length > 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-medium">{title}:</p>
          <ul className="mt-1 list-disc pl-5">
            {issues.map((i, k) => (
              <li key={k}>{i.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function issueFor(issues: Issue[], targetId: string, field: string): string | null {
  return issues.find((i) => i.targetId === targetId && (i.field === field || i.field.startsWith(field + ".")))?.message ?? null;
}
