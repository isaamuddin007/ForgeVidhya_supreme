export { SiteStore } from "./site-store";

/**
 * forgeVidhya backend — Cloudflare Worker entrypoint.
 *
 * Public API (JSON):
 *   GET  /ping                       health check
 *   POST /api/contact                { name, email, college?, branch?, message }
 *   POST /api/newsletter             { email }
 *   POST /api/enroll                 { courseSlug, name, email }
 *
 * Admin API (requires X-Admin-Key header matching the ADMIN_KEY env):
 *   GET  /api/admin/contacts         latest 200 contact messages
 *   GET  /api/admin/subscribers      latest 500 newsletter subscribers
 *   GET  /api/admin/enrollments      latest 500 enrollments
 *   GET  /api/admin/stats            row counts for all tables
 *
 * Signed-in users (Rork Auth bearer token) are stamped with X-Rork-User-Id
 * by the platform; the store records it alongside each row when present.
 */

type Env = {
  DO: Fetcher;
  ADMIN_KEY?: string;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
} as const;

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/** Dispatch a request into the global SiteStore DO, rewriting the path. */
function toStore(request: Request, env: Env, storePath: string): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = storePath;
  const wrapped = new Request(url.toString(), request);
  wrapped.headers.set("X-Rork-DO-Class", "SiteStore");
  wrapped.headers.set("X-Rork-DO-Id", "global");
  return env.DO.fetch(wrapped);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/ping") {
      return json({ ok: true, service: "forgevidhya-backend", now: new Date().toISOString() });
    }

    // ---- Public write endpoints ----
    if (request.method === "POST" && path === "/api/contact") {
      return withCors(await toStore(request, env, "/contact"));
    }
    if (request.method === "POST" && path === "/api/newsletter") {
      return withCors(await toStore(request, env, "/newsletter"));
    }
    if (request.method === "POST" && path === "/api/enroll") {
      return withCors(await toStore(request, env, "/enroll"));
    }

    // ---- Admin reads, gated by ADMIN_KEY ----
    if (request.method === "GET" && path.startsWith("/api/admin/")) {
      if (!env.ADMIN_KEY) {
        return json({ ok: false, error: "admin access is not configured (set the ADMIN_KEY env)" }, 503);
      }
      if (request.headers.get("X-Admin-Key") !== env.ADMIN_KEY) {
        return json({ ok: false, error: "unauthorized" }, 401);
      }
      const storePath = path.replace("/api/admin/", "/admin/");
      return withCors(await toStore(request, env, storePath));
    }

    return json({ ok: false, error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
