# KPI Dashboard Setup - CateZile.ro 📊

## North Star Metrics 🌟

### Primary KPIs
1. **Active Reminders Set** - Core engagement indicator
2. **Daily Active Users (DAU)** - Platform stickiness  
3. **Newsletter Subscribers** - Audience building
4. **Affiliate Click-Through Rate** - Monetization health

### Secondary KPIs
- **Page Views per Session** - Content engagement
- **Search Usage Rate** - Feature adoption
- **Return Visit Rate** - Retention metric
- **Email Open Rate** - Content quality
- **Core Web Vitals** - Technical performance

## Plausible Analytics Setup 📈

### Custom Events Configuration

```javascript
// Event tracking implementation for CateZile.ro
// Add to main.tsx or App.tsx

import { usePlausible } from 'next-plausible'

const plausible = usePlausible()

// Core engagement events
const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    plausible(eventName, { props })
  }
}

// Event definitions
export const EVENTS = {
  // Homepage & Navigation
  HOME_VIEW: 'home_view',
  HERO_CLICK: 'hero_click',
  NAV_CLICK: 'nav_click',
  
  // Content Engagement  
  TRENDING_CARD_CLICK: 'trending_card_click',
  MOVIE_CARD_CLICK: 'movie_card_click',
  EVENT_CARD_CLICK: 'event_card_click',
  MATCH_CARD_CLICK: 'match_card_click',
  
  // Core Features
  REMINDER_SET: 'reminder_set',
  REMINDER_CANCEL: 'reminder_cancel',
  SEARCH_USE: 'search_use',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  
  // TV & Sport
  TV_NOW_CLICK: 'tvnow_click',
  CHANNEL_CLICK: 'channel_click',
  LIGA1_TABLE_VIEW: 'liga1_table_view',
  
  // Monetization
  AFFILIATE_CLICK: 'affiliate_click',
  AD_VIEW: 'ad_view',
  TICKET_CLICK: 'ticket_click',
  
  // Utility
  ICS_DOWNLOAD: 'ics_download',
  SOCIAL_SHARE: 'social_share',
  
  // UGC
  UGC_SUBMIT: 'ugc_submit',
  UGC_APPROVED: 'ugc_approved',
  
  // Admin
  ADMIN_LOGIN: 'admin_login',
  BUILD_TRIGGERED: 'build_triggered'
}
```

### Event Implementation Examples

```typescript
// Homepage hero interaction
const handleHeroClick = (variant: string, target: string) => {
  trackEvent(EVENTS.HERO_CLICK, {
    variant, // 'derby' | 'today' | 'trending'
    target,  // what was clicked
    device: isMobile ? 'mobile' : 'desktop'
  })
}

// Reminder setting
const handleReminderSet = (entityType: string, entityId: string, offsetDays: number) => {
  trackEvent(EVENTS.REMINDER_SET, {
    entity_type: entityType, // 'movie' | 'match' | 'event'
    entity_id: entityId,
    offset_days: offsetDays,
    auth_status: user ? 'logged_in' : 'anonymous'
  })
}

// Search usage
const handleSearch = (query: string, resultsCount: number) => {
  trackEvent(EVENTS.SEARCH_USE, {
    query_length: query.length,
    results_count: resultsCount,
    has_diacritics: /[ăâîșțĂÂÎȘȚ]/.test(query)
  })
}

// Affiliate clicks
const handleAffiliateClick = (linkId: string, merchant: string, context: string) => {
  trackEvent(EVENTS.AFFILIATE_CLICK, {
    link_id: linkId,
    merchant,
    context, // 'movie_page' | 'event_page' | 'sidebar'
    device: isMobile ? 'mobile' : 'desktop'
  })
}
```

### Goals & Conversions Setup

```javascript
// Plausible Goals Configuration
const GOALS = {
  // Engagement Goals
  'Reminder Set': {
    event: EVENTS.REMINDER_SET,
    value: 'high' // High-value conversion
  },
  
  'Newsletter Signup': {
    event: EVENTS.NEWSLETTER_SIGNUP,
    value: 'medium'
  },
  
  'Search Used': {
    event: EVENTS.SEARCH_USE,
    value: 'medium'
  },
  
  // Monetization Goals
  'Affiliate Click': {
    event: EVENTS.AFFILIATE_CLICK,
    value: 'revenue' // Tracks potential revenue
  },
  
  'Ticket Click': {
    event: EVENTS.TICKET_CLICK,
    value: 'revenue'
  },
  
  // Retention Goals
  'Return Visit': {
    custom_property: 'returning_visitor',
    value: 'high'
  },
  
  // Content Goals
  'Deep Engagement': {
    condition: 'pages_viewed > 3',
    value: 'high'
  }
}
```

## Custom Dashboard Queries 📋

### Weekly Performance Report

