# CHANGES_V7: servidor MCP

Leia este arquivo inteiro antes de agir. Execute M0 a M7 na ordem. Pule M8 e M9 (o orquestrador faz). Rodada nova do webapp; não altere o motor de cálculo (`src/lib/engine`), a interface, os dados de exemplo nem os 21 testes existentes. Só adicione arquivos novos, mais as edições listadas em M1 e M7.

Regras de estilo para qualquer texto que você escrever (README, MELHORIAS, comentários, mensagens):
1. Nunca use travessão (em dash). Use vírgula, ponto ou dois pontos.
2. Nunca use o caractere de barra vertical em texto nem tabelas markdown. Use prosa ou listas simples.
3. Nunca escreva itens no formato "**Rótulo em negrito:** texto". Use prosa.
4. Português do Brasil, frases curtas, sem jargão desnecessário.

Faça commits pequenos conforme M1 a M7. Ao final, rode `npm run build`, `npm test` e `npm run lint` e confirme que passam. Se algo da instrução não bater com o código real, ajuste ao código real, explique em uma frase no commit e siga.

## Parte MCP: servidor MCP dentro da aplicação web (tarefas M0 a M9)

Decisão de arquitetura. O servidor MCP vive na própria aplicação Next.js, em `pbl8/webapp`, na rota `POST /api/mcp`, transporte Streamable HTTP sem estado. Ele importa o mesmo motor (`src/lib/engine/engine.ts`), então não existe segunda implementação das regras (DRY) e os 21 testes continuam sendo a verdade. Ele expõe cinco ferramentas e não grava nada: a decisão humana continua só na interface web. Não há stdio, nem autenticação, nem recursos, nem prompts (YAGNI); o texto de `instructions` do servidor ensina o assistente a conduzir a entrevista.

Fatos já conferidos no repositório: o SDK `@modelcontextprotocol/sdk` 1.32.1 está em `node_modules` só como dependência transitiva do `shadcn`, então precisa virar dependência direta; `zod` 4.6.7 também é transitivo; a classe `WebStandardStreamableHTTPServerTransport` existe em `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js` e aceita `sessionIdGenerator: undefined` (modo sem estado) e `enableJsonResponse: true`; `McpServer.registerTool` existe e `tool()` está depreciado; `InMemoryTransport.createLinkedPair()` existe para teste; o `vitest.config.mts` não tem alias `@/`, então tudo que os testes importam usa caminho relativo; `next.config.ts` liga `cacheComponents`, e a documentação local diz que `POST` em Route Handler não é cacheado. O `AGENTS.md` do webapp manda ler `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` antes de escrever a rota (M5 faz isso).

M0. Congelar a versão do PBL8 e abrir ramo.

```
cd /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp
git status --short
git tag pbl8-final
git rev-parse --short HEAD
git switch -c pbl9-mcp
```

Saída esperada: `git status --short` vazio (se não estiver vazio, parar e perguntar ao usuário), um hash curto, e `Switched to a new branch 'pbl9-mcp'`. Anotar o hash: ele vai para o artigo como a versão avaliada em E1.

M1. Tornar o SDK e o zod dependências diretas.

```
cd /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp
npm install @modelcontextprotocol/sdk@1.32.2 zod@4.6.7
npm test 2>&1 | tail -5
git add package.json package-lock.json
git commit -m "chore: dependências diretas do MCP (sdk e zod)"
```

Saída esperada: `Tests  21 passed (21)`. Se o npm recusar a 1.32.2, usar `npm view @modelcontextprotocol/sdk version` e a versão que ele devolver.

