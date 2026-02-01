# Multi-stage build for production
# Stage 1: Base with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json files for all packages
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source files
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY packages/api ./packages/api
COPY pnpm-workspace.yaml package.json ./

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm run db:generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm run build

# Build database package
WORKDIR /app/packages/database
RUN pnpm run build

# Build API
WORKDIR /app/packages/api
RUN pnpm run build

# Stage 4: Production
FROM node:20-alpine AS runner

# Install security updates
RUN apk add --no-cache libc6-compat && apk upgrade

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy only necessary files for production
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema for migrations
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/prisma ./prisma

USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
