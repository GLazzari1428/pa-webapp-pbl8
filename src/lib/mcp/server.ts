import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { evaluateCase } from "../engine/engine";
import { DIMENSION_LABELS } from "../engine/types";
import { EXAMPLE_CASES } from "../data/examples";
import { HELP } from "../help";
import { newCase } from "../storage";
import { caseInputSchema } from "./schema";

const INSTRUCTIONS = `Você conduz o preenchimento do framework de decisão pós-MVP (Escalar, Pivotar ou Descontinuar).
1. Chame guia_de_perguntas e modelo_de_caso.
2. Pergunte ao usuário, etapa por etapa (configuração, indicadores, barreiras), usando as perguntas do guia. Nunca invente valores: se o usuário não tem o dado, deixe observed como null.
3. Chame validar_caso e peça ao usuário só o que estiver em pendencias, até a lista ficar vazia.
4. Chame avaliar_caso e explique o resultado em linguagem simples, dizendo se a faixa por pontuação difere da recomendação e por quê.
5. A decisão final é humana e é registrada na aplicação web. Este servidor não grava nada.
Não envie dados sigilosos: o servidor não os armazena, mas o endpoint é público.`;

const text = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });

type Caso = z.infer<typeof caseInputSchema>;

function pendencias(caso: Caso) {
  const r = evaluateCase(caso as Parameters<typeof evaluateCase>[0]);
  const todas = [...r.configIssues, ...r.indicatorIssues, ...r.barrierIssues];
  return {
    r,
    lista: todas.map((i) => ({ alvo: i.targetId, campo: i.field, mensagem: i.message })),
  };
}

export function createFrameworkServer(): McpServer {
  const server = new McpServer({ name: "framework-pos-mvp", version: "1.0.0" }, { instructions: INSTRUCTIONS });

  server.registerTool(
    "guia_de_perguntas",
    { title: "Guia de perguntas", description: "Devolve as dimensões, as cinco etapas e a pergunta de cada campo, com exemplo." },
    async () =>
      text({
        dimensoes: DIMENSION_LABELS,
        etapas: ["Configuração", "Indicadores", "Barreiras", "Resultado", "Decisão (humana, fora deste servidor)"],
        perguntas: HELP,
      }),
  );

  server.registerTool(
    "modelo_de_caso",
    { title: "Modelo de caso", description: "Devolve um caso vazio com as quatro barreiras padrão, pronto para ser preenchido." },
    async () => {
      const c = newCase();
      return text({ config: c.config, indicators: c.indicators, barriers: c.barriers });
    },
  );

  server.registerTool(
    "listar_exemplos",
    { title: "Exemplos", description: "Lista os três casos do artigo (Caso A, Conectahit, Squad de Negociação)." },
    async () => text(EXAMPLE_CASES.map((c) => ({ id: c.id, nome: c.config.name, tipoDeDado: c.config.dataType }))),
  );

  server.registerTool(
    "validar_caso",
    {
      title: "Validar caso",
      description: "Aponta o que falta ou está inconsistente, com alvo, campo e mensagem. Não calcula recomendação.",
      inputSchema: { caso: caseInputSchema },
    },
    async ({ caso }) => {
      const { lista } = pendencias(caso);
      return text({ valido: lista.length === 0, pendencias: lista });
    },
  );

  server.registerTool(
    "avaliar_caso",
    {
      title: "Avaliar caso",
      description: "Calcula pontuação, faixa, recomendação, fronteira e sensibilidade aos pesos com o mesmo motor da aplicação web.",
      inputSchema: { caso: caseInputSchema },
    },
    async ({ caso }) => {
      const { r, lista } = pendencias(caso);
      return text({
        escore: r.score,
        faixa: r.outcome.band,
        recomendacao: r.outcome.recommendation,
        recomendacaoPendente: r.outcome.pending,
        fronteira: r.borderline,
        explicacao: r.explanation,
        dimensoes: r.dimensions.map((d) => ({ dimensao: d.dimension, nota: d.score, cobertura: d.coverage, peso: d.weight })),
        sensibilidade: {
          minimo: r.sensitivity.min,
          maximo: r.sensitivity.max,
          mudancasDeFaixa: r.sensitivity.bandChanges,
          mudancasDeSaida: r.sensitivity.outputChanges,
          estavel: r.sensitivity.stable,
          distribuicao: r.sensitivity.distribution,
          rotulo: r.sensitivity.label,
        },
        pendencias: lista,
      });
    },
  );

  return server;
}
