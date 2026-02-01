# Multi-stage build for production
# Stage 1: Base with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Stage 2: Install dependencies and build
FROM base AS builder

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json files for all packages
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY packages/api ./packages/api

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

# Deploy API with all dependencies (resolves pnpm symlinks)
WORKDIR /app
RUN pnpm deploy --filter=@event-platform/api --prod /app/deploy

# Copy Prisma client to deploy directory
RUN cp -r /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma /app/deploy/node_modules/.prisma

# Stage 3: Production
FROM node:20-alpine AS runner

# Install security updates
RUN apk add --no-cache libc6-compat && apk upgrade

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy deployed application (includes node_modules without symlinks)
COPY --from=builder --chown=nestjs:nodejs /app/deploy ./

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
