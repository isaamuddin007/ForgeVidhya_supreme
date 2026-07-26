import { DurableObject } from "cloudflare:workers";

/**
 * SiteStore — the single durable database for forgeVidhya.
 * One global instance (id "global") owns three tables:
 *   - contacts:    contact-form submissions
 *   - subscribers: newsletter emails (deduped)
 *   - enrollments: program/course interest sign-ups
 */
export class SiteStore extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        college TEXT NOT NULL DEFAULT '',
        branch TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL,
        user_id TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        user_id TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        user_id TEXT,
        created_at INTEGER NOT NULL,
        UNIQUE (course_slug, email)
      );
    `);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const userId = request.headers.get("X-Rork-User-Id");

    try {
      if (request.method === "POST" && path === "/contact") {
        const body = (await request.json()) as Partial<{
          name: string;
          email: string;
          college: string;
          branch: string;
          message: string;
        }>;
        const name = (body.name ?? "").trim();
        const email = (body.email ?? "").trim().toLowerCase();
        const message = (body.message ?? "").trim();
        if (!name || !isEmail(email) || !message) {
          return json({ ok: false, error: "name, valid email, and message are required" }, 400);
        }
        if (message.length > 5000 || name.length > 200) {
          return json({ ok: false, error: "message too long" }, 400);
        }
        this.ctx.storage.sql.exec(
          `INSERT INTO contacts (name, email, college, branch, message, user_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          name,
          email,
          (body.college ?? "").trim().slice(0, 200),
          (body.branch ?? "").trim().slice(0, 200),
          message,
          userId,
          Date.now(),
        );
        console.log("contact saved:", email);
        return json({ ok: true });
      }

      if (request.method === "POST" && path === "/newsletter") {
        const body = (await request.json()) as Partial<{ email: string }>;
        const email = (body.email ?? "").trim().toLowerCase();
        if (!isEmail(email)) {
          return json({ ok: false, error: "a valid email is required" }, 400);
        }
        const existing = this.ctx.storage.sql
          .exec<{ id: number }>("SELECT id FROM subscribers WHERE email = ?", email)
          .toArray();
        if (existing.length > 0) {
          return json({ ok: true, alreadySubscribed: true });
        }
        this.ctx.storage.sql.exec(
          "INSERT INTO subscribers (email, user_id, created_at) VALUES (?, ?, ?)",
          email,
          userId,
          Date.now(),
        );
        console.log("newsletter subscribe:", email);
        return json({ ok: true, alreadySubscribed: false });
      }

      if (request.method === "POST" && path === "/enroll") {
        const body = (await request.json()) as Partial<{
          courseSlug: string;
          name: string;
          email: string;
        }>;
        const courseSlug = (body.courseSlug ?? "").trim();
        const name = (body.name ?? "").trim();
        const email = (body.email ?? "").trim().toLowerCase();
        if (!courseSlug || !name || !isEmail(email)) {
          return json({ ok: false, error: "courseSlug, name, and a valid email are required" }, 400);
        }
        const existing = this.ctx.storage.sql
          .exec<{ id: number }>(
            "SELECT id FROM enrollments WHERE course_slug = ? AND email = ?",
            courseSlug,
            email,
          )
          .toArray();
        if (existing.length > 0) {
          return json({ ok: true, alreadyEnrolled: true });
        }
        this.ctx.storage.sql.exec(
          "INSERT INTO enrollments (course_slug, name, email, user_id, created_at) VALUES (?, ?, ?, ?, ?)",
          courseSlug,
          name,
          email,
          userId,
          Date.now(),
        );
        console.log("enrollment saved:", courseSlug, email);
        return json({ ok: true, alreadyEnrolled: false });
      }

      // ---- Admin reads (Worker gates these behind the admin key) ----
      if (request.method === "GET" && path === "/admin/contacts") {
        const rows = this.ctx.storage.sql
          .exec("SELECT * FROM contacts ORDER BY id DESC LIMIT 200")
          .toArray();
        return json({ ok: true, contacts: rows });
      }
      if (request.method === "GET" && path === "/admin/subscribers") {
        const rows = this.ctx.storage.sql
          .exec("SELECT * FROM subscribers ORDER BY id DESC LIMIT 500")
          .toArray();
        return json({ ok: true, subscribers: rows });
      }
      if (request.method === "GET" && path === "/admin/enrollments") {
        const rows = this.ctx.storage.sql
          .exec("SELECT * FROM enrollments ORDER BY id DESC LIMIT 500")
          .toArray();
        return json({ ok: true, enrollments: rows });
      }
      if (request.method === "GET" && path === "/admin/stats") {
        const count = (table: string): number => {
          const rows = this.ctx.storage.sql
            .exec<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`)
            .toArray();
          return rows[0]?.n ?? 0;
        };
        return json({
          ok: true,
          stats: {
            contacts: count("contacts"),
            subscribers: count("subscribers"),
            enrollments: count("enrollments"),
          },
        });
      }

      return json({ ok: false, error: "not found" }, 404);
    } catch (err) {
      console.error("SiteStore error:", err instanceof Error ? err.message : String(err));
      return json({ ok: false, error: "internal error" }, 500);
    }
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 320;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
