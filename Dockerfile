# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (outputs to src/generated/prisma)
RUN npx prisma generate

# NEXT_PUBLIC_APP_URL is baked in at build time.
# Override this build arg when building for production:
#   docker build --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com .
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3: Minimal production runner (Next.js standalone)
# ============================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone server + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
