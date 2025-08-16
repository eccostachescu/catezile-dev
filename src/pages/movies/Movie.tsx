import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Helmet } from "react-helmet-async";
import { movieJsonLd } from "@/seo/jsonld";
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
  const { slug } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [item, setItem] = useState<any | null>(initial?.item || null);
  const [loaded, setLoaded] = useState(!!initial?.item);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try { if (!initial?.item && slug) { const x = await loadMovie(slug); if (!cancelled) setItem(x); } } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial?.item) run();
    return () => { cancelled = true; };
  }, [initial, slug]);

  const noindex = typeof window !== 'undefined' && !initial?.item && !loaded;
  const m = item || initial?.item;

  const title = m?.title || "Film";
  const release = m?.cinema_release_ro || undefined;

  return (
    <>
      <SEO kind="movie" id={slug} title={m?.seo_title || title} description={m?.seo_description} h1={m?.seo_h1} path={pathname} noindex={noindex} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(movieJsonLd({ name: title, releaseDate: release }))}</script>
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