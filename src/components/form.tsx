"use client";

import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatInput, parseNumberInput } from "@/lib/engine/units";
import type { UnitId } from "@/lib/engine/types";

/** Ícone "i" com tooltip acessível por teclado (foco) e leitor de tela. */
export function InfoTip({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={`Ajuda: ${label}`}
        className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Info className="size-4" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left leading-snug">{text}</TooltipContent>
    </Tooltip>
  );
}

export interface ControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

interface FieldProps {
  label: string;
  help?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: (p: ControlProps) => ReactNode;
}

/** Rótulo associado, ajuda, exemplo e erro anunciado via aria-describedby + aria-live. */
export function Field({ label, help, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              {" "}*
            </span>
          )}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
        {help && <InfoTip text={help} label={label} />}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, "aria-required": required || undefined })}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <p id={errId} role="alert" aria-live="polite" className={cn("text-xs font-medium text-destructive", !error && "sr-only")}>
        {error ?? ""}
      </p>
    </div>
  );
}

export function TextField(props: Omit<FieldProps, "children"> & { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  const { value, onChange, placeholder, disabled, ...rest } = props;
  return (
    <Field {...rest}>
      {(p) => <Input {...p} value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function TextAreaField(props: Omit<FieldProps, "children"> & { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; disabled?: boolean }) {
  const { value, onChange, placeholder, rows = 3, disabled, ...rest } = props;
  return (
    <Field {...rest}>
      {(p) => <Textarea {...p} rows={rows} value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function SelectField<T extends string>(
  props: Omit<FieldProps, "children"> & { value: T | ""; onChange: (v: T) => void; options: { value: T; label: string }[]; placeholder?: string },
) {
  const { value, onChange, options, placeholder, ...rest } = props;
  return (
    <Field {...rest}>
      {(p) => (
        <select
          {...p}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/**
 * Campo numérico que aceita vírgula, "15%" e "15". Mantém o texto digitado
 * enquanto o usuário edita e só propaga números válidos.
 */
export function NumberField(
  props: Omit<FieldProps, "children" | "hint"> & {
    value: number | null;
    onChange: (v: number | null) => void;
    unit?: UnitId;
    example?: string;
    suffix?: string;
  },
) {
  const { value, onChange, unit = "unidade", example, suffix, error, ...rest } = props;
  const [text, setText] = useState(formatInput(value));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    // valor mudou por fora (ex.: carregar outro caso)
    setLastValue(value);
    if (parseNumberInput(text, unit).value !== value) setText(formatInput(value));
  }
  const parsed = parseNumberInput(text, unit);
  const shownError = parsed.error ?? error ?? null;
  const hint = [example, parsed.hint].filter(Boolean).join(" · ") || undefined;
  return (
    <Field {...rest} error={shownError} hint={hint}>
      {(p) => (
        <div className="flex items-center gap-1.5">
          <Input
            {...p}
            inputMode="decimal"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const r = parseNumberInput(e.target.value, unit);
              if (!r.error) {
                setLastValue(r.value);
                onChange(r.value);
              }
            }}
          />
          {suffix && <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>}
        </div>
      )}
    </Field>
  );
}
