# DevOps & Deployment Orchestration

CateZile.ro uses an automated deployment system that handles builds, cache management, and monitoring. This guide explains how to configure and use the deployment pipeline.

## Overview

The deployment system consists of:
- **Automated builds** triggered by content changes
- **Cache versioning** with intelligent busting
- **Health monitoring** of all critical functions
- **Post-deploy warmup** for optimal performance
- **Manual controls** via admin interface

## Configuration

### Required Secrets

Set these secrets in your Supabase Edge Functions and CI/CD environment:

```bash
# Core secrets
ADMIN_CRON_SECRET=your-secure-random-string
SITE_URL=https://catezile.ro

# Deployment (choose one)
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/prj_xxx
# OR
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=owner/repo

# Build configuration
BUILD_MIN_INTERVAL_MIN=10  # Minimum minutes between auto-builds
CACHE_VERSION=1            # Auto-incremented on successful deploys
```

### Supabase Secrets

```bash
supabase secrets set ADMIN_CRON_SECRET="your-secure-random-string"
supabase secrets set VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/prj_xxx"
supabase secrets set SITE_URL="https://catezile.ro"
```

### CI/CD Secrets (GitHub Actions)

In your GitHub repository settings, add:
- `VERCEL_DEPLOY_HOOK_URL`
- `ADMIN_CRON_SECRET`
- `SUPABASE_EDGE_URL` (e.g., `https://xxx.supabase.co`)
- `SITE_URL`
- `CACHE_VERSION`

## How It Works

### Build Triggering

Builds are triggered automatically when:
- New events are approved (`events_moderate`)
- Movie data is synced with significant changes (`movies_sync_tmdb`)
- Liga1 fixtures are imported (`import_liga1_fixtures`)
- Any content function logs URL changes

Manual triggers:
- Admin panel "Build Now" button
- Workflow dispatch in GitHub Actions
- Direct API call to `rebuild_hook`

### Rate Limiting & Coalescing

To prevent build spam:
- **Minimum interval**: 10 minutes between auto-builds (configurable)
- **Build locking**: Admin can temporarily disable auto-builds
- **Coalescing**: Multiple triggers within interval are batched

### Cache Management

**Client-side cache busting:**
```typescript
import { withCacheVersion } from '@/lib/cache';

// Automatically appends ?v=123 to URLs
const url = withCacheVersion('/api/search');
fetch(url);
```

**Server-side cache headers:**
- **Listings** (sitemaps, RSS): 15min cache with stale-while-revalidate
- **Search**: 1min cache
- **Live data**: No cache
- **Assets**: 1hr immutable cache

**ETag support:**
- Functions generate ETags based on content + cache version
- Clients receive 304 Not Modified when appropriate

### Post-Deploy Process

When a build completes successfully:

1. **Cache version increment** (`v1` → `v2`)
2. **Warmup critical pages**:
   - Homepage (`/`)
   - Sitemap index (`/sitemap.xml`)
   - Key section pages (`/tv`, `/filme`, `/evenimente`)
   - Search endpoints
3. **Sitemap ping** (if content changed in last 24h)
4. **Health check** verification

## Admin Interface

Access deployment controls at `/admin/deploy`:

### Status Dashboard
- **Last build** status and timing
- **Cache version** current number
- **Health status** of all systems

### Actions
- **Build Now**: Force immediate build (bypasses rate limits)
- **Purge Cache**: Increment cache version and trigger warmup
- **Rebuild Sitemaps**: Regenerate and ping search engines
- **Lock Builds**: Temporarily disable auto-builds (useful during maintenance)

### Monitoring
- **Build history**: Last 20 deployments with details
- **Health checks**: Real-time status of database, search, crons
- **Performance**: Response times and error rates

## Health Monitoring

The system monitors:
- **Database connectivity**
- **Search function** availability
- **TV status updates**
- **Cron job execution**:
  - Liga1 live updates (every 5min on match days)
  - Movie sync (daily)
  - Holiday generation (monthly)

Health statuses:
- 🟢 **Green**: All systems operational
- 🟡 **Yellow**: Minor issues or warnings
- 🔴 **Red**: Critical failures requiring attention

Public health endpoint: `/health` (for uptime monitoring)

## API Endpoints

### Rebuild Hook
```bash
POST /functions/v1/rebuild_hook
Headers: x-cron-secret: YOUR_SECRET
Body: { "reason": "Manual rebuild", "force": true }
```

### Health Check
```bash
GET /functions/v1/healthcheck
# Returns JSON with system status
```

### Warmup
```bash
POST /functions/v1/warmup
Headers: x-cron-secret: YOUR_SECRET
Body: { "cacheVersion": 123 }
```

### Post Deploy Tasks
```bash
POST /functions/v1/post_deploy_tasks  
Headers: x-cron-secret: YOUR_SECRET
Body: { "buildId": "github-12345", "success": true }
```

## Troubleshooting

### Build Not Triggering
1. Check `VERCEL_DEPLOY_HOOK_URL` is set correctly
2. Verify `ADMIN_CRON_SECRET` matches between functions
3. Check deployment logs in admin panel
4. Ensure build interval hasn't been exceeded

### Cache Not Updating
1. Verify cache version incremented in admin panel
2. Check fetch requests include `?v=` parameter
3. Clear browser cache manually
4. Run "Purge Cache" from admin panel

### Health Check Failures
1. Check Supabase Edge Functions logs
2. Verify all dependent services are running
3. Review ingestion logs for cron job failures
4. Check network connectivity to external APIs

### Failed Deploys
1. Review GitHub Actions logs or Vercel build logs
2. Check environment variables are set
3. Verify Supabase secrets are configured
4. Manual retry via admin panel

## Performance Tips

1. **Use cache-friendly URLs**: Static pages benefit from CDN caching
2. **Monitor warmup results**: Ensure critical pages load quickly post-deploy
3. **Batch content updates**: Avoid triggering builds for every minor change
4. **Health check alerts**: Set up monitoring for red status conditions

## Development Workflow

```bash
# Local development
npm run dev

# Test deployment system
npm run test  # Includes deployment tests

# Manual build trigger (requires admin access)
curl -X POST "https://xxx.supabase.co/functions/v1/rebuild_hook" \
  -H "x-cron-secret: YOUR_SECRET" \
  -d '{"reason": "Manual test", "force": true}'

# Check health
curl "https://xxx.supabase.co/functions/v1/healthcheck"
```

## CI/CD Integration

The system works with:
- **GitHub Actions** (included workflows)
- **Vercel Deploy Hooks** 
- **Custom webhooks**

Example GitHub workflow triggers:
- Push to `main` → Production build
- Pull request → Preview build (if configured)
- Manual dispatch → Custom build

For other CI systems, adapt the webhook calls in the provided workflows.