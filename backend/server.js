/**
 * backend/server.js
 * Main entrypoint: security headers, CORS whitelist, rate limiting, HTTPS
 * enforcement, Passport/Google OAuth, CSRF, and wiring for all middleware.
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
 *   CLIENT_URL      - SPA origin for OAuth redirects (default http://localhost:8080)
 *   COOKIE_DOMAIN   - cookie scope, e.g. 'forgevidhya.in'
 *   SESSION_SECRET  - secret for express-session (Passport)
 *   TRUST_PROXY     - '1' when behind Nginx/Cloudflare (correct req.ip + Secure cookies)
 *   (plus DATABASE_URL, JWT_SECRET, GOOGLE_* from the other modules)
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const csrf = require('csurf');

const { connectDB } = require('./config/db');
const passport = require('./config/passport');
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
        imgSrc: ["'self'", 'data:', 'blob:', 'https://lh3.googleusercontent.com'], // Google avatars
        connectSrc: ["'self'", ...ALLOWED_ORIGINS],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", 'https://accounts.google.com'],
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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// ---------------------------------------------------------------------------
// 4) Session + Passport (Google OAuth). JWT is the real auth; the session only
//    satisfies Passport's plumbing, so it's kept minimal.
// ---------------------------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------------------------------------
// 5) Injection/pollution hardening (parameterized SQL handles the DB layer).
// ---------------------------------------------------------------------------
app.use(hpp());
app.use(sanitizeBody); // deep XSS strip on request bodies

// ---------------------------------------------------------------------------
// 6) Global rate limit: 100 requests / 15 min / IP on the JSON API.
//    (OAuth redirect routes under /auth are browser navigations, not counted.)
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
//    /auth  -> OAuth (top-level GET redirects; JWT issued). No CSRF here: the
//              Google callback is a cross-site top-level navigation.
//    /api   -> JSON API; cookie-authed mutations are CSRF-protected.
// ---------------------------------------------------------------------------
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/uploads', csrfProtection, require('./routes/uploadRoutes'));

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
