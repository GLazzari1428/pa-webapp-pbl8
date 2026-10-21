"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Tutorial de onboarding, adaptado de pbl6/04_Tutorial.md.
 * Na primeira visita é obrigatório ir até a última página; depois disso pode ser pulado.
 */
const PAGES: { title: string; body: ReactNode }[] = [
  {
    title: "Para que serve este framework",
    body: (
      <>
        <p>
          O framework apoia a decisão de <strong>Escalar</strong>, <strong>Pivotar</strong> (refinar) ou{" "}
          <strong>Descontinuar</strong> uma iniciativa de IA depois do MVP ou piloto. Ele combina indicadores técnicos,
          econômicos, operacionais e de governança numa pontuação <em>S</em> de 0 a 1, verifica barreiras que nenhuma
          nota compensa e registra a decisão humana com justificativa.
        </p>
        <p>
          O uso tem duas fases: <strong>coletar os dados</strong> com as áreas da organização e, depois,{" "}
          <strong>preencher</strong> este formulário. Os exemplos vêm do Caso A, um assistente de atendimento baseado em
          LLM testado num piloto de três meses.
        </p>
        <p className="rounded-md bg-muted p-3 text-sm">
          A recomendação é um apoio, não uma decisão automática. Os limiares e pesos são parâmetros declarados, não
          valores extraídos da literatura, e a ferramenta não estima incerteza estatística das medições.
        </p>
      </>
    ),
  },
  {
    title: "Fase 1 — antes de abrir o formulário: hipótese, pesos e limiares",
    body: (
      <ol className="list-decimal space-y-3 pl-5">
        <li>
          <strong>Hipótese de valor.</strong> O resultado que o projeto prometeu quando o MVP foi aprovado, tirado da
          proposta ou do business case, numa frase com número. Caso A: reduzir o tempo médio de atendimento de 12 para
          8 minutos sem piorar a qualidade nem a conformidade. Escolha também qual indicador mede essa promessa.
        </li>
        <li>
          <strong>Pesos das dimensões.</strong> São quatro dimensões: qualidade técnica; eficiência econômica; valor
          operacional e adoção; prontidão, risco e governança. Cada decisor (negócio, TI, segurança ou jurídico)
          distribui 100 pontos entre elas; a média de cada dimensão ÷ 100 é o peso. Sem consenso, use 0,25 para todas.
          Defina os pesos <em>antes</em> de ver os resultados.
        </li>
        <li>
          <strong>Limiares.</strong> Com os valores de referência, S ≥ 0,70 indica Escalar; de 0,40 até abaixo de 0,70,
          Pivotar; abaixo de 0,40, Descontinuar (salvo se a perda estiver concentrada numa dimensão corrigível). A
          distância de fronteira (0,05) marca resultados perto de um limiar.
        </li>
      </ol>
    ),
  },
  {
    title: "Fase 1 — indicadores e evidências",
    body: (
      <>
        <p>
          Um indicador é uma medida numérica do efeito do MVP. Escolha de um a três por dimensão (até 12 no total), a
          partir da hipótese, e só os que a organização já consegue medir. Para cada um, colete:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Direção</strong>: melhor quando maior ou melhor quando menor.
          </li>
          <li>
            <strong>Linha de base</strong> (antes do MVP), <strong>meta</strong> e <strong>valor observado</strong> no
            piloto, medido pelo mesmo método da base.
          </li>
          <li>
            <strong>Unidade</strong> (%, R$, minutos, horas, dias, pontos…). Percentuais podem ser digitados como 15 ou
            15%.
          </li>
          <li>
            <strong>Tipo de KPI</strong>: antecedente (sinal inicial, ex.: % de atendentes que usam a IA) ou resultado
            (o efeito, ex.: tempo de atendimento).
          </li>
          <li>
            <strong>Origem, período e responsável</strong> pela medição. Ex.: atendimentos refeitos — base 25%, meta
            10%, observado 11%, sistema de chamados, meses 1 a 3, supervisor do atendimento.
          </li>
          <li>
            <strong>Peso na dimensão</strong>: os mesmos 100 pontos distribuídos entre os indicadores da dimensão.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Falta um dado? Deixe o valor observado vazio: o indicador sai do cálculo e os pesos da dimensão são
          renormalizados. Ausência nunca vira nota zero.
        </p>
      </>
    ),
  },
  {
    title: "Fase 1 — barreiras e Fase 2 — preenchimento",
    body: (
      <>
        <p>
          <strong>Barreiras</strong> são requisitos mínimos que nenhuma nota compensa: confiabilidade (com a operação),
          segurança (com a TI), privacidade (com o encarregado de dados) e conformidade legal e ética (com o jurídico).
          Só marque <em>Atendida</em> com um documento que comprove; sem verificação, use <em>Não avaliada</em>.
        </p>
        <p>O formulário segue cinco etapas, uma por vez:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Configuração — caso, hipótese, pesos e limiares.</li>
          <li>Indicadores — até 12, com evidência de cada um.</li>
          <li>Barreiras — estado, evidência e plano.</li>
          <li>Resultado — pontuação, recomendação, gráfico e sensibilidade aos pesos.</li>
          <li>Decisão — registro humano, que fica congelado após salvo (reabrir gera nova versão).</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Tudo fica salvo apenas neste navegador. Exporte o caso em JSON para guardar ou compartilhar, e o resultado em
          PDF pela impressão do navegador.
        </p>
      </>
    ),
  },
];

export function Onboarding({ seenBefore, onDone }: { seenBefore: boolean; onDone: () => void }) {
  const [page, setPage] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = page === PAGES.length - 1;
  useEffect(() => headingRef.current?.focus(), [page]);

  return (
    <section aria-labelledby="onb-title" className="mx-auto w-full max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Tutorial · página {page + 1} de {PAGES.length}
      </p>
      <Progress value={((page + 1) / PAGES.length) * 100} aria-label="Progresso do tutorial" className="my-3" />
      <h2 id="onb-title" ref={headingRef} tabIndex={-1} className="mb-4 text-xl font-semibold outline-none">
        {PAGES[page].title}
      </h2>
      <div className="space-y-3 leading-relaxed">{PAGES[page].body}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          {seenBefore ? (
            <Button variant="ghost" onClick={onDone}>
              Pular tutorial
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Na primeira visita, percorra o tutorial até o fim.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
            Anterior
          </Button>
          {last ? (
            <Button onClick={onDone}>Entendi, começar</Button>
          ) : (
            <Button onClick={() => setPage((p) => p + 1)}>Próximo</Button>
          )}
        </div>
      </div>
    </section>
  );
}
