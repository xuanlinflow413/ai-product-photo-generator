import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import worker from "../out/_worker.js";

const root = join(process.cwd(), "out");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const env = {
  AUTH_MODE: "development",
  PAYMENT_PROVIDER: "unconfigured",
  SESSION_SECRET: "local-http-test-session",
  WEBHOOK_SECRET: "local-http-test-webhook",
  DB: { prepare() { throw new Error("DB should not be reached by anonymous HTTP checks"); } },
  ASSETS: {
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      const relative = pathname === "/" ? "index.html" : `${pathname.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
      try {
        const file = join(root, relative);
        return new Response(await readFile(file), { headers: { "content-type": mime[extname(file)] || "application/octet-stream" } });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  },
};

const server = createServer(async (incoming, outgoing) => {
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const request = new Request(`http://127.0.0.1:${process.env.PORT || 4173}${incoming.url}`, {
    method: incoming.method,
    headers: incoming.headers,
    body: ["GET", "HEAD"].includes(incoming.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await worker.fetch(request, env);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
});
server.listen(Number(process.env.PORT || 4173), "127.0.0.1");