```sql
-- Weekly KPI Summary
SELECT 
  DATE_TRUNC('week', date) as week,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  SUM(pageviews) as total_pageviews,
  ROUND(AVG(pageviews), 2) as avg_pages_per_session,
  COUNT(CASE WHEN event_name = 'reminder_set' THEN 1 END) as reminders_set,
  COUNT(CASE WHEN event_name = 'newsletter_signup' THEN 1 END) as newsletter_signups,
  COUNT(CASE WHEN event_name = 'affiliate_click' THEN 1 END) as affiliate_clicks
FROM plausible_events 
WHERE date >= CURRENT_DATE - INTERVAL '8 weeks'
GROUP BY week
ORDER BY week DESC;
```

### Content Performance Analysis

```sql
-- Top Performing Content
SELECT 
  page,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(*) as pageviews,
  AVG(session_duration) as avg_session_duration,
  COUNT(CASE WHEN event_name = 'reminder_set' THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN event_name = 'reminder_set' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as conversion_rate
FROM plausible_events 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND page NOT LIKE '/admin%'
GROUP BY page
HAVING pageviews > 50
ORDER BY conversion_rate DESC, pageviews DESC
LIMIT 20;
```

### User Journey Analysis

```sql
-- User Journey Funnel
WITH journey_steps AS (
  SELECT 
    visitor_id,
    MIN(CASE WHEN page = '/' THEN timestamp END) as homepage_visit,
    MIN(CASE WHEN event_name = 'search_use' THEN timestamp END) as first_search,
    MIN(CASE WHEN event_name = 'reminder_set' THEN timestamp END) as first_reminder,
    MIN(CASE WHEN event_name = 'newsletter_signup' THEN timestamp END) as newsletter_signup
  FROM plausible_events
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY visitor_id
)
SELECT 
  COUNT(*) as total_visitors,
  COUNT(first_search) as used_search,
  COUNT(first_reminder) as set_reminder, 
  COUNT(newsletter_signup) as subscribed_newsletter,
  ROUND(COUNT(first_search) * 100.0 / COUNT(*), 2) as search_rate,
  ROUND(COUNT(first_reminder) * 100.0 / COUNT(*), 2) as reminder_rate,
  ROUND(COUNT(newsletter_signup) * 100.0 / COUNT(*), 2) as subscription_rate
FROM journey_steps;
```

## Real-Time Monitoring 📡

### Key Metrics Dashboard

```typescript
// Real-time dashboard component
interface DashboardMetrics {
  todayVisitors: number
  todayPageviews: number
  activeReminders: number
  newsletterSubscribers: number
  todayConversions: number
  affiliateClicks: number
  searchQueries: number
  coreWebVitals: {
    lcp: number
    cls: number
    inp: number
  }
}

const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Fetch from Plausible API and your database
  const [plausibleData, dbData] = await Promise.all([
    fetch('/api/plausible/today').then(r => r.json()),
    fetch('/api/dashboard/metrics').then(r => r.json())
  ])
  
  return {
    todayVisitors: plausibleData.visitors.value,
    todayPageviews: plausibleData.pageviews.value,
    activeReminders: dbData.active_reminders,
    newsletterSubscribers: dbData.newsletter_subscribers,
    todayConversions: plausibleData.goals.reminder_set || 0,
    affiliateClicks: plausibleData.goals.affiliate_click || 0,
    searchQueries: plausibleData.goals.search_use || 0,
    coreWebVitals: dbData.core_web_vitals
  }
}
```

### Alert Thresholds

```yaml
# Dashboard alert configuration
alerts:
  traffic_drop:
    condition: "today_visitors < yesterday_visitors * 0.7"
    severity: "warning"
    
  conversion_drop: 
    condition: "reminder_conversion_rate < 3%"
    severity: "critical"
    
  performance_degradation:
    condition: "avg_lcp > 3000ms"
    severity: "warning"
    
  affiliate_issues:
    condition: "affiliate_ctr < 2%"
    severity: "info"
    
  search_problems:
    condition: "search_error_rate > 5%"
    severity: "warning"
```

## Weekly Automated Reports 📧

### Report Template

