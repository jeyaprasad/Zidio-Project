# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build — TanStack Start (SSR) with Bun
# Output lives in /app/.output (Nitro build), NOT /app/dist
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy lock files first for better layer caching
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — serve the SSR app with Bun (NOT Nginx, it's not static)
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

# Only copy the Nitro output bundle
COPY --from=builder /app/.output ./.output

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# Nitro server entry point
CMD ["bun", "run", ".output/server/index.mjs"]
