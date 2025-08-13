# Internationalization (i18n) - CateZile.ro

## Overview

CateZile.ro uses a custom i18n system built with Luxon for timezone handling and Intl APIs for formatting. The system is optimized for Romanian locale with English fallback for admin interfaces.

## Features

- **Romanian as primary locale** (ro-RO) with English (en) for admin
- **Europe/Bucharest timezone** with automatic DST handling
- **Natural relative time** ("azi", "mâine", "în 3 ore")
- **Romanian pluralization** with "de" particle rules
- **Diacritics handling** - display with diacritics, search without
- **SEO integration** with lang="ro" and inLanguage JSON-LD
- **SSG compatible** - server renders UTC, client converts to local time

## Quick Start

```tsx
import { useI18n } from '@/lib/i18n';
import { fmtDateTime } from '@/lib/i18n/formats';
import { countdown } from '@/lib/i18n/countdown';

function EventCard({ event }) {
  const { t } = useI18n();
  const result = countdown(event.starts_at);
  
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{t('events.startsAt')}: {fmtDateTime(event.starts_at)}</p>
      <badge>{result.label}</badge>
    </div>
  );
}
```

## Available Utilities

### Date & Time Formatting

```typescript
import { 
  fmtDate,        // "luni, 15 august 2025"
  fmtTime,        // "20:45" 
  fmtDateTime,    // "luni, 15 august 2025, ora 20:45"
  fmtShortDate,   // "15 aug"
  fmtWeekday,     // "luni"
  fmtMonth        // "august"
} from '@/lib/i18n/formats';
```

### Relative Time

```typescript
import { 
  humanDay,        // "azi", "mâine", "poimâine", "ieri"
  relativeFromNow, // "în 3 ore", "acum 2 minute"
  smartRelative    // Auto-switches between relative and absolute
} from '@/lib/i18n/relative';
```

### Countdown

```typescript
import { 
  countdown,           // Full countdown with Romanian plurals
  simpleCountdown,     // Short format for cards
  contextualCountdown  // Context-aware formatting
} from '@/lib/i18n/countdown';

// Example result
const result = countdown('2025-08-18T20:00:00+03:00');
// { label: "în 3 zile și 2 ore", sub: "luni, 18 august 2025 ora 20:00" }
```

### Diacritics & Search

```typescript
import { 
  stripDiacritics,  // "Știință" → "Stiinta"
  normalizeRo,      // "Știință" → "stiinta" (lowercase)
  slugifyRo,        // "Liga 1 — FCSB" → "liga-1-fcsb"
  matchesSearch,    // Search with/without diacritics
  createSlug        // URL-safe slug with fallback
} from '@/lib/i18n/diacritics';
```

## Romanian Pluralization Rules

The system implements Romanian "de" particle rules:

- **0, 20+**: Use "de" → "21 de zile", "0 de minute"  
- **1**: Singular → "1 zi", "1 oră"
- **2-19**: No "de" → "3 zile", "15 ore"

```typescript
// Examples
formatUnit(1, 'zi')   // "1 zi"
formatUnit(3, 'zi')   // "3 zile" 
formatUnit(21, 'zi')  // "21 de zile"
formatUnit(0, 'ora')  // "0 de ore"
```

## Timezone Handling

All dates are stored as ISO strings and converted to Europe/Bucharest timezone:

```typescript
import { DateTime } from 'luxon';

const TZ = 'Europe/Bucharest';
const now = DateTime.now().setZone(TZ);

// Summer: UTC+3, Winter: UTC+2 (automatic DST)
```

### SSG Compatibility

- Server: Renders dates as ISO strings
- Client: Converts to Romanian timezone on hydration
- Search: Uses normalized text for indexing

## Translation Keys

```typescript
// Use the t() function from useI18n hook
const { t } = useI18n();

t('events.title')           // "Evenimente în România" 
t('time.today')             // "azi"
t('unit.day', 5)           // "5 zile"
t('countdown.and')         // "și"
```

## Admin Interface

Admin users can switch to English locale:

```typescript
const { setLocale } = useI18n();
setLocale('en'); // Switch to English for admin
```

## SEO Integration

The i18n system automatically adds:

- `<html lang="ro">`
- `<meta http-equiv="content-language" content="ro-RO">`
- `"inLanguage": "ro-RO"` in JSON-LD structured data

## Testing

Run i18n tests:

```bash
npm test src/lib/i18n/__tests__/
```

Tests cover:
- Date/time formatting with Romanian locale
- Relative time edge cases  
- Countdown pluralization rules
- Diacritics normalization
- Timezone DST transitions

## Performance

- **Bundle size**: ~15KB (Luxon tree-shaken)
- **Runtime**: Client-side timezone conversion only
- **Caching**: Intl formatters are reused
- **SSG**: No impact on static generation

## Debugging

### Common Issues

1. **Wrong timezone**: Check Europe/Bucharest is set
2. **Missing diacritics**: Verify Romanian locale in Luxon
3. **Plurals wrong**: Test with different counts (0, 1, 3, 21)
4. **Search not working**: Check diacritics normalization

### Debug Commands

```typescript
// Check current timezone
console.log(DateTime.now().setZone('Europe/Bucharest').offset);

// Test diacritics
console.log(stripDiacritics('Știință')); // Should be "Stiinta"

// Test plurals  
console.log(countdown('2025-08-18T12:00:00+03:00')); // Check label format
```

## Contributing

When adding new translations:

1. Add keys to `src/lib/i18n/ro.ts`
2. Add English equivalents to `src/lib/i18n/en.ts`  
3. Use TypeScript for key safety
4. Write tests for new formatting functions
5. Update this README with examples

## Migration Notes

If changing from another i18n library:

1. Replace date formatting with our utilities
2. Update countdown logic to use Romanian plurals
3. Add diacritics handling to search
4. Test timezone handling thoroughly
5. Verify SEO meta tags are correct