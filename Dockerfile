# Payload CMS + Next.js Dockerfile mit Bun (Standalone Output)
FROM oven/bun:1-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache vips-dev build-base python3
COPY package.json bun.lock* ./
RUN bun install

# --- Builder ---
FROM base AS builder
RUN apk add --no-cache vips-dev build-base python3
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Payload braucht diese Werte beim Build (next build), sonst hängt der Build.
# Zur Laufzeit werden die echten Werte per docker-compose injiziert.
ENV PAYLOAD_SECRET=build-time-dummy-secret-replace-at-runtime
ENV DATABASE_URL=file:./data/payload.db

RUN bun run build

# --- Production Runner ---
FROM oven/bun:1-alpine AS runner
RUN apk add --no-cache vips dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Standalone Output kopieren (enthält nur die nötigen Dateien)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Media-Upload Verzeichnis & SQLite Database Verzeichnis
RUN mkdir -p /app/media /app/data

RUN addgroup -g 1001 -S nodejs && \
    adduser -S payload -u 1001 && \
    chown -R payload:nodejs /app

USER payload

EXPOSE 3001

CMD ["bun", "run", "server.js"]