M2. Escrever o teste que falha (vermelho). Arquivo novo `pbl8/webapp/tests/mcp.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createFrameworkServer } from "../src/lib/mcp/server";
import { evaluateCase } from "../src/lib/engine/engine";
import { CASO_A, CONECTAHIT, SQUAD } from "../src/lib/data/examples";

async function connect() {
  const server = createFrameworkServer();
  const client = new Client({ name: "teste", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  return client;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payload = (res: any) => JSON.parse(res.content[0].text);
const input = (c: typeof CASO_A) => ({ config: c.config, indicators: c.indicators, barriers: c.barriers });

describe("servidor MCP do framework", () => {
  it("expõe as cinco ferramentas", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      ["avaliar_caso", "guia_de_perguntas", "listar_exemplos", "modelo_de_caso", "validar_caso"],
    );
  });

  it("avaliar_caso reproduz os três escores do artigo pelo caminho do MCP", async () => {
    const client = await connect();
    const esperado: [typeof CASO_A, number, string, string][] = [
      [CASO_A, 0.656, "Pivotar", "Pivotar"],
      [CONECTAHIT, 0.6146, "Pivotar", "Pivotar"],
      [SQUAD, 0.7847, "Escalar", "Pivotar"],
    ];
    for (const [c, score, faixa, rec] of esperado) {
      const r = payload(await client.callTool({ name: "avaliar_caso", arguments: { caso: input(c) } }));
      expect(Math.abs(r.escore - score)).toBeLessThan(0.0005);
      expect(r.faixa).toBe(faixa);
      expect(r.recomendacao).toBe(rec);
      expect(r.escore).toBeCloseTo(evaluateCase(c).score, 12);
    }
  });

  it("validar_caso lista o que falta num modelo vazio, com campo e mensagem", async () => {
    const client = await connect();
    const modelo = payload(await client.callTool({ name: "modelo_de_caso", arguments: {} }));
    expect(modelo.barriers).toHaveLength(4);
    expect(modelo.indicators).toHaveLength(0);
    const r = payload(await client.callTool({ name: "validar_caso", arguments: { caso: modelo } }));
    expect(r.valido).toBe(false);
    expect(r.pendencias.length).toBeGreaterThan(0);
    expect(r.pendencias[0]).toHaveProperty("campo");
    expect(r.pendencias[0]).toHaveProperty("mensagem");
  });

  it("validar_caso aceita os três casos do artigo", async () => {
    const client = await connect();
    for (const c of [CASO_A, CONECTAHIT, SQUAD]) {
      const r = payload(await client.callTool({ name: "validar_caso", arguments: { caso: input(c) } }));
      expect(r.pendencias).toEqual([]);
      expect(r.valido).toBe(true);
    }
  });

  it("guia_de_perguntas traz as quatro dimensões e os textos de ajuda", async () => {
    const client = await connect();
    const g = payload(await client.callTool({ name: "guia_de_perguntas", arguments: {} }));
    expect(Object.keys(g.dimensoes)).toEqual(["tecnica", "economica", "operacional", "governanca"]);
    expect(g.perguntas.baseline).toContain("antes do MVP");
    expect(g.etapas).toHaveLength(5);
  });

  it("listar_exemplos devolve os três casos com id e nome", async () => {
    const client = await connect();
    const l = payload(await client.callTool({ name: "listar_exemplos", arguments: {} }));
    expect(l.map((x: { id: string }) => x.id)).toEqual(
      ["exemplo-caso-a", "exemplo-conectahit", "exemplo-squad-negociacao"],
    );
  });
});
```

Conferir antes: `grep -n "id:" /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp/src/lib/data/examples.ts | head -3` para confirmar o id real do Caso A (o Conectahit é `exemplo-conectahit` e o Squad é `exemplo-squad-negociacao`; se o do Caso A não for `exemplo-caso-a`, corrigir o teste). Rodar:

```
cd /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp && npx vitest run tests/mcp.test.ts 2>&1 | tail -8
```

Saída esperada (vermelho): falha de importação de `../src/lib/mcp/server`. Commit: `git add tests/mcp.test.ts && git commit -m "test: contrato do servidor MCP (falhando)"`.

M3. Esquema de entrada. Arquivo novo `pbl8/webapp/src/lib/mcp/schema.ts`:

```ts
import { z } from "zod";
import { DIMENSIONS } from "../engine/types";

const dim = z.enum(DIMENSIONS);
const num = z.number().nullable();

export const indicatorSchema = z.object({
  id: z.string(),
  dimension: dim,
  name: z.string(),
  kpiType: z.enum(["antecedente", "resultado"]),
  direction: z.enum(["maior", "menor"]),
  unit: z.enum(["percentual", "moeda", "minutos", "horas", "dias", "pontos", "unidade", "outra"]),
  customUnit: z.string().optional(),
  baseline: num,
  target: num,
  observed: num,
  weight: num,
  evidenceSource: z.string(),
  evidencePeriod: z.string(),
  evidenceOwner: z.string(),
  binaryCriterion: z.string().optional(),
  binaryMet: z.boolean().nullable().optional(),
});

export const barrierSchema = z.object({
  id: z.string(),
  name: z.string(),
  criterion: z.string(),
  status: z.enum(["atendida", "em_tratamento", "violada", "nao_avaliada"]),
  evidence: z.string(),
  plan: z.string(),
  planApproved: z.boolean(),
  owner: z.string(),
});

export const configSchema = z.object({
  name: z.string(),
  context: z.string(),
  dataType: z.enum(["real", "referencia", "simulado"]),
  period: z.string(),
  owners: z.string(),
  hypothesis: z.object({ text: z.string(), indicatorId: z.string().nullable(), target: num }),
  weights: z.object({ tecnica: z.number(), economica: z.number(), operacional: z.number(), governanca: z.number() }),
  thresholds: z.object({ lower: z.number(), scale: z.number(), border: z.number(), variation: z.number() }),
  correctableLoss: z.enum(["sim", "nao"]).nullable(),
  correctableDimension: dim.nullable(),
  correctableRationale: z.string(),
});

export const caseInputSchema = z.object({
  config: configSchema,
  indicators: z.array(indicatorSchema),
  barriers: z.array(barrierSchema),
});
```

Sem teste próprio: ele é exercitado pelos testes de M2. Commit junto com M4.

M4. Implementar o servidor (verde). Arquivo novo `pbl8/webapp/src/lib/mcp/server.ts`:

