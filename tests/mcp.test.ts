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
