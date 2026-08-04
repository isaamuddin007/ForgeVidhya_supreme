/**
 * backend/server.js
 * Main entrypoint: security headers, CORS whitelist, rate limiting, HTTPS
 * enforcement, JWT auth, CSRF, and wiring for all middleware.
 *
 * Security note: This is the network security perimeter — it hardens headers,
 * restricts origins, throttles abuse, and forces HTTPS behind a proxy/CDN. The
 * database is CockroachDB (PostgreSQL); all model queries are parameterized, so
 * the old Mongo operator sanitizer is no longer needed.
 *
 * Env variables:
 *   NODE_ENV        - 'production' enables HSTS, HTTPS redirect, secure cookies
 *   PORT            - server port (default 5000)
 *   CLIENT_ORIGIN   - allowed browser origin, default 'https://forgevidhya.in'
 *   COOKIE_DOMAIN   - cookie scope, e.g. 'forgevidhya.in'
 *   TRUST_PROXY     - '1' when behind Nginx/Cloudflare (correct req.ip + Secure cookies)
 *   (plus DATABASE_URL, JWT_SECRET from the auth modules; DEEPSEEK_API_KEY)
 *
 * Auth: stateless JWT (email/password today; mobile-number OTP planned). No
 * server-side sessions — the API authenticates via Bearer tokens.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const csrf = require('csurf');

const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sanitizeBody } = require('./middleware/validationMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Whitelist: production domain(s) + the SPA dev origins.
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN || 'https://forgevidhya.in',
  'https://www.forgevidhya.in',
];
if (!isProd) {
  ALLOWED_ORIGINS.push(
    'http://localhost:8080', // web/ (Vite dev)
    'http://localhost:5173', // Vite default
    'http://localhost:3000'
  );
}

if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 0) HTTPS enforcement in production (relies on X-Forwarded-Proto from proxy).
// ---------------------------------------------------------------------------
if (isProd) {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// ---------------------------------------------------------------------------
// 1) Security headers (Helmet).
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", ...ALLOWED_ORIGINS],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// 2) CORS: strict origin whitelist with credentials.
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      logger.security('CORS_BLOCKED', { origin });
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// ---------------------------------------------------------------------------
// 3) Body parsing (size-capped), cookies, compression.
// ---------------------------------------------------------------------------
// The JSON API stays tightly size-capped (10kb) to blunt abuse. The DeepSeek
// assistant is the one exception: it carries the rendered page's text as
// context, so its path gets a larger cap.
const jsonSmall = express.json({ limit: '10kb' });
const jsonLarge = express.json({ limit: '256kb' });
app.use((req, res, next) =>
  req.path.startsWith('/api/deepseek') ? jsonLarge(req, res, next) : jsonSmall(req, res, next)
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// ---------------------------------------------------------------------------
// 4) Injection/pollution hardening (parameterized SQL handles the DB layer).
// ---------------------------------------------------------------------------
app.use(hpp());
app.use(sanitizeBody); // deep XSS strip on request bodies

// ---------------------------------------------------------------------------
// 5) Global rate limit: 100 requests / 15 min / IP on the JSON API (/api).
//    /auth has its own tighter loginLimiter on register/login.
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
  handler: (req, res, _next, options) => {
    logger.security('GLOBAL_RATE_LIMITED', { ip: req.ip, route: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});
app.use('/api', globalLimiter);

// ---------------------------------------------------------------------------
// 7) CSRF (double-submit cookie) for cookie-authed mutations under /api.
// ---------------------------------------------------------------------------
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------------------------------------------------------------------
// 8) Routes.
//    /auth  -> email/password auth; issues stateless JWTs. Login/register are
//              rate-limited; the JWT is read from a Bearer header (no CSRF).
//    /api   -> JSON API; cookie-authed mutations are CSRF-protected.
// ---------------------------------------------------------------------------
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/uploads', csrfProtection, require('./routes/uploadRoutes'));
// Public read of admin-published site content.
app.use('/api/content', require('./routes/contentRoutes'));
// Admin-only API. The router itself requires a Bearer JWT + role 'admin', so
// cookie-based CSRF isn't applicable to it (see routes/adminRoutes.js).
app.use('/api/admin', require('./routes/adminRoutes'));
// AI assistant proxy: no CSRF (stateless, no cookie auth) — the SPA calls it
// without credentials; it's protected by the CORS whitelist + its own limiter.
app.use('/api/deepseek', require('./routes/deepseekRoutes'));

app.get('/api', (_req, res) => res.json({ service: 'forgeVidhya API', status: 'up' }));

// ---------------------------------------------------------------------------
// 9) 404 + centralized error handler (must be LAST).
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Boot: connect DB first, then listen.
// ---------------------------------------------------------------------------
const start = async () => {
  await connectDB();
  app.listen(PORT, () => logger.info(`Server listening on :${PORT} (${process.env.NODE_ENV || 'development'})`));
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

start();

module.exports = app; // exported for tests
