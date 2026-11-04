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