```typescript
// Weekly report generation
interface WeeklyReport {
  period: string
  traffic: {
    visitors: number
    pageviews: number
    growth: number
  }
  engagement: {
    remindersSet: number
    newsletterSignups: number
    searchUsage: number
  }
  monetization: {
    affiliateClicks: number
    estimatedRevenue: number
  }
  performance: {
    avgLCP: number
    avgCLS: number
    mobileScore: number
  }
  topContent: Array<{
    page: string
    visitors: number
    conversions: number
  }>
}

const generateWeeklyReport = async (): Promise<WeeklyReport> => {
  // Generate comprehensive weekly report
  // This would be called by a cron job every Sunday
}

const sendWeeklyReport = async (report: WeeklyReport) => {
  // Send via email to stakeholders
  const emailTemplate = `
    📊 CateZile.ro Weekly Report - ${report.period}
    
    🚀 Traffic Growth: ${report.traffic.growth > 0 ? '+' : ''}${report.traffic.growth}%
    👥 Unique Visitors: ${report.traffic.visitors.toLocaleString()}
    📄 Page Views: ${report.traffic.pageviews.toLocaleString()}
    
    💯 Engagement:
    ⏰ Reminders Set: ${report.engagement.remindersSet}
    📧 Newsletter Signups: ${report.engagement.newsletterSignups}
    🔍 Search Usage: ${report.engagement.searchUsage}
    
    💰 Monetization:
    🔗 Affiliate Clicks: ${report.monetization.affiliateClicks}
    💵 Est. Revenue: €${report.monetization.estimatedRevenue}
    
    ⚡ Performance:
    📱 Mobile Score: ${report.performance.mobileScore}/100
    🎯 LCP: ${report.performance.avgLCP}ms
    
    🏆 Top Content:
    ${report.topContent.map(c => `📄 ${c.page}: ${c.visitors} visitors, ${c.conversions} conversions`).join('\n')}
  `
  
  await sendEmail({
    to: 'team@catezile.ro',
    subject: `📊 Weekly Report - ${report.period}`,
    body: emailTemplate
  })
}
```

## A/B Testing Framework 🧪

### Homepage Hero A/B Test

```typescript
// A/B testing for homepage hero section
interface ABTest {
  name: string
  variants: string[]
  traffic_split: number[]
  success_metric: string
}

const ACTIVE_TESTS: ABTest[] = [
  {
    name: 'homepage_hero',
    variants: ['derby', 'today', 'trending', 'auto'],
    traffic_split: [0.25, 0.25, 0.25, 0.25],
    success_metric: 'hero_click'
  }
]

const getABVariant = (testName: string, visitorId: string): string => {
  const test = ACTIVE_TESTS.find(t => t.name === testName)
  if (!test) return 'control'
  
  // Consistent hash-based assignment
  const hash = simpleHash(visitorId + testName)
  const bucket = hash % 100
  
  let cumulative = 0
  for (let i = 0; i < test.variants.length; i++) {
    cumulative += test.traffic_split[i] * 100
    if (bucket < cumulative) {
      return test.variants[i]
    }
  }
  
  return test.variants[0]
}

// Track A/B test participation
const trackABTest = (testName: string, variant: string) => {
  trackEvent('ab_test_view', {
    test_name: testName,
    variant: variant,
    visitor_id: getVisitorId()
  })
}

// Track A/B test conversion
const trackABConversion = (testName: string, variant: string) => {
  trackEvent('ab_test_conversion', {
    test_name: testName,
    variant: variant,
    visitor_id: getVisitorId()
  })
}
```

### A/B Test Analysis

```sql
-- A/B Test Results Analysis
WITH test_data AS (
  SELECT 
    props->>'test_name' as test_name,
    props->>'variant' as variant,
    props->>'visitor_id' as visitor_id,
    event_name,
    timestamp
  FROM plausible_events 
  WHERE event_name IN ('ab_test_view', 'ab_test_conversion')
    AND date >= CURRENT_DATE - INTERVAL '14 days'
    AND props->>'test_name' = 'homepage_hero'
),
summary AS (
  SELECT 
    variant,
    COUNT(DISTINCT CASE WHEN event_name = 'ab_test_view' THEN visitor_id END) as participants,
    COUNT(DISTINCT CASE WHEN event_name = 'ab_test_conversion' THEN visitor_id END) as conversions
  FROM test_data
  GROUP BY variant
)
SELECT 
  variant,
  participants,
  conversions,
  ROUND(conversions * 100.0 / participants, 2) as conversion_rate,
  -- Statistical significance calculation would go here
  CASE 
    WHEN participants > 1000 AND conversions > 30 THEN 'sufficient_data'
    ELSE 'insufficient_data'
  END as statistical_power
FROM summary
ORDER BY conversion_rate DESC;
```

## Implementation Steps 🚀

### Phase 1: Basic Tracking (Week 1)
- [ ] Set up Plausible Analytics account
- [ ] Implement core event tracking
- [ ] Configure basic goals and conversions
- [ ] Test tracking in development

### Phase 2: Advanced Analytics (Week 2)
- [ ] Add custom properties and segmentation
- [ ] Set up automated reports
- [ ] Create dashboard visualizations
- [ ] Implement A/B testing framework

### Phase 3: Optimization (Week 3-4)
- [ ] Analyze initial data and optimize
- [ ] Set up alerting and monitoring
- [ ] Create performance benchmarks
- [ ] Launch first A/B tests

### Phase 4: Automation (Ongoing)
- [ ] Automate weekly reports
- [ ] Set up real-time dashboards
- [ ] Implement predictive analytics
- [ ] Continuous optimization based on data

---

**Analytics Setup Owner:** ___________
**Implementation Start:** ___________
**First Report Date:** ___________