"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownUp,
  Ban,
  ClipboardList,
  Cpu,
  Database,
  FileSearch,
  Gauge,
  Layers,
  Lightbulb,
  Ruler,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Tutorial de onboarding, adaptado de pbl6/04_Tutorial.md.
 * Cada conceito tem uma definição curta e, separado dela, um bloco "Exemplo:" com o Caso A.
 */

const DIMENSIONS: { label: string; icon: LucideIcon; cls: string }[] = [
  { label: "Qualidade técnica", icon: Cpu, cls: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700" },
  { label: "Eficiência econômica", icon: Wallet, cls: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700" },
  { label: "Valor operacional e adoção", icon: Users, cls: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700" },
  { label: "Prontidão, risco e governança", icon: ShieldCheck, cls: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/60 dark:text-violet-200 dark:border-violet-700" },
];

function DimBadge({ i, children }: { i: number; children?: ReactNode }) {
  const d = DIMENSIONS[i];
  const Icon = d.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", d.cls)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {children ?? d.label}
    </span>
  );
}

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-md border-l-4 border-sky-500 bg-sky-50 px-3 py-2 text-sm dark:border-sky-400 dark:bg-sky-950/40">
      <span className="font-semibold text-sky-900 dark:text-sky-200">Exemplo: </span>
      {children}
    </div>
  );
}

function Concept({ icon: Icon, title, children, example }: { icon: LucideIcon; title: string; children: ReactNode; example?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{children}</p>
      {example && <Example>{example}</Example>}
    </div>
  );
}

const OUTCOMES = [
  { label: "Escalar", cls: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700" },
  { label: "Pivotar", cls: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700" },
  { label: "Descontinuar", cls: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-700" },
];

const PAGES: { title: string; body: ReactNode }[] = [
  {
    title: "Para que serve este framework",
    body: (
      <>
        <p>Apoia a decisão sobre uma iniciativa de IA depois do MVP ou piloto. São três saídas possíveis:</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div key={o.label} className={cn("rounded-lg border p-3 text-center font-semibold", o.cls)}>
              {o.label}
            </div>
          ))}
        </div>
        <p>A pontuação S, de 0 a 1, combina indicadores de quatro dimensões:</p>
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map((_, i) => (
            <DimBadge key={i} i={i} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Concept icon={ClipboardList} title="Fase 1: coletar">
            Reunir os dados com as áreas da organização, antes de abrir o formulário.
          </Concept>
          <Concept icon={SlidersHorizontal} title="Fase 2: preencher">
            Lançar os dados no formulário, ver o resultado e registrar a decisão humana.
          </Concept>
        </div>
        <Example>
          os exemplos deste tutorial vêm do Caso A, um assistente de atendimento baseado em LLM testado num piloto de três
          meses.
        </Example>
        <p className="rounded-md bg-muted p-3 text-sm">
          A recomendação é um apoio, não uma decisão automática. Limiares e pesos são parâmetros declarados, não valores
          extraídos da literatura, e a ferramenta não estima incerteza estatística das medições.
        </p>
      </>
    ),
  },
  {
    title: "Fase 1: hipótese, pesos e limiares",
    body: (
      <div className="grid gap-3">
        <Concept
          icon={Lightbulb}
          title="Hipótese de valor"
          example="reduzir o tempo médio de atendimento de 12 para 8 minutos sem piorar a qualidade nem a conformidade. Indicador vinculado: tempo médio de atendimento."
        >
          O resultado que o projeto prometeu quando o MVP foi aprovado, numa frase com número. Vem da proposta ou do
          business case e é medido por um indicador escolhido.
        </Concept>
        <Concept
          icon={Scale}
          title="Pesos das dimensões"
          example={
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <DimBadge i={0}>0,30</DimBadge>
              <DimBadge i={1}>0,25</DimBadge>
              <DimBadge i={2}>0,25</DimBadge>
              <DimBadge i={3}>0,20</DimBadge>
            </span>
          }
        >
          A importância de cada dimensão na decisão. Cada decisor (negócio, TI, segurança ou jurídico) distribui 100
          pontos entre as quatro; a média de cada uma dividida por 100 é o peso. Sem consenso, 0,25 para todas. Defina
          antes de ver os resultados.
        </Concept>
        <Concept
          icon={Gauge}
          title="Limiares"
          example={
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded border px-1.5", OUTCOMES[0].cls)}>S ≥ 0,70: Escalar</span>
              <span className={cn("rounded border px-1.5", OUTCOMES[1].cls)}>0,40 ≤ S &lt; 0,70: Pivotar</span>
              <span className={cn("rounded border px-1.5", OUTCOMES[2].cls)}>S &lt; 0,40: Descontinuar</span>
              <span>Fronteira: 0,05.</span>
            </span>
          }
        >
          Os cortes que convertem a pontuação S em recomendação. Abaixo do limiar inferior, Descontinuar, salvo se a perda
          estiver concentrada numa dimensão corrigível. A distância de fronteira marca resultados perto de um limiar.
        </Concept>
      </div>
    ),
  },
  {
    title: "Fase 1: indicadores e evidências",
    body: (
      <div className="grid gap-3 md:grid-cols-2">
        <Concept icon={Target} title="Indicador" example="% de atendimentos refeitos por erro da IA, na dimensão de qualidade técnica.">
          Uma medida numérica do efeito do MVP. De um a três por dimensão (até 12 no total), escolhidos a partir da
          hipótese e só entre os que a organização já consegue medir.
        </Concept>
        <Concept icon={ArrowDownUp} title="Direção" example="atendimentos refeitos: menor é melhor.">
          Se o resultado melhora quando o valor aumenta ou quando diminui.
        </Concept>
        <Concept icon={TrendingUp} title="Linha de base, meta e valor observado" example="base 25%, meta 10%, observado 11% nos três meses do piloto.">
          A base é o valor antes do MVP; a meta, o valor que se quer atingir; o observado, o medido no piloto pelo mesmo
          método da base.
        </Concept>
        <Concept icon={Ruler} title="Unidade" example="15 e 15% são aceitos como o mesmo percentual.">
          A unidade da medida: %, R$, minutos, horas, dias, pontos e outras.
        </Concept>
        <Concept icon={Layers} title="Tipo de KPI" example="% de atendentes que usam a IA é antecedente; tempo de atendimento é de resultado.">
          Antecedente é um sinal inicial de que o efeito virá; de resultado é o próprio efeito buscado.
        </Concept>
        <Concept icon={Scale} title="Peso na dimensão" example="respostas corretas 0,60 e atendimentos refeitos 0,40.">
          Quanto cada indicador pesa dentro da sua dimensão. Os mesmos 100 pontos são distribuídos entre os indicadores da
          dimensão.
        </Concept>
        <Concept icon={FileSearch} title="Origem, período e responsável" example="sistema de chamados, meses 1 a 3, supervisor do atendimento.">
          De onde veio o número, que intervalo ele cobre e quem fez a medição.
        </Concept>
        <Concept icon={Database} title="Dado ausente" example="sem o valor observado de custo, o indicador sai do cálculo e os pesos da dimensão são renormalizados.">
          Deixe o valor observado vazio. O indicador sai do cálculo; ausência nunca vira nota zero.
        </Concept>
      </div>
    ),
  },
  {
    title: "Fase 1: barreiras. Fase 2: preenchimento",
    body: (
      <>
        <Concept
          icon={Ban}
          title="Barreira"
          example="segurança verificada com a TI: só fica Atendida com o relatório de testes anexado como evidência; sem verificação, Não avaliada."
        >
          Um requisito mínimo que nenhuma nota compensa: confiabilidade (com a operação), segurança (com a TI), privacidade
          (com o encarregado de dados) e conformidade legal e ética (com o jurídico).
        </Concept>
        <p className="font-medium">O formulário segue cinco etapas, uma por vez:</p>
        <ol className="grid gap-2 sm:grid-cols-5">
          {[
            ["Configuração", "caso, hipótese, pesos e limiares"],
            ["Indicadores", "até 12, com evidência"],
            ["Barreiras", "estado, evidência e plano"],
            ["Resultado", "S, recomendação, gráfico e sensibilidade"],
            ["Decisão", "registro humano, congelado após salvo"],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-lg border bg-background p-2 text-sm">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
              <span className="mt-1 block font-semibold">{t}</span>
              <span className="text-muted-foreground">{d}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Tudo fica salvo apenas neste navegador. Exporte o caso em JSON para guardar ou compartilhar, e o resultado em PDF
          pela impressão do navegador.
        </p>
      </>
    ),
  },
];

export function Onboarding({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [page, setPage] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = page === PAGES.length - 1;
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [page, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent initialFocus={headingRef}>
        <div className="border-b px-6 pt-5 pb-3 pr-12">
          <p className="text-sm text-muted-foreground">
            Tutorial · página {page + 1} de {PAGES.length}
          </p>
          <Progress value={((page + 1) / PAGES.length) * 100} aria-label="Progresso do tutorial" className="my-3" />
          <DialogTitle ref={headingRef} tabIndex={-1} className="outline-none">
            {PAGES[page].title}
          </DialogTitle>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 leading-relaxed">{PAGES[page].body}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              Anterior
            </Button>
            {last ? (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setPage(0);
                }}
              >
                Entendi
              </Button>
            ) : (
              <Button onClick={() => setPage((p) => p + 1)}>Próximo</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
