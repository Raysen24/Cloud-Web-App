# Dockerfile for Next.js + Prisma app

# --- Base image
FROM node:20.19-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# --- Install deps (dev deps included for build)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# --- Build
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client (no DB connection required)
RUN npx prisma generate
# Build Next.js app
RUN npm run build

# --- Production runtime
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Only copy what we need to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
# ❌ Do not copy .env; set envs via Azure App Settings
# COPY --from=builder /app/.env ./.env

EXPOSE 3000
CMD ["npm", "start"]  # package.json: "start": "next start -p $PORT -H 0.0.0.0"
