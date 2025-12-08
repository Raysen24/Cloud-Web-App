# ---------- Base image ----------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Build (Next.js + Prisma) ----------
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma needs DATABASE_URL at build time to create SQLite DB
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client + create SQLite schema
RUN npx prisma generate
RUN npx prisma db push

# Build Next.js app
RUN npm run build

# ---------- Runtime image ----------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Copy built artifacts and DB
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dev.db ./dev.db

EXPOSE 3000

CMD ["npm", "start"]
