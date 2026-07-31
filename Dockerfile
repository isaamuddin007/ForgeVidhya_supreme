# =============================================================================
# forgeVidhya - Backend Dockerfile (multi-stage, non-root, minimal base)
# Security note: Runs as an unprivileged user on a minimal Alpine image with
# only production deps, shrinking attack surface and blocking container escape
# via root.
# =============================================================================

# ---- Stage 1: install production dependencies ----
FROM node:18-alpine AS deps
WORKDIR /app

# Install only what's needed to resolve deps; leverage layer caching.
COPY backend/package*.json ./
# `npm ci` = reproducible install from lockfile; omit dev deps.
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 2: runtime ----
FROM node:18-alpine AS runner

# Drop known-vulnerable defaults; add tini for correct signal handling (PID 1).
RUN apk add --no-cache tini && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production \
    PORT=5000 \
    NPM_CONFIG_LOGLEVEL=warn

WORKDIR /app

# Copy vetted node_modules from the deps stage and app source.
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup backend/ ./

# Writable dirs for logs/uploads, owned by the non-root user.
RUN mkdir -p logs uploads && chown -R appuser:appgroup logs uploads

# Never run as root.
USER appuser

EXPOSE 5000

# Lightweight liveness probe hitting the /health route.
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health || exit 1

# tini reaps zombies and forwards signals for graceful shutdown.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
