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
