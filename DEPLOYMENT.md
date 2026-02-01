# Deployment Guide

This guide covers deploying the Event Platform to production.

## Architecture

- **Frontend (Next.js)**: Deployed to Vercel
- **Backend (NestJS API)**: Deployed to Railway or Render
- **Database**: PostgreSQL (Railway or managed PostgreSQL)
- **Cache**: Redis (Railway or managed Redis)

## Prerequisites

1. Node.js 20+
2. pnpm package manager
3. Accounts on:
   - [Vercel](https://vercel.com) (frontend)
   - [Railway](https://railway.app) or [Render](https://render.com) (backend)
   - [Stripe](https://stripe.com) (payments, optional)
   - [Resend](https://resend.com) (emails, optional)

---

## Option 1: Vercel + Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. **Create a new project** on [Railway](https://railway.app)

2. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

3. **Add Redis**:
   - Click "New" → "Database" → "Redis"
   - Railway auto-generates `REDIS_URL`

4. **Deploy the API**:
   - Click "New" → "GitHub Repo"
   - Connect your repository
   - Set the root directory to the monorepo root
   - Railway will detect the Dockerfile at `packages/api/Dockerfile`

5. **Configure environment variables**:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<generate with: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGINS=https://your-app.vercel.app
   ```

6. **Run migrations**:
   - In Railway, open the API service
   - Go to "Settings" → "Deploy" → Add deploy command:
     ```
     npx prisma migrate deploy && node dist/main.js
     ```

7. **Get your API URL**:
   - Railway provides a URL like `https://your-api.up.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Import project** on [Vercel](https://vercel.com/new)
   - Connect your GitHub repository

2. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm --filter @event-platform/web build`
   - Install Command: `cd ../.. && pnpm install`

3. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
   ```

4. **Deploy**

### Step 3: Seed Demo Data (Optional)

From your local machine with `DATABASE_URL` set:

```bash
cd packages/database
pnpm run db:seed
```

Demo credentials:
- Email: `demo@example.com`
- Password: `demo123456`

---

## Option 2: Self-Hosted with Docker

### Prerequisites

- Docker and Docker Compose installed
- A server with ports 80/443 available
- Domain name with DNS configured

### Step 1: Clone and Configure

```bash
git clone <your-repo>
cd event-platform

# Copy environment files
cp packages/api/.env.example packages/api/.env
cp packages/database/.env.example packages/database/.env
```

### Step 2: Configure Environment Variables

Edit the `.env` files with your production values:

```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### Step 3: Deploy with Docker Compose

```bash
# Start all services
docker compose -f docker-compose.production.yml up -d

# Run migrations
docker compose -f docker-compose.production.yml exec api npx prisma migrate deploy

# Seed demo data (optional)
docker compose -f docker-compose.production.yml exec api npx prisma db seed
```

### Step 4: Set Up Reverse Proxy

Use Nginx, Caddy, or Traefik for SSL termination and routing.

Example Caddy configuration:

```caddyfile
api.yourdomain.com {
    reverse_proxy localhost:3001
}

app.yourdomain.com {
    reverse_proxy localhost:3000
}
```

---

## Environment Variables Reference

### Backend (packages/api/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `NODE_ENV` | Yes | `production` for prod |
| `PORT` | No | API port (default: 3001) |
| `STRIPE_SECRET_KEY` | No | Stripe API key for payments |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `AWS_*` | No | S3 credentials for file uploads |

### Frontend (apps/web/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | No | Frontend URL (for social sharing) |

---

## Post-Deployment Checklist

- [ ] Verify frontend loads at your domain
- [ ] Test login with demo credentials
- [ ] Create a new organization via registration
- [ ] Create a test event
- [ ] Test the registration flow
- [ ] Configure email settings (Resend)
- [ ] Configure payment settings (Stripe)
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backups for PostgreSQL

---

## Troubleshooting

### API returns 502 Bad Gateway

- Check API logs: `docker logs event-platform-api`
- Verify DATABASE_URL is correct
- Ensure migrations have run

### Frontend can't connect to API

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend (`CORS_ORIGINS`)
- Ensure API is accessible from frontend domain

### Authentication fails

- Verify JWT secrets match between deployments
- Check token expiration settings
- Clear browser localStorage and try again

### Database connection issues

- Verify PostgreSQL is running
- Check connection string format
- Ensure SSL mode matches your PostgreSQL setup

---

## Scaling

### Horizontal Scaling

- **API**: Deploy multiple replicas behind a load balancer
- **Database**: Use connection pooling (PgBouncer)
- **Redis**: Use Redis Cluster or managed Redis

### Performance Optimization

1. Enable CDN for static assets (Vercel handles this)
2. Configure proper caching headers
3. Use database indexes (already in Prisma schema)
4. Enable gzip/brotli compression
