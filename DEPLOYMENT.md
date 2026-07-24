# forgeVidhya — Deployment Runbook

This repo is **deploy-ready**. The steps below are the parts only you can do
(account creation + entering secrets). Everything else — build configs, the
Render blueprint, security hardening — is already committed.

Target stack: **Render** (API web service + static SPA) + **MongoDB Atlas**.

---

## What's already done

- ✅ Backend (Express) — security middleware, auth, uploads, error handling
- ✅ Frontend (React + Vite) — builds cleanly to `frontend/dist`
- ✅ `render.yaml` blueprint for both services
- ✅ `Dockerfile` (alternative to Render, for a VPS)
- ✅ Lockfiles committed (`npm ci` works in CI)
- ✅ Secrets kept out of git (`.env` ignored; Render uses `sync: false`)

---

## Step 1 — Provision MongoDB Atlas (least-privilege)

1. Create a free cluster at https://www.mongodb.com/atlas.
2. **Database Access** → Add a user `forgevidhya_app` with role
   **`readWrite` on the `forgevidhya` database only** (NOT Atlas admin / root).
3. **Network Access** → add Render's egress or `0.0.0.0/0` **only** if you must;
   prefer restricting to Render's static IPs on a paid plan.
4. Copy the connection string:
   `mongodb+srv://forgevidhya_app:<pwd>@cluster0.xxxx.mongodb.net/forgevidhya?retryWrites=true&w=majority`

## Step 2 — Generate real JWT secrets

Run twice; the two values must differ:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

## Step 3 — Push to GitHub

```bash
git remote add origin https://github.com/<you>/forgevidhya.git
git branch -M main
git push -u origin main
```

## Step 4 — Deploy on Render

1. Render Dashboard → **New → Blueprint** → select the repo. It reads
   `render.yaml` and creates **forgevidhya-api** and **forgevidhya-web**.
2. On **forgevidhya-api**, set the `sync: false` env vars:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | the Atlas string from Step 1 |
   | `JWT_ACCESS_SECRET` | first value from Step 2 |
   | `JWT_REFRESH_SECRET` | second value from Step 2 |
   | `CLIENT_ORIGIN` | the web URL, e.g. `https://forgevidhya-web.onrender.com` |
   | `COOKIE_DOMAIN` | leave blank unless API + web share a parent domain |
3. On **forgevidhya-web**, set:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://forgevidhya-api.onrender.com/api` |
4. Trigger deploy. First build installs deps and builds the SPA.

## Step 5 — Wire the two together

The API and SPA are on **different origins** (`*-api` vs `*-web`), so:
- Cookies are cross-site → they must be `SameSite=None; Secure`. The code sets
  `SameSite=strict` in prod, which **won't send cookies cross-origin**. Two fixes:
  - **Recommended:** put both behind one custom domain (`forgevidhya.in` for the
    SPA, `api.forgevidhya.in` for the API), set `COOKIE_DOMAIN=forgevidhya.in`,
    and keep `SameSite=strict` (same site, different subdomain works).
  - Or change `sameSite` to `'none'` in `authMiddleware.js` (less strict CSRF posture).
- Confirm `CLIENT_ORIGIN` exactly matches the SPA origin or CORS will block it.

## Step 6 — Custom domain + HTTPS (forgevidhya.in)

1. Render → each service → **Settings → Custom Domains** → add
   `forgevidhya.in` (web) and `api.forgevidhya.in` (API).
2. Add the shown DNS records at your registrar. Render issues TLS automatically.
3. Set `COOKIE_DOMAIN=forgevidhya.in` and update `CLIENT_ORIGIN` +
   `VITE_API_URL` to the custom domains, then redeploy.

---

## Pre-go-live checklist (from the security layer)

1. Rotate every secret — no `CHANGE_ME` / placeholders remain.
2. Atlas user is `readWrite`-only, IP access restricted.
3. HTTPS live; HTTP→HTTPS redirect + HSTS confirmed (`curl -I`).
4. `NODE_ENV=production` on the API (hides stack traces, Secure cookies, HSTS).
5. Rate limiting verified (6× login → 429; 101× general → 429).
6. Account lockout verified (10 bad passwords → 423).
7. Upload rejection verified (>5MB → 413; wrong type → 422; spoofed image deleted).
8. CORS + cookies verified across the real origins.
9. `npm audit --omit=dev` reviewed (see known items below); `.env` not in git.
10. CSRF verified end-to-end (missing `X-CSRF-Token` on a mutation → rejected).

---

## Known items to address soon

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

Serve `frontend/dist` (from `npm run build`) via Nginx/Caddy with the security
headers from `frontend/index.html`, and reverse-proxy `/api` to the container.
