import { CircleAlert } from "lucide-react";
import type { Issue } from "@/lib/engine/engine";

/** Lista de pendências que diz exatamente o que falta (M5). Anunciada a leitores de tela. */
export function IssueList({ issues, title = "O que falta nesta etapa" }: { issues: { message: string }[] | Issue[]; title?: string }) {
  return (
    <div role="status" aria-live="polite">
      {issues.length > 0 ? (
        <div className="rounded-md bg-muted p-3 text-sm text-foreground shadow-border">
          <p className="flex items-center gap-1.5 font-medium">
            <CircleAlert className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {title}:
          </p>
          <ul className="mt-1 list-disc pl-[1.375rem] text-muted-foreground">
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
