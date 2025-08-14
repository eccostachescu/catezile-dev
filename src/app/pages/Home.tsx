import { SEO } from "@/seo/SEO";
import NewHomepage from "@/components/homepage/NewHomepage";
import { useAuthTokenHandler } from "@/hooks/useAuthTokenHandler";

export default function Home() {
  // Handle auth tokens if present in URL hash
  useAuthTokenHandler();

  return (
    <>
      <SEO
        kind="home"
        title="CateZile.ro — Calendarul României: meciuri, filme, sărbători, evenimente"
        description="Vezi pe ce canal e meciul, când apar filmele în România, zilele libere și evenimentele mari. Setează remindere gratuite."
        path="/"
      />
      
      <NewHomepage />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ 
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CateZile.ro",
          url: "https://catezile.ro",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://catezile.ro/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      }} />
    </>
  );
}

function hrefFor(base: string, it: any) {
  if (it.kind === 'match') return `${base}/sport/${it.slug || it.id}`;
  if (it.kind === 'movie') return `${base}/filme/${it.slug || it.id}`;
  if (it.kind === 'event') return `${base}/evenimente/${it.slug}`;
  return base;
}
