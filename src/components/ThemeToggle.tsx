"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "pbl8.framework.theme";

/** Alterna a classe "dark" em <html>. O tema inicial é aplicado pelo script em layout.tsx, antes da hidratação. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // sem localStorage: a escolha vale só nesta sessão
    }
  };

  const label = dark ? "Usar tema claro" : "Usar tema escuro";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {dark ? (
        <Sun className="size-4" aria-hidden="true" suppressHydrationWarning />
      ) : (
        <Moon className="size-4" aria-hidden="true" suppressHydrationWarning />
      )}
    </button>
  );
}
