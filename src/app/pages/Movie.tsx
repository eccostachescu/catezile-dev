import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MovieCard from "@/components/cards/MovieCard";
import { Helmet } from "react-helmet-async";
import { movieJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useState } from "react";
import { loadMovie } from "@/ssg/loader";
import MovieHero from "@/components/movies/MovieHero";
import TrailerEmbed from "@/components/movies/TrailerEmbed";
import ActionsBar from "@/components/movies/ActionsBar";

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
        <script type="application/ld+json">{JSON.stringify(movieJsonLd({ name: title, releaseDate: release }))}</script>
      </Helmet>
      <Container className="py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Filme", href: routes.movies() }, { label: title }]} />
      </Container>
      {m && (
        <>
          <MovieHero movie={m} />
          <Container className="py-6 space-y-6">
            <section aria-labelledby="movie-info" className="space-y-4">
              <h2 id="movie-info" className="sr-only">Detalii film</h2>
              <ActionsBar url={typeof window !== 'undefined' ? window.location.href : ''} cinemaDate={m.cinema_release_ro} netflixDate={m.netflix_date} primeDate={m.prime_date} />
              {m.overview && <p className="text-muted-foreground max-w-3xl">{m.overview}</p>}
              <TrailerEmbed youtubeKey={m.trailer_youtube_key} />
            </section>
          </Container>
        </>
      )}
    </>
  );
}
