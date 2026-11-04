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
