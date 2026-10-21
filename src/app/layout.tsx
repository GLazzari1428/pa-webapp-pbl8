import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framework de decisão pós-MVP de iniciativas de IA",
  description: "Ferramenta acadêmica (Grupo 14, PUCPR) para apoiar a decisão de Escalar, Pivotar ou Descontinuar iniciativas de IA após o MVP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
