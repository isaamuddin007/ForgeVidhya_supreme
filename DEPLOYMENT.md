# forgeVidhya — Deployment Runbook

This repo is **deploy-ready**. The steps below are the parts only you can do
(account creation + entering secrets). Everything else — build configs, the
Render blueprint, security hardening — is already committed.

Target stack: **Render** (API web service + static SPA) + **CockroachDB Cloud**
(PostgreSQL). Auth is email/password with stateless JWTs (mobile-number sign-in
is planned next).

---

## What's already done

- ✅ Backend (Express + CockroachDB) — email/password JWT auth, uploads, security middleware
- ✅ Frontend (`web/`, React + Vite + TS) — builds cleanly to `web/dist`
- ✅ `render.yaml` blueprint for both services
- ✅ `Dockerfile` (alternative to Render, for a VPS)
- ✅ Schema auto-applied on boot (`backend/db/schema.sql`, idempotent)
- ✅ Secrets kept out of git (`.env` ignored; Render uses `sync: false`)

---

## Step 1 — Provision CockroachDB Cloud (least-privilege)

1. Create a free (Serverless) cluster at https://cockroachlabs.cloud.
2. Create a database `forgevidhya` and a SQL user **`forgevidhya_app`** with
   privileges on that database only (NOT the `root`/admin user).
3. **Connect** → copy the connection string (choose the "General connection
   string" / parameters form):
   `postgresql://forgevidhya_app:<pwd>@<host>:26257/forgevidhya?sslmode=verify-full`
4. The tables (`users`, `sketches`) are created automatically on first boot from
   `backend/db/schema.sql` — no manual migration needed.

## Step 2 — Generate the app secret

```bash
openssl rand -base64 48   # JWT_SECRET
```

## Step 3 — (Optional) DeepSeek AI key

The floating AI assistant proxies through the backend. Get a key at
https://platform.deepseek.com/ and set `DEEPSEEK_API_KEY` (Step 5). If unset, the
assistant returns a friendly "not configured" message and the rest of the site
works normally.

## Step 4 — Push to GitHub

```bash
git remote add origin https://github.com/<you>/forgevidhya.git
git branch -M main
git push -u origin main
```

## Step 5 — Deploy on Render

1. Render Dashboard → **New → Blueprint** → select the repo. It reads
   `render.yaml` and creates **forgevidhya-api** and **forgevidhya-web**.
2. On **forgevidhya-api**, set the `sync: false` env vars:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | the CockroachDB string from Step 1 |
   | `JWT_SECRET` | the value from Step 2 |
   | `DEEPSEEK_API_KEY` | your DeepSeek key from Step 3 (optional) |
   | `CLIENT_ORIGIN` | the web URL, e.g. `https://forgevidhya-web.onrender.com` |
   | `COOKIE_DOMAIN` | leave blank unless API + web share a parent domain |
3. On **forgevidhya-web**, set:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | the API **origin**, e.g. `https://forgevidhya-api.onrender.com` (no `/api` suffix) |
4. Trigger deploy. First build installs deps and builds the SPA.

## Step 6 — Wire the two together

- **Auth is a stateless 7-day JWT** sent as an `Authorization: Bearer` header
  (the SPA stores it in localStorage). This works cross-origin with no
  cross-site-cookie caveats — just make sure:
  - `VITE_API_URL` = the API origin (the SPA posts to `${VITE_API_URL}/auth/login`).
  - `CLIENT_ORIGIN` exactly matches the SPA origin, or CORS will block API calls.
- **Sketch uploads** (`/api/uploads`) still use a CSRF cookie. If you exercise that
  feature across two different Render origins, either front both with one custom
  domain (below) or relax `sameSite` for the CSRF cookie.

## Step 7 — Custom domain + HTTPS (forgevidhya.in)

1. Render → each service → **Settings → Custom Domains** → add
   `forgevidhya.in` (web) and `api.forgevidhya.in` (API).
2. Add the shown DNS records at your registrar. Render issues TLS automatically.
3. Update `CLIENT_ORIGIN` and `VITE_API_URL` to the custom domains, then redeploy.

---

## Pre-go-live checklist

1. Rotate every secret — no `CHANGE_ME` / placeholders remain.
2. CockroachDB user is scoped to the `forgevidhya` DB only (not root/admin).
3. HTTPS live; HTTP→HTTPS redirect + HSTS confirmed (`curl -I`).
4. `NODE_ENV=production` on the API (hides stack traces, Secure cookies, HSTS).
5. Global rate limiting verified (101× on `/api` → 429).
6. Email/password sign-in works: register → auto signed-in → refresh stays signed in.
7. Upload rejection verified (>5MB → 413; wrong type → 422; spoofed image deleted).
8. CORS verified: an API call from the real SPA origin succeeds; a random origin is blocked.
9. `npm audit --omit=dev` reviewed (see known items below); `.env` not in git.
10. CSRF verified on uploads (missing `X-CSRF-Token` on a mutation → rejected).

---

## Known items to address soon

- **Mobile-number (OTP) sign-in** is the next auth method to add — slot it into
  `authController`/`authRoutes` alongside email/password, reusing `signToken`.
- **Admin dashboard**: the JWT carries a `role` claim and `authMiddleware`
  exposes `authorize('admin')`; gate admin routes with it.
- **`csurf` is archived** (2 low-severity advisories via its `cookie` dep).
  Migrate to [`csrf-csrf`](https://www.npmjs.com/package/csrf-csrf). The frontend
  flow (`GET /api/csrf-token` → `X-CSRF-Token` header) stays identical.
- **ClamAV** virus scanning is a placeholder in `uploadMiddleware.js` — wire it
  before accepting real user uploads at scale.
- **Cloudflare / WAF** in front of the API for real DDoS protection (the in-app
  rate limiter is not a substitute).

---

## Alternative: Docker on a VPS

The committed `Dockerfile` builds the API as a non-root container:

```bash
docker build -t forgevidhya-api ./ -f Dockerfile
docker run -p 5000:5000 --env-file backend/.env forgevidhya-api
```

Serve `web/dist` (from `cd web && npm install && npm run build`) via Nginx/Caddy
with security headers, and reverse-proxy `/api` and `/auth` to the container.
