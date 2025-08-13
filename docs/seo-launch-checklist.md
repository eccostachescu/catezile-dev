# SEO Launch Checklist (Romania) 🇷🇴

## Core SEO Setup ✅

### On-Page Optimization
- [ ] **Title Tags:** Unique, under 60 chars, include main keyword
  - Homepage: "CateZile.ro - Meciuri TV, Filme, Sărbători și Evenimente România"
  - Sport: "Liga 1 Live - Program TV Sport România | CateZile.ro"
  - Movies: "Filme Noi România - Cinema și Netflix | CateZile.ro"
  - Holidays: "Sărbători România 2024-2025 - Calendar Zile Libere | CateZile.ro"

- [ ] **Meta Descriptions:** 150-160 chars, compelling, include target keywords
- [ ] **H1 Tags:** Single H1 per page, matches primary intent
- [ ] **Heading Hierarchy:** H1 → H2 → H3 logical structure
- [ ] **URL Structure:** Clean, descriptive, crawlable
- [ ] **Internal Linking:** Strategic links between related content

### Technical SEO
- [ ] **Sitemap.xml:** Generated and submitted to GSC/Bing
- [ ] **Robots.txt:** Proper directives, allows important content
- [ ] **Canonical Tags:** Prevent duplicate content issues
- [ ] **Meta Viewport:** Responsive design declaration
- [ ] **Lang Attributes:** `<html lang="ro">` set correctly
- [ ] **Schema Markup:** JSON-LD for all content types

### Romanian Market Optimization
- [ ] **Romanian Keywords:** Target "program tv", "meciuri live", "filme noi"
- [ ] **Local Time Zone:** Europe/Bucharest for all dates/times
- [ ] **Currency:** RON for pricing (where applicable)
- [ ] **Romanian Content:** All UI text in Romanian
- [ ] **Diacritics:** Proper handling of ă, â, î, ș, ț
- [ ] **Search Terms:** Cover "liga 1", "digi sport", "netflix romania"

## Content Strategy 📝

### Pillar Content (Must-Have)
- [ ] **Sport Hub:** /liga-1, /tv-sport complete
- [ ] **Movies Hub:** /filme with current releases
- [ ] **Holidays Hub:** /sarbatori with full calendar
- [ ] **Events Hub:** /evenimente with local content
- [ ] **TV Guide:** /tv with current programming

### Long-Tail Content
- [ ] "Pe ce canal e meciul de azi?"
- [ ] "Când apar filme noi pe Netflix România?"
- [ ] "Calendar sărbători legale România 2024"
- [ ] "Programe TV sport live online"
- [ ] "Evenimente weekend București/Cluj/Timișoara"

### Seasonal Content
- [ ] **Q1:** Liga 1 retur, filme premii, Mărțișor, Paște
- [ ] **Q2:** EURO 2024, filme vară, 1 Mai, Rusalii
- [ ] **Q3:** Transferuri fotbal, filme horror Halloween, școală
- [ ] **Q4:** Liga 1 tur, Black Friday, filme Crăciun, Revelion

## Search Console Setup 🔍

### Google Search Console
- [ ] Property added for https://catezile.ro
- [ ] Sitemap submitted: https://catezile.ro/sitemap.xml
- [ ] Core Web Vitals monitoring enabled
- [ ] Mobile usability issues resolved
- [ ] Romanian target country set in International Targeting

### Bing Webmaster Tools
- [ ] Site verified and submitted
- [ ] Sitemap submitted to Bing
- [ ] Geographic targeting set to Romania
- [ ] Crawl errors monitoring setup

### Initial Keywords to Track
```
Primary (High Volume):
- program tv
- liga 1
- meciuri live
- filme noi
- netflix romania

Secondary (Medium Volume):
- digi sport 1 program
- prima tv program
- antena 1 program
- netflix filme noi
- cinema city program

Long-Tail (Low Competition):
- pe ce canal e meciul romaniei
- cand apar filme noi pe netflix
- sarbatori legale romania 2024
- evenimente weekend bucuresti
- program tv sport azi
```

## Schema Markup Validation 📊

### Required Structured Data
- [ ] **WebSite:** Search action, organization info
- [ ] **Movie:** Title, release date, cast, rating
- [ ] **SportsEvent:** Teams, venue, start time, TV broadcast
- [ ] **Event:** Name, date, location, organizer
- [ ] **PublicHoliday:** Date, name, country
- [ ] **ItemList:** For category pages (movies, events)
- [ ] **BreadcrumbList:** Navigation hierarchy

