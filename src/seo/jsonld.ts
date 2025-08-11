export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CateZile.ro",
  url: typeof window !== "undefined" ? window.location.origin : "https://catezile.ro",
  logo: "/favicon.ico",
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CateZile.ro",
  url: typeof window !== "undefined" ? window.location.origin : "https://catezile.ro",
  potentialAction: {
    "@type": "SearchAction",
    target: `${typeof window !== "undefined" ? window.location.origin : "https://catezile.ro"}/?q={search_term_string}`,
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
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const sportsEventJsonLd = (opts: { name: string; homeTeam: string; awayTeam: string; startDate: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: opts.name,
  startDate: new Date(opts.startDate).toISOString(),
  homeTeam: { "@type": "SportsTeam", name: opts.homeTeam },
  awayTeam: { "@type": "SportsTeam", name: opts.awayTeam },
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const movieJsonLd = (opts: { name: string; releaseDate?: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Movie",
  name: opts.name,
  datePublished: opts.releaseDate ? new Date(opts.releaseDate).toISOString() : undefined,
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