```ts
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
```

Rodar `npx vitest run tests/mcp.test.ts 2>&1 | tail -8`. Saída esperada: `6 passed`. Se `registerTool` rejeitar o tipo de `inputSchema`, abrir `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts` (linha 161) e ajustar à assinatura real, sem trocar para a API depreciada. Se `HELP.baseline` não contiver "antes do MVP", corrigir a expectativa para um trecho real de `src/lib/help.ts` (a linha 28 diz "O valor do indicador antes do MVP"). Commit: `git add src/lib/mcp tests/mcp.test.ts && git commit -m "feat: servidor MCP com cinco ferramentas sobre o motor único"`.

M5. Rota HTTP. Primeiro ler a documentação local da versão do Next:

```
sed -n 1,120p /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
```

Teste vermelho, arquivo novo `pbl8/webapp/tests/mcp-route.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { POST, GET } from "../src/app/api/mcp/route";

const H = { "content-type": "application/json", accept: "application/json, text/event-stream" };
const post = (body: unknown) =>
  POST(new Request("http://localhost/api/mcp", { method: "POST", headers: H, body: JSON.stringify(body) }));

describe("rota /api/mcp", () => {
  it("responde initialize e lista as ferramentas, sem sessão", async () => {
    const init = await post({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } },
    });
    expect(init.status).toBe(200);
    const lista = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const j = await lista.json();
    expect(j.result.tools.map((t: { name: string }) => t.name)).toContain("avaliar_caso");
  });

  it("GET não é suportado (servidor sem estado)", async () => {
    const r = await GET();
    expect(r.status).toBe(405);
  });
});
```

Rodar `npx vitest run tests/mcp-route.test.ts 2>&1 | tail -6`; esperado vermelho por módulo inexistente. Implementar `pbl8/webapp/src/app/api/mcp/route.ts`, com caminho relativo (o Vitest não resolve `@/`):

```ts
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createFrameworkServer } from "../../../lib/mcp/server";

export async function POST(request: Request): Promise<Response> {
  const server = createFrameworkServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

const naoSuportado = () =>
  Response.json({ jsonrpc: "2.0", error: { code: -32000, message: "Método não suportado: servidor sem estado." }, id: null }, { status: 405 });

export async function GET(): Promise<Response> {
  return naoSuportado();
}
export async function DELETE(): Promise<Response> {
  return naoSuportado();
}
```

Rodar de novo; esperado `2 passed`. Se `initialize` for rejeitado em modo sem estado, o erro dirá o motivo; ajustar o teste ao comportamento documentado no `.d.ts` (linhas 120 a 175 de `webStandardStreamableHttp.d.ts`), nunca desligar a validação. Commit: `git add src tests && git commit -m "feat: rota POST /api/mcp (Streamable HTTP sem estado)"`.

M6. Verificar de ponta a ponta com o servidor de produção local.

```
cd /home/glazzari/PUC/pesquisa_aplicada/pbl8/webapp
npm run lint 2>&1 | tail -5
npm run build 2>&1 | tail -25
(npm start -- -p 3100 >/home/glazzari/.hermes/cache/scratch/mcp-start.log 2>&1 &) ; sleep 6
curl -s -X POST http://localhost:3100/api/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 600
```

Saída esperada: lint sem erros, build terminando sem erro com a rota `/api/mcp` listada como dinâmica, e o JSON do `curl` contendo `avaliar_caso`. Encerrar o servidor depois: `pkill -f "next start -p 3100"`. Se o build quebrar por causa de `cacheComponents`, não desligar a opção: ler `route.md` de novo e usar o mecanismo que a documentação indicar.

M7. Documentar o uso. Em `pbl8/webapp/README.md`, acrescentar a seção "Servidor MCP" com: endpoint `/api/mcp`, as cinco ferramentas, o aviso de que não grava nada e é público, e os comandos de conexão:

```
claude mcp add --transport http framework-pos-mvp http://localhost:3000/api/mcp
codex mcp add framework-pos-mvp --url http://localhost:3000/api/mcp
```

Para clientes sem suporte a HTTP: `npx mcp-remote http://localhost:3000/api/mcp`. Em `MELHORIAS.md`, acrescentar "Versão 7: servidor MCP" com o que mudou e as limitações do plano (sem autenticação, assistente pode transcrever errado). Conferir: `grep -c "Servidor MCP" README.md` devolve `1` ou mais. Commit: `docs: servidor MCP no README e em MELHORIAS`.

M8 (NÃO EXECUTAR, o orquestrador faz). Teste manual real com um assistente, uma vez, antes da avaliação: com o servidor rodando em `npm run dev`, registrar o MCP no Claude Code (comando acima), abrir uma sessão e pedir "avalie o caso Squad de Negociação usando o framework". Saída esperada: o assistente chama `guia_de_perguntas`, pergunta ao usuário, chama `validar_caso` e `avaliar_caso`. Se não chamar nessa ordem, ajustar apenas o texto de `INSTRUCTIONS` e o teste continua verde.
