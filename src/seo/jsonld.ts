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

export const eventJsonLd = (opts: { 
  name: string; 
  startDate: Date | string | number; 
  url?: string;
  location?: string;
  description?: string;
  organizer?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: opts.name,
  startDate: new Date(opts.startDate).toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: opts.location ? {
    "@type": "Place",
    name: opts.location
  } : undefined,
  description: opts.description,
  organizer: opts.organizer ? {
    "@type": "Organization", 
    name: opts.organizer
  } : undefined,
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

export const movieJsonLd = (opts: { 
  name: string; 
  releaseDate?: Date | string | number; 
  url?: string;
  genre?: string[];
  director?: string;
  description?: string;
  duration?: string;
  contentRating?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Movie",
  name: opts.name,
  datePublished: opts.releaseDate ? new Date(opts.releaseDate).toISOString() : undefined,
  genre: opts.genre,
  director: opts.director ? { "@type": "Person", name: opts.director } : undefined,
  description: opts.description,
  duration: opts.duration,
  contentRating: opts.contentRating,
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const tvEpisodeJsonLd = (opts: { name: string; episodeNumber?: number; seasonNumber?: number; seriesName: string; airDate: Date | string | number; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "TVEpisode", 
  name: opts.name,
  episodeNumber: opts.episodeNumber,
  seasonNumber: opts.seasonNumber,
  partOfSeries: {
    "@type": "TVSeries",
    name: opts.seriesName
  },
  datePublished: new Date(opts.airDate).toISOString(),
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const tvSeriesJsonLd = (opts: { name: string; startDate?: Date | string | number; genres?: string[]; url?: string }) => ({
  "@context": "https://schema.org",
  "@type": "TVSeries",
  name: opts.name,
  startDate: opts.startDate ? new Date(opts.startDate).toISOString() : undefined,
  genre: opts.genres,
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

export const faqPageJsonLd = (opts: { 
  faqs: Array<{ question: string; answer: string }>;
  url?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: opts.faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  })),
  inLanguage: "ro-RO",
  url: opts.url || (typeof window !== "undefined" ? window.location.href : undefined),
});

export const breadcrumbListJsonLd = (opts: {
  items: Array<{ name: string; url: string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: opts.items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const publisherJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CateZile.ro",
  url: "https://catezile.ro",
  logo: {
    "@type": "ImageObject",
    url: "https://catezile.ro/favicon.ico",
    width: 32,
    height: 32
  },
  sameAs: [
    "https://www.facebook.com/catezile.ro",
    "https://twitter.com/catezile_ro"
  ]
});
