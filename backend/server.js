/**
 * backend/server.js
 * Main entrypoint: security headers, CORS whitelist, rate limiting, HTTPS
 * enforcement, NoSQL-injection scrubbing, CSRF, and wiring for all middleware.
 *
 * Security note: This is the network security perimeter — it hardens headers,
 * restricts origins, throttles abuse, and forces HTTPS behind a proxy/CDN.
 *
 * Env variables:
 *   NODE_ENV          - 'production' enables HSTS, HTTPS redirect, secure cookies
 *   PORT              - server port (default 5000)
 *   CLIENT_ORIGIN     - allowed browser origin, default 'https://forgevidhya.in'
 *   COOKIE_DOMAIN     - cookie scope, e.g. 'forgevidhya.in'
 *   TRUST_PROXY       - '1' when behind Nginx/Cloudflare/Heroku (for correct req.ip + Secure cookies)
 *   (plus JWT_*, MONGO_URI, etc. from the other modules)
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const csrf = require('csurf');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sanitizeBody } = require('./middleware/validationMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Whitelist: ONLY the production domain (add localhost in dev).
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN || 'https://forgevidhya.in',
  'https://www.forgevidhya.in',
];
if (!isProd) ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:5173');

// Trust the reverse proxy / CDN so req.ip and Secure cookies work correctly.
// NOTE: only enable when actually behind a trusted proxy (Nginx/Cloudflare).
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 0) HTTPS enforcement: redirect HTTP -> HTTPS in production.
//    Relies on X-Forwarded-Proto set by the proxy/CDN (Cloudflare, Nginx).
// ---------------------------------------------------------------------------
if (isProd) {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// ---------------------------------------------------------------------------
// 1) Security headers (Helmet): CSP, X-Frame-Options, HSTS, noSniff, etc.
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // relax if using inline styles
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", ...ALLOWED_ORIGINS],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],           // clickjacking protection
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // enable if you don't embed cross-origin assets
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.disable('x-powered-by'); // don't advertise Express

// ---------------------------------------------------------------------------
// 2) CORS: strict origin whitelist with credentials (for httpOnly cookies).
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server (no Origin header) and whitelisted.
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
// 3) Body parsing (with size caps), cookies, compression.
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));           // cap JSON to blunt payload DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// ---------------------------------------------------------------------------
// 4) Injection hardening: strip Mongo operators ($, .) and param pollution.
// ---------------------------------------------------------------------------
app.use(
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      logger.security('NOSQL_INJECTION_ATTEMPT', { ip: req.ip, key });
    },
  })
);
app.use(hpp());        // HTTP Parameter Pollution
app.use(sanitizeBody); // deep XSS strip on request bodies

// ---------------------------------------------------------------------------
// 5) Global rate limit: 100 requests / 15 min / IP.
//    DDoS NOTE: this is app-level only. Put Cloudflare (or AWS WAF/Shield) in
//    front for real volumetric/L7 DDoS protection and bot management.
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
// 6) CSRF protection (double-submit cookie). Frontend reads /api/csrf-token
//    and echoes it back in the X-CSRF-Token header on state-changing requests.
// ---------------------------------------------------------------------------
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});

// Health check (no auth, no CSRF).
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Endpoint the SPA calls to obtain a CSRF token.
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------------------------------------------------------------------
// 7) Routes. Apply csrfProtection to state-changing route groups.
//    (Auth routes typically issue tokens; keep CSRF on cookie-authed mutations.)
// ---------------------------------------------------------------------------
const authRoutes = require('./routes/authRoutes');

// First sign-in has no session cookie yet, so CSRF adds little on register/login.
// Skip CSRF for those two; enforce it on the cookie-authed rest (refresh/logout/me).
// The provided frontend api.js fetches /api/csrf-token automatically.
const CSRF_EXEMPT = new Set(['/register', '/login']);
const conditionalCsrf = (req, res, next) => {
  if (CSRF_EXEMPT.has(req.path)) return next();
  return csrfProtection(req, res, next);
};
app.use('/api/auth', conditionalCsrf, authRoutes);

// Sketch-to-DWG uploads (cookie-authed mutation -> CSRF-protected).
app.use('/api/uploads', csrfProtection, require('./routes/uploadRoutes'));

// Service root so the API is reachable out of the box.
app.get('/api', (_req, res) => res.json({ service: 'forgeVidhya API', status: 'up' }));

// ---------------------------------------------------------------------------
// 8) 404 + centralized error handler (must be LAST).
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Boot: connect DB first, then listen. Handle process-level failures.
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
