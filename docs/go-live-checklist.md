# Go-Live Checklist - CateZile.ro

## Tehnic ✅

### Performance & Core Web Vitals
- [ ] LCP ≤ 1.8s (homepage), ≤ 2.0s (content pages) on 4G
- [ ] CLS ≤ 0.05 (no visible layout shifts)
- [ ] INP ≤ 200ms (navigation, filters)
- [ ] TTFB ≤ 800ms (first visit after warmup)
- [ ] Images are responsive with width/height attributes
- [ ] Priority/preload set for hero images
- [ ] Lazy loading for ads/trailers
- [ ] Edge caching configured (cache headers)

### Deployment & Orchestration
- [ ] All edge functions deployed and working
- [ ] GitHub Actions workflows configured
- [ ] Vercel Deploy Hook URL set
- [ ] Cache version increments on successful deploy
- [ ] Warmup runs after deployment
- [ ] Health checks pass (green status)
- [ ] Admin /deploy page functional

### Content & Data
- [ ] All sitemaps generate correctly
- [ ] Search suggestions work with diacritics
- [ ] TV schedule data is current
- [ ] Movie data syncs from TMDB
- [ ] Liga 1 fixtures updated
- [ ] Holiday calendar complete for current + next year
- [ ] Event moderation queue functional

### Email & Notifications
- [ ] Resend API configured
- [ ] Email templates render correctly
- [ ] Reminder emails send at correct times
- [ ] Unsubscribe links work
- [ ] Newsletter signup functional
- [ ] ICS calendar attachments work

## Securitate 🔒

### Authentication & Authorization
- [ ] RLS policies active on all tables
- [ ] Admin functions protected with JWT + cron secret
- [ ] User data isolated by user_id
- [ ] No raw SQL execution in edge functions
- [ ] Profile privilege escalation prevented

### Data Protection
- [ ] No sensitive data in client-side code
- [ ] API keys stored in Supabase secrets
- [ ] No CORS vulnerabilities
- [ ] Rate limiting on public endpoints
- [ ] Input sanitization on UGC forms

### Monitoring
- [ ] Error logging configured
- [ ] Health checks monitor critical functions
- [ ] Failed deployment notifications work
- [ ] Security scan passes (if available)

## Legal (RO) ⚖️

### GDPR Compliance
- [ ] Cookie banner implemented
- [ ] Privacy policy published (/legal/privacy)
- [ ] Data processing consent flows
- [ ] User data export functionality
- [ ] Account deletion functionality
- [ ] Data retention policies documented

### Terms & Cookies
- [ ] Terms of service published (/legal/terms)
- [ ] Cookie policy published (/legal/cookies)
- [ ] Age verification for account creation
- [ ] Contact information visible (/contact)

### Content & IP
- [ ] Copyright notices for TMDB content
- [ ] Affiliate disclosure statements
- [ ] User-generated content moderation
- [ ] DMCA takedown process documented

### Business Registration
- [ ] Company registration complete (if required)
- [ ] VAT registration (if revenue > threshold)
- [ ] Terms updated with company details
- [ ] Invoice generation capability (for affiliates)

## Technical Verification Commands

```bash
# Run full test suite
npm run test:e2e

# Check health status
curl https://your-project.supabase.co/functions/v1/healthcheck

# Test warmup
curl -X POST https://your-project.supabase.co/functions/v1/warmup \
  -H "x-cron-secret: YOUR_SECRET" \
  -d '{"buildId":"test"}'

# Verify sitemaps
curl https://catezile.ro/sitemap.xml
curl https://catezile.ro/sitemaps/sitemap-sport-00001.xml.gz

# Test search
curl "https://catezile.ro/api/search_suggest?q=liga"
```

## SEO Pre-Launch Verification

```bash
# Verify structured data
curl -s https://catezile.ro/ | grep -o '"@type":"[^"]*"' | sort | uniq

# Check meta tags
curl -s https://catezile.ro/ | grep -E '<title>|<meta.*description|<meta.*og:'

# Verify canonical tags
curl -s https://catezile.ro/filme | grep 'rel="canonical"'
```

## Final Launch Steps

1. **Deploy to Production**
   ```bash
   # Trigger production build
   curl -X POST "YOUR_VERCEL_DEPLOY_HOOK_URL"
   ```

2. **Verify Deployment**
   - Check /admin/deploy status
   - Verify cache version incremented
   - Confirm warmup completed successfully

3. **Submit to Search Engines**
   - Google Search Console: Submit sitemap
   - Bing Webmaster Tools: Submit sitemap
   - Ping sitemaps function runs automatically

4. **Social Media Setup**
   - Facebook page created and linked
   - X/Twitter account active
   - LinkedIn company page
   - Instagram business account

5. **Analytics Verification**
   - Plausible Analytics tracking
   - Custom events firing correctly
   - Goal conversion tracking active

## Post-Launch Monitoring (First 48h)

- [ ] No 5xx errors in edge function logs
- [ ] Search engine crawling detected
- [ ] Email delivery rates normal
- [ ] Performance metrics within targets
- [ ] User registrations working
- [ ] Affiliate links tracking correctly
- [ ] Mobile experience optimal
- [ ] All critical user flows functional

## Emergency Contacts & Procedures

**If site is down:**
1. Check Vercel deployment status
2. Review Supabase edge function logs
3. Verify DNS and domain settings
4. Check rate limits and quotas

**If emails not sending:**
1. Verify Resend API status
2. Check domain verification
3. Review bounce/spam rates
4. Validate email templates

**If search not working:**
1. Check search_suggest function logs
2. Verify database connectivity
3. Test search index refresh
4. Review synonym mappings

---

**Launch Date Target:** ___________
**Launched By:** ___________
**Post-Launch Review Date:** ___________