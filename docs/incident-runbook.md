# Incident Runbook - CateZile.ro 🚨

## Quick Reference - Emergency Contacts

### System Status
- **Health Check:** https://catezile.ro/admin/deploy (health status)
- **Edge Functions:** Supabase dashboard functions logs
- **Deployment:** GitHub Actions status or Vercel dashboard
- **Domain/DNS:** Vercel domains or DNS provider

### Response Times
- **Critical (Site Down):** 15 minutes
- **High (Core Feature Broken):** 1 hour  
- **Medium (Performance Issues):** 4 hours
- **Low (Minor Bugs):** 24 hours

## Common Incidents & Responses 🔧

### 1. Edge Functions Error (Red Health Status)

**Symptoms:**
- Health check shows red status
- API endpoints returning 5xx errors
- Missing data on frontend

**Investigation:**
```bash
# Check function logs
supabase functions logs --project-ref YOUR_PROJECT_REF

# Test specific functions
curl https://YOUR_PROJECT.supabase.co/functions/v1/healthcheck
curl https://YOUR_PROJECT.supabase.co/functions/v1/search_suggest?q=test
```

**Common Causes & Fixes:**
- **Database connection timeout:** Check Supabase status, restart functions
- **API rate limits:** Implement exponential backoff, increase limits
- **Code deployment error:** Rollback to previous version, fix and redeploy
- **Environment secrets missing:** Verify all required secrets are set

**Resolution Steps:**
1. Check Supabase status page
2. Review function logs for specific error
3. Test database connectivity from function
4. Redeploy functions if needed
5. Update deployment_log with resolution notes

### 2. Search Indexing Decrease

**Symptoms:**
- Dropping organic traffic
- Fewer pages in Google Search Console
- Sitemap submission errors

**Investigation:**
```bash
# Check sitemaps
curl https://catezile.ro/sitemap.xml
curl https://catezile.ro/sitemaps/sitemap-sport-00001.xml.gz

# Verify recent URL changes
# Check url_change_log table in database
```

**Common Causes & Fixes:**
- **Sitemap generation failed:** Check sitemap edge functions
- **Canonical tag issues:** Review canonical URL implementations
- **Noindex accidentally added:** Audit meta robots tags
- **Server errors during crawling:** Check 5xx error rates

**Resolution Steps:**
1. Test sitemap accessibility and validity
2. Run ping_sitemaps function manually
3. Check robots.txt for blocking directives  
4. Review Search Console for crawl errors
5. Submit priority pages manually in GSC

### 3. Performance Degradation (LCP > 3s)

**Symptoms:**
- Slow page load times
- Poor Core Web Vitals scores
- User complaints about speed

**Investigation:**
```bash
# Test page speed
curl -w "@curl-format.txt" -o /dev/null -s https://catezile.ro/

# Check image optimization
curl -I https://catezile.ro/og-image-url.jpg

# Test warmup function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/warmup \
  -H "x-cron-secret: YOUR_SECRET"
```

**Common Causes & Fixes:**
- **Large unoptimized images:** Implement WebP/AVIF, proper sizing
- **Missing cache headers:** Review edge function cache settings
- **Database queries slow:** Optimize queries, add indexes
- **External API delays:** Add timeouts, implement fallbacks

**Resolution Steps:**
1. Run performance audit tools (Lighthouse, PageSpeed)
2. Identify largest contentful paint elements
3. Optimize critical path resources
4. Run warmup to populate caches
5. Monitor Core Web Vitals improvement

### 4. Email Delivery Issues

**Symptoms:**
- Reminders not being sent
- Newsletter delivery failures  
- High bounce rates

**Investigation:**
```bash
# Check Resend dashboard
# Review reminder_queue table for failed jobs
# Test email function directly

curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Common Causes & Fixes:**
- **Resend API quota exceeded:** Upgrade plan or optimize sending
- **Domain not verified:** Verify sending domain in Resend
- **High spam scores:** Review email content and authentication
- **Queue processing errors:** Check reminder processing function

**Resolution Steps:**
1. Check Resend dashboard for delivery stats
2. Verify domain authentication (SPF, DKIM)
3. Test email templates for spam scores
4. Review and restart email queue processing
5. Clear failed jobs and retry

### 5. Click Fraud on Affiliate Links

**Symptoms:**
- Unusually high CTR on /out/ links
- Traffic from suspicious IPs
- Affiliate network warnings

**Investigation:**
```bash
# Review click logs
# Check for patterns in IP addresses, user agents
# Analyze click-to-conversion ratios

# Block suspicious IPs (if needed)
```

**Common Causes & Fixes:**
- **Bot traffic:** Implement better bot detection
- **Competitor attacks:** Rate limit by IP, add CAPTCHA
- **Affiliate fraud:** Review conversion quality with partners

**Resolution Steps:**
1. Analyze click patterns and IP sources
2. Implement rate limiting on /out/ endpoints
3. Add bot detection headers check
4. Exclude suspicious traffic from reporting
5. Notify affiliate partners if needed

### 6. Content Management Issues

**Symptoms:**
- Events not appearing after submission
- Movie data outdated
- Liga 1 scores not updating

**Investigation:**
```bash
# Check ingestion logs
# Test import functions manually
# Review moderation queue

curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/liga1_live_tick \
  -H "x-cron-secret: YOUR_SECRET"
```

**Common Causes & Fixes:**
- **Import functions failing:** Check external API availability
- **Moderation queue backlog:** Process pending items
- **Cron jobs not running:** Verify cron schedules and triggers

**Resolution Steps:**
1. Check import function logs for errors
2. Test external data source APIs
3. Manually trigger import functions
4. Clear moderation queue if needed
5. Verify cron job schedules

## Build & Deployment Issues 🚀

### Build Failure

**Symptoms:**
- GitHub Actions failing
- Vercel deployment errors
- Features not appearing after code changes

**Investigation:**
```bash
# Check GitHub Actions logs
# Review Vercel deployment dashboard
# Test local build

npm run build
npm run test
```

**Resolution Steps:**
1. Review build error logs in detail
2. Test build locally with same environment
3. Check for dependency issues or conflicts
4. Fix code issues and trigger rebuild
5. Use manual rebuild from /admin/deploy if needed

### Cache Issues

**Symptoms:**
- Old content showing despite updates
- Cache version not incrementing
- Stale data in API responses

**Investigation:**
```bash
# Check current cache version
curl https://catezile.ro/api/settings

# Test cache busting
curl "https://catezile.ro/api/search_suggest?q=test&v=123"
```

**Resolution Steps:**
1. Manually increment cache version in settings
2. Run warmup function to refresh caches
3. Check edge function cache headers
4. Clear CDN caches if using external CDN
5. Verify cache version injection in build

## Escalation Procedures 📞

### Severity Levels

**Critical (Severity 1):**
- Site completely down
- Data loss or corruption
- Security breach
- Payment system failure

**High (Severity 2):**
- Core features broken (search, reminders)
- Performance severely degraded
- Major functionality unavailable

**Medium (Severity 3):**
- Minor features broken
- Cosmetic issues affecting UX
- Non-critical performance issues

**Low (Severity 4):**
- Documentation issues
- Minor UI inconsistencies
- Enhancement requests

### Response Protocol

1. **Immediate Response (0-15min):**
   - Acknowledge incident
   - Assess severity level
   - Begin investigation

2. **Initial Investigation (15-30min):**
   - Identify root cause
   - Implement temporary fixes if possible
   - Update stakeholders

3. **Resolution (30min-4hr):**
   - Deploy permanent fix
   - Test thoroughly
   - Monitor for recurring issues

4. **Post-Incident (24hr):**
   - Complete post-mortem
   - Document lessons learned
   - Implement preventive measures

## Post-Mortem Template 📝

### Incident Report: [Title] - [Date]

**Summary:**
Brief description of what happened and impact.

**Timeline:**
- **[Time]:** Issue detected
- **[Time]:** Investigation started  
- **[Time]:** Root cause identified
- **[Time]:** Fix deployed
- **[Time]:** Issue resolved

**Root Cause:**
Technical explanation of what went wrong.

**Impact:**
- Users affected: [number/percentage]
- Duration: [time]
- Revenue impact: [if applicable]
- Services affected: [list]

**Resolution:**
Steps taken to fix the issue.

**Prevention:**
Actions to prevent similar incidents:
- [ ] Code changes needed
- [ ] Monitoring improvements
- [ ] Process updates
- [ ] Documentation updates

**Action Items:**
- [ ] [Owner] [Description] [Due Date]
- [ ] [Owner] [Description] [Due Date]

## Monitoring & Alerting 📊

### Key Metrics to Monitor

**System Health:**
- Edge function response times
- Database connection pool
- Memory and CPU usage
- Error rates and 5xx responses

**Business Metrics:**
- Page views and user sessions
- Reminder conversion rates
- Email delivery success rates
- Search functionality usage

**Performance Metrics:**
- Core Web Vitals scores
- Page load times
- Time to first byte (TTFB)
- API response times

### Alert Thresholds

```yaml
Critical Alerts:
  - Site down (5xx > 50%)
  - Database connection failures
  - Edge function timeout (>10s)
  - Email delivery < 80%

Warning Alerts:
  - Performance degradation (LCP > 3s)
  - Error rate > 5%
  - High memory usage (>80%)
  - Search function failures
```

## Recovery Procedures 🔄

### Database Recovery
1. Check Supabase backup status
2. Identify last known good state
3. Restore from backup if needed
4. Verify data integrity
5. Update applications

### Function Recovery
1. Redeploy all edge functions
2. Verify environment variables
3. Test critical endpoints
4. Run health checks
5. Monitor for stability

### Full Site Recovery
1. Check domain/DNS settings
2. Verify Vercel deployment status
3. Test core user journeys
4. Run automated test suite
5. Monitor traffic patterns

---

**Incident Commander:** ___________
**Last Updated:** ___________
**Next Review Date:** ___________