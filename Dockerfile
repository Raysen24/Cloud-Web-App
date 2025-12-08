# Dockerfile (Next.js + Prisma)

# ---- Base image we use everywhere (20.19+ is REQUIRED for Prisma 7.1) ----
FROM node:20.19-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- Install dependencies (uses lockfile) ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build stage ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client with alpine/musl target
RUN npx prisma generate
# Build Next.js app
RUN npm run build

# ---- Runtime image (small, only what we need) ----
FROM node:20.19-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy minimal runtime artifacts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Start Next.js and bind to the platform port/host
CMD ["npm","start"]
