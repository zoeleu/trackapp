# ── Build stage ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# `output: "standalone"` in next.config.ts produces a self-contained build
# at .next/standalone/ with only the runtime files needed.
RUN bun run build

# ── Runtime stage ────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only the standalone output and the static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# The standalone output includes its own server.js entry point
CMD ["bun", "server.js"]
