import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Helmet } from "react-helmet-async";
import { movieJsonLd, breadcrumbListJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useState } from "react";
import { loadMovie } from "@/ssg/loader";
import { MovieHeroEnhanced } from "@/components/movies/MovieHeroEnhanced";
import { MovieDetailsGrid } from "@/components/movies/MovieDetailsGrid";

export default function Movie() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [item, setItem] = useState<any | null>(initial?.item || null);
  const [loaded, setLoaded] = useState(!!initial?.item);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try { if (!initial?.item && id) { const x = await loadMovie(id); if (!cancelled) setItem(x); } } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial?.item) run();
    return () => { cancelled = true; };
  }, [initial, id]);

  const noindex = typeof window !== 'undefined' && !initial?.item && !loaded;
  const m = item || initial?.item;

  const title = m?.title || "Film";
  const release = m?.cinema_release_ro || undefined;

  return (
    <>
      <SEO kind="movie" id={id} title={m?.seo_title || title} description={m?.seo_description} h1={m?.seo_h1} path={pathname} noindex={noindex} />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(movieJsonLd({ 
            name: title, 
            releaseDate: release,
            genre: m?.genres,
            director: m?.streaming_ro?.director || m?.director || m?.credits?.crew?.find((person: any) => person.job === 'Director')?.name,
            description: m?.overview,
            duration: m?.runtime ? `PT${m.runtime}M` : undefined,
            contentRating: m?.certification
          }))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbListJsonLd({
            items: [
              { name: "Acasă", url: routes.home() },
              { name: "Filme", url: routes.movies() },
              { name: title, url: typeof window !== 'undefined' ? window.location.href : '' }
            ]
          }))}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <Container className="pt-4 pb-2">
          <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Filme", href: routes.movies() }, { label: title }]} />
        </Container>
        
        {m && (
          <>
            <MovieHeroEnhanced movie={m} />
            <MovieDetailsGrid movie={m} />
          </>
        )}
      </div>
    </>
  );
}