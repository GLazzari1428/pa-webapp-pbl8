"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * Tutorial de onboarding, adaptado de pbl6/04_Tutorial.md.
 * Cada conceito tem uma definição curta e, separada dela, uma citação "Exemplo" com o Caso A.
 * Segue DESIGN.md: hierarquia só por tamanho, peso e espaço; sem ícones, selos coloridos ou tarja lateral.
 */

function Example({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-2 pl-4 text-sm text-muted-foreground">
      <span className="mr-2 text-xs font-medium tracking-wide text-foreground uppercase">Exemplo</span>
      {children}
    </blockquote>
  );
}

function Concept({ title, children, example }: { title: string; children: ReactNode; example?: ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed">{children}</p>
      {example && <Example>{example}</Example>}
    </section>
  );
}

const PAGES: { title: string; body: ReactNode }[] = [
  {
    title: "Para que serve este framework",
    body: (
      <>
        <p>
          Apoia a decisão sobre uma iniciativa de IA depois do MVP ou piloto, com uma de três recomendações:{" "}
          <strong className="font-semibold">Escalar</strong>, <strong className="font-semibold">Pivotar</strong> ou{" "}
          <strong className="font-semibold">Descontinuar</strong>.
        </p>
        <p>
          A recomendação vem da pontuação S, de 0 a 1, que combina indicadores de quatro dimensões: qualidade técnica,
          eficiência econômica, valor operacional e adoção, e prontidão, risco e governança.
        </p>
        <p>
          O trabalho tem duas fases. Na <strong className="font-semibold">fase 1</strong>, você reúne os dados com as
          áreas da organização, antes de abrir o formulário. Na <strong className="font-semibold">fase 2</strong>, lança
          esses dados no formulário, vê o resultado e registra a decisão humana.
        </p>
        <Example>
          os exemplos deste tutorial vêm do Caso A, um assistente de atendimento baseado em LLM testado num piloto de três
          meses.
        </Example>
        <p className="text-sm text-muted-foreground">
          A recomendação é um apoio, não uma decisão automática. Limiares e pesos são parâmetros declarados, não valores
          extraídos da literatura, e a ferramenta não estima incerteza estatística das medições.
        </p>
      </>
    ),
  },
  {
    title: "Fase 1: hipótese, pesos e limiares",
    body: (
      <>
        <Concept
          title="Hipótese de valor"
          example="reduzir o tempo médio de atendimento de 12 para 8 minutos sem piorar a qualidade nem a conformidade. Indicador vinculado: tempo médio de atendimento."
        >
          O resultado que o projeto prometeu quando o MVP foi aprovado, numa frase com número. Vem da proposta ou do
          business case e é medido por um indicador escolhido.
        </Concept>
        <Concept
          title="Pesos das dimensões"
          example="qualidade técnica 0,30; eficiência econômica 0,25; valor operacional e adoção 0,25; prontidão, risco e governança 0,20."
        >
          A importância de cada dimensão na decisão. Cada decisor (negócio, TI, segurança ou jurídico) distribui 100
          pontos entre as quatro; a média de cada uma dividida por 100 é o peso. Sem consenso, 0,25 para todas. Defina
          antes de ver os resultados.
        </Concept>
        <Concept
          title="Limiares"
          example="S ≥ 0,70: Escalar; 0,40 ≤ S < 0,70: Pivotar; S < 0,40: Descontinuar. Distância de fronteira: 0,05."
        >
          Os cortes que convertem a pontuação S em recomendação. Abaixo do limiar inferior, Descontinuar, salvo se a perda
          estiver concentrada numa dimensão corrigível. A distância de fronteira marca resultados perto de um limiar.
        </Concept>
      </>
    ),
  },
  {
    title: "Fase 1: indicadores e evidências",
    body: (
      <>
        <Concept title="Indicador" example="% de atendimentos refeitos por erro da IA, na dimensão de qualidade técnica.">
          Uma medida numérica do efeito do MVP. De um a três por dimensão (até 12 no total), escolhidos a partir da
          hipótese e só entre os que a organização já consegue medir.
        </Concept>
        <Concept title="Direção" example="atendimentos refeitos: menor é melhor.">
          Se o resultado melhora quando o valor aumenta ou quando diminui.
        </Concept>
        <Concept title="Linha de base, meta e valor observado" example="base 25%, meta 10%, observado 11% nos três meses do piloto.">
          A base é o valor antes do MVP; a meta, o valor que se quer atingir; o observado, o medido no piloto pelo mesmo
          método da base.
        </Concept>
        <Concept title="Unidade" example="15 e 15% são aceitos como o mesmo percentual.">
          A unidade da medida: %, R$, minutos, horas, dias, pontos e outras.
        </Concept>
        <Concept title="Tipo de KPI" example="% de atendentes que usam a IA é antecedente; tempo de atendimento é de resultado.">
          Antecedente é um sinal inicial de que o efeito virá; de resultado é o próprio efeito buscado.
        </Concept>
        <Concept title="Peso na dimensão" example="respostas corretas 0,60 e atendimentos refeitos 0,40.">
          Quanto cada indicador pesa dentro da sua dimensão. Os mesmos 100 pontos são distribuídos entre os indicadores da
          dimensão.
        </Concept>
        <Concept title="Origem, período e responsável" example="sistema de chamados, meses 1 a 3, supervisor do atendimento.">
          De onde veio o número, que intervalo ele cobre e quem fez a medição.
        </Concept>
        <Concept title="Dado ausente" example="sem o valor observado de custo, o indicador sai do cálculo e os pesos da dimensão são renormalizados.">
          Deixe o valor observado vazio. O indicador sai do cálculo; ausência nunca vira nota zero.
        </Concept>
      </>
    ),
  },
  {
    title: "Fase 1: barreiras. Fase 2: preenchimento",
    body: (
      <>
        <Concept
          title="Barreira"
          example="segurança verificada com a TI: só fica Atendida com o relatório de testes anexado como evidência; sem verificação, Não avaliada."
        >
          Um requisito mínimo que nenhuma nota compensa: confiabilidade (com a operação), segurança (com a TI), privacidade
          (com o encarregado de dados) e conformidade legal e ética (com o jurídico).
        </Concept>
        <section>
          <h3 className="text-base font-semibold tracking-tight">As cinco etapas do formulário</h3>
          <ol className="mt-2 space-y-1.5 text-sm">
            {[
              ["Configuração", "caso, hipótese, pesos e limiares"],
              ["Indicadores", "até 12, com evidência"],
              ["Barreiras", "estado, evidência e plano"],
              ["Resultado", "S, recomendação, gráfico e sensibilidade"],
              ["Decisão", "registro humano, congelado após salvo"],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="w-4 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{i + 1}</span>
                <span>
                  <span className="font-medium">{t}</span>
                  <span className="text-muted-foreground">: {d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
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
        <div className="px-6 shadow-[0_1px_0_0_var(--border)] pt-5 pb-3 pr-12">
          <p className="text-sm text-muted-foreground">
            Tutorial · página {page + 1} de {PAGES.length}
          </p>
          <Progress value={((page + 1) / PAGES.length) * 100} aria-label="Progresso do tutorial" className="my-3" />
          <DialogTitle ref={headingRef} tabIndex={-1} className="outline-none">
            {PAGES[page].title}
          </DialogTitle>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 leading-relaxed">{PAGES[page].body}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 shadow-[0_-1px_0_0_var(--border)] py-3">
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
