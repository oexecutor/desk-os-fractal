import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Context } from "@netlify/functions";

/**
 * Servidor HTTP mínimo para e2e local: não é `netlify dev`, mas invoca os
 * mesmos handlers reais de apps/functions/src/routes/*.ts sobre semântica
 * HTTP real (fetch de verdade, do navegador via Playwright), sem mocks
 * abaixo da camada HTTP. `netlify dev`/CLI não está disponível neste
 * ambiente sandbox — ver RELATÓRIO final para essa lacuna documentada.
 */
interface RouteDef {
  pattern: RegExp;
  paramNames: string[];
  modulePath: string;
}

function compilePath(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const regexSource = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { pattern: new RegExp(`^${regexSource}$`), paramNames };
}

const ROUTES: RouteDef[] = [
  { ...compilePath("/api/ingestions"), modulePath: "../../apps/functions/src/routes/ingestions.js" },
  { ...compilePath("/api/ingestions/:ingestionId"), modulePath: "../../apps/functions/src/routes/ingestion-detail.js" },
  { ...compilePath("/api/ingestions/:ingestionId/decompose"), modulePath: "../../apps/functions/src/routes/ingestion-decompose.js" },
  { ...compilePath("/api/plans/:planVersionId"), modulePath: "../../apps/functions/src/routes/plan-detail.js" },
  { ...compilePath("/api/plans/:planVersionId/review"), modulePath: "../../apps/functions/src/routes/plan-review.js" },
  { ...compilePath("/api/plans/:planVersionId/approve"), modulePath: "../../apps/functions/src/routes/plan-approve.js" },
  { ...compilePath("/api/plans/:planVersionId/activate"), modulePath: "../../apps/functions/src/routes/plan-activate.js" },
  { ...compilePath("/api/workspaces/:workspaceId/tree"), modulePath: "../../apps/functions/src/routes/workspace-tree.js" },
  { ...compilePath("/api/commands"), modulePath: "../../apps/functions/src/routes/commands.js" },
  { ...compilePath("/api/print-snapshots"), modulePath: "../../apps/functions/src/routes/print-snapshots.js" },
  { ...compilePath("/api/print-snapshots/:snapshotId/html"), modulePath: "../../apps/functions/src/routes/print-snapshot-html.js" },
  { ...compilePath("/api/qr/tokens"), modulePath: "../../apps/functions/src/routes/qr-tokens.js" },
  { ...compilePath("/api/qr/:token/resolve"), modulePath: "../../apps/functions/src/routes/qr-resolve.js" },
  { ...compilePath("/api/qr/:token/execute"), modulePath: "../../apps/functions/src/routes/qr-execute.js" },
];

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export function startDevApiServer(port: number) {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      const route = ROUTES.find((r) => r.pattern.test(url.pathname));
      if (!route) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Rota não encontrada." } }));
        return;
      }

      const match = route.pattern.exec(url.pathname)!;
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1] ?? "");
      });

      const { default: handler } = (await import(route.modulePath)) as {
        default: (request: Request, context: Context) => Promise<Response>;
      };

      const body =
        req.method !== "GET" && req.method !== "HEAD" ? await readBody(req) : undefined;
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers.set(key, value);
      }

      const request = new Request(url, {
        method: req.method,
        headers,
        ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
      } as RequestInit);

      const response = await handler(request, { params } as Context);
      const responseBody = Buffer.from(await response.arrayBuffer());
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      res.writeHead(response.status, responseHeaders);
      res.end(responseBody);
    } catch (err) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: { code: "STORAGE_UNAVAILABLE", message: String(err) } }));
    }
  });

  return new Promise<{ close: () => Promise<void> }>((resolve) => {
    server.listen(port, () => {
      resolve({
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}
