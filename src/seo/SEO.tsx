import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "./canonical";
import { organizationJsonLd, websiteJsonLd } from "./jsonld";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "CateZile.ro — Câte zile până…";
const DEFAULT_DESC = "Cronometre și countdown-uri pentru evenimente populare în limba română.";

export const SEO = ({ title, description, path, noIndex }: SEOProps) => {
  const canonical = getCanonicalUrl(path);
  const pageTitle = title ? `${title} | CateZile.ro` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="ro" />
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ro" href={canonical} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <script type="application/ld+json">{JSON.stringify(organizationJsonLd())}</script>
      <script type="application/ld+json">{JSON.stringify(websiteJsonLd())}</script>
    </Helmet>
  );
};
