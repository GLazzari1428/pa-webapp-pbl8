import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/engine/types";

export const REC_STYLES: Record<Recommendation, string> = {
  Escalar: "bg-escalar text-background",
  Pivotar: "bg-pivotar text-background",
  Descontinuar: "bg-destructive text-background",
};

export function RecBadge({ rec, pending, large }: { rec: Recommendation | null; pending?: string | null; large?: boolean }) {
  const cls = rec ? REC_STYLES[rec] : "bg-muted text-muted-foreground shadow-border";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 font-medium", large ? "text-lg px-3 py-1" : "text-xs", cls)}>
      {rec ?? (pending ? "Pendente" : "n/d")}
    </span>
  );
}
