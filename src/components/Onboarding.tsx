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
    <section className="rounded-md border border-foreground/15 bg-muted p-4">
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
          A recomendação vem de uma pontuação geral calculada pelo framework, que vai de 0 a 1. Essa pontuação combina
          indicadores de quatro dimensões: qualidade técnica, eficiência econômica, valor operacional e adoção, e
          prontidão, risco e governança.
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
          example="três decisores dão, em média, 30 pontos à qualidade técnica. O peso da qualidade técnica fica 0,30. As outras ficam com 0,25, 0,25 e 0,20."
        >
          O peso diz quanto cada dimensão importa na decisão. Cada decisor (negócio, TI, segurança ou jurídico) distribui
          100 pontos entre as quatro dimensões. O peso de uma dimensão é a média dos pontos que ela recebeu, dividida por
          100. Sem consenso, cada dimensão fica com peso 0,25. Defina os pesos antes de ver os resultados.
        </Concept>
        <Concept
          title="Limiares"
          example="com os valores padrão, um projeto com pontuação geral 0,82 recebe Escalar. Um com 0,55 recebe Pivotar. Um com 0,30 recebe Descontinuar."
        >
          Os limiares são a política de decisão do framework. Uma linha separa parar (Descontinuar) de ajustar (Pivotar).
          Outra linha separa ajustar (Pivotar) de escalar (Escalar). O framework já vem com valores padrão sensatos, os
          mesmos usados nos exemplos do artigo. Na maioria dos casos você não precisa alterá-los.
        </Concept>
      </>
    ),
  },
  {
    title: "Fase 1: indicadores e evidências",
    body: (
      <>
        <Concept title="Indicador" example="percentual de atendimentos refeitos por erro da IA, na dimensão de qualidade técnica.">
          Um indicador é uma medida numérica do efeito do MVP. Escolha de um a três indicadores por dimensão, até 12
          indicadores no total. Escolha indicadores ligados à hipótese de valor e que a organização já consegue medir.
        </Concept>
        <Concept title="Direção" example="no indicador de atendimentos refeitos, menor é melhor. No de respostas corretas, maior é melhor.">
          A direção diz se o indicador melhora quando o valor aumenta ou quando o valor diminui.
        </Concept>
        <Concept title="Linha de base, meta e valor observado" example="atendimentos refeitos tinham linha de base de 25%, meta de 10% e valor observado de 11% nos três meses do piloto.">
          A linha de base é o valor do indicador antes do MVP. A meta é o valor que se quer atingir. O valor observado é o
          valor medido no piloto, pelo mesmo método usado na linha de base.
        </Concept>
        <Concept title="Unidade" example="o tempo de atendimento é medido em minutos. Num indicador em percentual, digitar 15 ou 15% dá o mesmo valor.">
          A unidade diz em que medida o indicador é expresso: percentual, reais, minutos, horas, dias, pontos e outras.
        </Concept>
        <Concept title="Tipo de KPI" example="o percentual de atendentes que usam a IA é um indicador antecedente. O tempo de atendimento é um indicador de resultado.">
          Um indicador antecedente é um sinal inicial de que o efeito pode vir. Um indicador de resultado mede o próprio
          efeito buscado. Isso importa porque só indicadores de resultado sustentam uma recomendação de Escalar.
        </Concept>
        <Concept title="Peso na dimensão" example="na qualidade técnica, respostas corretas tem peso 0,60 e atendimentos refeitos tem peso 0,40.">
          O peso na dimensão diz quanto cada indicador importa dentro da sua dimensão. Os decisores distribuem 100 pontos
          entre os indicadores de uma mesma dimensão, como fazem com as dimensões.
        </Concept>
        <Concept title="Origem, período e responsável" example="o número veio do sistema de chamados, cobre os meses 1 a 3 do piloto e foi medido pelo supervisor do atendimento.">
          A evidência de cada indicador registra de onde veio o número, que período ele cobre e quem fez a medição.
        </Concept>
        <Concept title="Dado ausente" example="sem o valor observado de custo por atendimento, esse indicador sai do cálculo. Os pesos dos outros indicadores da dimensão são reajustados para somar 1.">
          Quando um indicador não tem medição, deixe o valor observado vazio. O indicador sai do cálculo. Um dado ausente
          nunca vira nota zero.
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
          Uma barreira é um requisito mínimo que nenhuma nota alta compensa. As quatro barreiras são confiabilidade
          (verificada com a operação), segurança (com a TI), privacidade (com o encarregado de dados) e conformidade legal e
          ética (com o jurídico).
        </Concept>
        <section>
          <h3 className="text-base font-semibold tracking-tight">As cinco etapas do formulário</h3>
          <ol className="mt-2 space-y-1.5 text-sm">
            {[
              ["Configuração", "caso, hipótese, pesos e limiares"],
              ["Indicadores", "até 12 indicadores, cada um com evidência"],
              ["Barreiras", "estado, evidência e plano de cada barreira"],
              ["Resultado", "pontuação geral, recomendação, gráfico e sensibilidade"],
              ["Decisão", "registro da decisão humana, que não muda depois de salvo"],
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
