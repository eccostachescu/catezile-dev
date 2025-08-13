export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CateZile.ro",
  url: typeof window !== "undefined" ? window.location.origin : "https://catezile.ro",
  logo: "/favicon.ico",
  inLanguage: "ro-RO",
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CateZile.ro",
  url: typeof window !== "undefined" ? window.location.origin : "https://catezile.ro",
  inLanguage: "ro-RO",
  potentialAction: {
    "@type": "SearchAction",
    target: `${typeof window !== "undefined" ? window.location.origin : "https://catezile.ro"}/cauta?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const eventJsonLd = (opts: { name: string; startDate: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: opts.name,
  startDate: new Date(opts.startDate).toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const sportsEventJsonLd = (opts: { name: string; homeTeam: string; awayTeam: string; startDate: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: opts.name,
  startDate: new Date(opts.startDate).toISOString(),
  homeTeam: { "@type": "SportsTeam", name: opts.homeTeam },
  awayTeam: { "@type": "SportsTeam", name: opts.awayTeam },
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const movieJsonLd = (opts: { name: string; releaseDate?: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Movie",
  name: opts.name,
  datePublished: opts.releaseDate ? new Date(opts.releaseDate).toISOString() : undefined,
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const broadcastEventJsonLd = (opts: { channelName: string; startDate: Date | string | number; endDate?: Date | string | number; isLive?: boolean; sports?: { name: string; homeTeam: string; awayTeam: string; startDate: Date | string | number } }) => ({
  "@context": "https://schema.org",
  "@type": "BroadcastEvent",
  name: `${opts.sports ? opts.sports.name : 'Program sport'} — ${opts.channelName}`,
  startDate: new Date(opts.startDate).toISOString(),
  endDate: opts.endDate ? new Date(opts.endDate).toISOString() : undefined,
  isLiveBroadcast: !!opts.isLive,
  inLanguage: "ro-RO",
  broadcastOfEvent: opts.sports ? sportsEventJsonLd({ name: opts.sports.name, homeTeam: opts.sports.homeTeam, awayTeam: opts.sports.awayTeam, startDate: opts.sports.startDate }) : undefined,
  broadcastChannel: {
    "@type": "TelevisionChannel",
    name: opts.channelName,
    broadcastServiceTier: "RO",
  },
});

