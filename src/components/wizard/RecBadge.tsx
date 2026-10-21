import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/engine/types";

export const REC_STYLES: Record<Recommendation, string> = {
  Escalar: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Pivotar: "bg-amber-100 text-amber-900 border-amber-300",
  Descontinuar: "bg-red-100 text-red-900 border-red-300",
};

export function RecBadge({ rec, pending, large }: { rec: Recommendation | null; pending?: string | null; large?: boolean }) {
  const cls = rec ? REC_STYLES[rec] : "bg-slate-100 text-slate-800 border-slate-300";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-medium", large ? "text-lg px-3 py-1" : "text-xs", cls)}>
      {rec ?? (pending ? "Pendente" : "—")}
    </span>
  );
}
