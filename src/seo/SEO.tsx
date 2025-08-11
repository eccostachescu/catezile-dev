import { Helmet } from "react-helmet-async";
import { buildCanonical, buildHreflangs } from "./canonical";
import { organizationJsonLd, websiteJsonLd } from "./jsonld";
import { routeRobots } from "./robots";
import { buildOgUrl } from "./og";
import { truncateForMeta } from "./snippet";

export interface SEOProps {
  kind?: 'home'|'event'|'match'|'movie'|'category'|'generic'|'bf';
  slug?: string;
  id?: string;
  merchant?: string;
  title?: string;
  description?: string;
  h1?: string;
  imageUrl?: string;
  path?: string;
  noindex?: boolean;
  noIndex?: boolean; // backward-compat
}


const DEFAULT_TITLE = "CateZile.ro — Câte zile până…";
const DEFAULT_DESC = "Cronometre și countdown-uri pentru evenimente populare în limba română.";

export const SEO = ({ kind = 'generic', slug, id, merchant, title, description, path, noindex, noIndex, imageUrl }: SEOProps) => {
  const canonical = buildCanonical(path);
  const pageTitle = title ? `${title} — CateZile.ro` : DEFAULT_TITLE;
  const desc = truncateForMeta(description || DEFAULT_DESC);
  const robots = (noindex || noIndex) ? "noindex,nofollow" : routeRobots(path || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const ogImage = imageUrl || buildOgUrl({ type: kind, slug, id, merchant, title });
  const hreflangs = buildHreflangs(canonical);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="ro" />
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={robots} />

      <link rel="canonical" href={canonical} />
      {hreflangs.map((h) => (
        <link key={h.hrefLang} rel="alternate" hrefLang={h.hrefLang} href={h.href} />
      ))}

      <meta property="og:site_name" content="CateZile.ro" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {kind === 'home' && (
        <>
          <script type="application/ld+json">{JSON.stringify(organizationJsonLd())}</script>
          <script type="application/ld+json">{JSON.stringify(websiteJsonLd())}</script>
        </>
      )}
    </Helmet>
  );
};