### Validation Tools
```bash
# Test structured data
curl -s "https://catezile.ro/filme/movie-slug" | \
  grep -o '<script type="application/ld+json">.*</script>' | \
  jq '.' # Validate JSON

# Google Rich Results Test
# https://search.google.com/test/rich-results

# Schema.org Validator
# https://validator.schema.org/
```

## Performance for SEO ⚡

### Core Web Vitals Targets
- [ ] **LCP ≤ 2.5s:** Homepage hero optimized
- [ ] **CLS ≤ 0.1:** No layout shifts from ads/images
- [ ] **FID/INP ≤ 100ms:** Fast interactivity

### Mobile-First Optimization
- [ ] Mobile viewport configured
- [ ] Touch targets ≥ 44px
- [ ] Readable font sizes (≥ 16px)
- [ ] No horizontal scrolling
- [ ] Fast mobile loading (3G simulation)

### Image SEO
- [ ] Descriptive file names (liga-1-clasament.jpg)
- [ ] Alt text with target keywords
- [ ] Appropriate formats (WebP, AVIF)
- [ ] Lazy loading implemented
- [ ] Image sitemaps (if applicable)

## Local SEO (Romania) 🏛️

### Romanian Targeting
- [ ] Google My Business (if local presence)
- [ ] Romanian business directories
- [ ] Local partnerships (sports sites, news)
- [ ] Romanian social media presence
- [ ] Local event listings integration

### Regional Content
- [ ] București specific events
- [ ] Cluj-Napoca cultural calendar
- [ ] Timișoara sports coverage
- [ ] Regional TV channels coverage
- [ ] Local cinema chains integration

## Content Gaps Analysis 📈

### Competitor Research
```
Primary Competitors:
- digisport.ro
- prosport.ro
- gsp.ro
- cinemagia.ro
- libertatea.ro/sport

Content Opportunities:
- Real-time TV schedules
- Movie countdown timers
- Holiday bridge calculators
- Event reminders system
- Comprehensive TV guide
```

### Keyword Opportunities
- [ ] "program tv azi" (search volume analysis)
- [ ] "meciuri azi pe tv" (competition assessment)
- [ ] "filme noi 2024" (seasonal trends)
- [ ] "sarbatori 2024 romania" (evergreen content)
- [ ] "evenimente bucuresti" (local targeting)

## Launch Week SEO Actions 🚀

### Day 1-2: Technical Setup
- [ ] Submit sitemaps to search engines
- [ ] Set up Google Analytics/Plausible
- [ ] Configure Search Console properties
- [ ] Test all canonical URLs

### Day 3-5: Content Push
- [ ] Publish core pillar content
- [ ] Create initial internal link structure
- [ ] Share on owned social channels
- [ ] Send launch email to subscribers

### Day 6-7: Monitoring
- [ ] Check crawl errors in GSC
- [ ] Monitor Core Web Vitals
- [ ] Track initial rankings
- [ ] Review user engagement metrics

## 30-Day SEO Targets 🎯

### Traffic Goals
- [ ] **Organic Sessions:** 1,000+ (month 1)
- [ ] **Indexed Pages:** 80%+ of submitted URLs
- [ ] **Average Position:** Top 50 for target keywords
- [ ] **Click-Through Rate:** 2%+ from search results

### Content Milestones
- [ ] 50+ movies with rich data
- [ ] 20+ Liga 1 match pages
- [ ] Full holiday calendar indexed
- [ ] 10+ event pages with schema
- [ ] Complete TV channel coverage

### Technical KPIs
- [ ] **Page Speed:** 90+ mobile score
- [ ] **Core Web Vitals:** All "Good" status
- [ ] **Mobile Usability:** 0 issues in GSC
- [ ] **Rich Results:** 20+ eligible pages

## SEO Monitoring Dashboard 📊

### Weekly Reports
```
Track in Plausible/GSC:
- Organic traffic growth
- Top performing pages
- Search queries driving traffic
- Click-through rates
- Core Web Vitals scores
- Mobile vs desktop performance
```

### Monthly SEO Review
- [ ] Keyword ranking improvements
- [ ] Content performance analysis
- [ ] Technical issue resolution
- [ ] Competitor gap analysis
- [ ] Schema markup expansion opportunities

---

**SEO Launch Date:** ___________
**Initial Rankings Check:** ___________
**30-Day Review Date:** ___________