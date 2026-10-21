import type { Indicator, UnitId } from "./types";

export const UNIT_OPTIONS: { id: UnitId; label: string; suffix: string; example: string }[] = [
  { id: "percentual", label: "Percentual (%)", suffix: "%", example: "digite 15 ou 15% para quinze por cento" },
  { id: "moeda", label: "Moeda (R$)", suffix: "R$", example: "ex.: 3,30 para R$ 3,30" },
  { id: "minutos", label: "Minutos (min)", suffix: "min", example: "ex.: 8,2 para 8,2 minutos" },
  { id: "horas", label: "Horas (h)", suffix: "h", example: "ex.: 4 para 4 horas" },
  { id: "dias", label: "Dias", suffix: "dias", example: "ex.: 21 para 21 dias" },
  { id: "pontos", label: "Pontos (escala, nota)", suffix: "pts", example: "ex.: 7,5 numa escala de 0 a 10" },
  { id: "unidade", label: "Contagem (unidades)", suffix: "un.", example: "ex.: 200 pedidos" },
  { id: "outra", label: "Outra (descrever)", suffix: "", example: "descreva a unidade no campo ao lado" },
];

export function unitSuffix(ind: Pick<Indicator, "unit" | "customUnit">): string {
  if (ind.unit === "outra") return ind.customUnit?.trim() ?? "";
  return UNIT_OPTIONS.find((u) => u.id === ind.unit)?.suffix ?? "";
}

export interface ParsedNumber {
  value: number | null;
  error: string | null;
  /** Aviso não bloqueante (ex.: possível confusão entre fração e percentual). */
  hint: string | null;
}

/**
 * Converte texto digitado em número na unidade exibida.
 * Percentual: "15%", "15" e "15,0" significam todos quinze por cento (valor 15).
 * Aceita vírgula ou ponto como separador decimal e "R$" opcional.
 */
export function parseNumberInput(raw: string, unit: UnitId): ParsedNumber {
  let s = raw.trim();
  if (s === "") return { value: null, error: null, hint: null };
  s = s.replace(/^R\$\s*/i, "").replace(/\s+/g, "");
  const hasPercent = s.endsWith("%");
  if (hasPercent) {
    if (unit !== "percentual") return { value: null, error: "O símbolo % só vale para a unidade Percentual.", hint: null };
    s = s.slice(0, -1);
  }
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return { value: null, error: "Digite apenas um número (ex.: 15 ou 15,5).", hint: null };
  const value = Number(s);
  let hint: string | null = null;
  if (unit === "percentual" && !hasPercent && value > 0 && value < 1)
    hint = `Entendido como ${formatInput(value)}%. Se quis dizer ${formatInput(value * 100)}%, digite ${formatInput(value * 100)}.`;
  return { value, error: null, hint };
}

export function formatInput(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "";
  return String(Math.round(n * 1e9) / 1e9).replace(".", ",");
}

export function formatValue(n: number | null, ind: Pick<Indicator, "unit" | "customUnit">): string {
  if (n === null) return "n/d";
  const num = n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  if (ind.unit === "percentual") return `${num}%`;
  if (ind.unit === "moeda") return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const suf = unitSuffix(ind);
  return suf ? `${num} ${suf}` : num;
}
