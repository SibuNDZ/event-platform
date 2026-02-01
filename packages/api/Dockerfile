# Multi-stage build for production
# Stage 1: Base with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat python3 make g++

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

# Stage 3: Production
FROM node:20-alpine AS runner

# Install build tools for native modules (bcrypt, sharp)
RUN apk add --no-cache libc6-compat python3 make g++ && apk upgrade

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/package.json ./package.json

# Copy built workspace packages that API depends on
COPY --from=builder /app/packages/database/dist ./node_modules/@event-platform/database/dist
COPY --from=builder /app/packages/database/package.json ./node_modules/@event-platform/database/package.json
COPY --from=builder /app/packages/shared/dist ./node_modules/@event-platform/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@event-platform/shared/package.json

# Copy Prisma schema
COPY --from=builder /app/packages/database/prisma ./prisma

# Remove workspace references from package.json (npm doesn't understand them)
# We copy these packages manually above
RUN node -e " \
  const pkg = require('./package.json'); \
  delete pkg.dependencies['@event-platform/database']; \
  delete pkg.dependencies['@event-platform/shared']; \
  delete pkg.devDependencies; \
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); \
"

# Install production dependencies with npm (avoids pnpm symlink issues)
RUN npm install --omit=dev --ignore-scripts

# Install dependencies for workspace packages we copied manually
RUN npm install nanoid@5 zod@3 @prisma/client@5.22.0 --ignore-scripts

# Generate Prisma client (pin to v5 to match schema)
RUN npx prisma@5.22.0 generate --schema=./prisma/schema.prisma

# Rebuild native modules
RUN npm rebuild bcrypt sharp || true

# Clean up build tools
RUN apk del python3 make g++

# Set ownership
RUN chown -R nestjs:nodejs /app

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
