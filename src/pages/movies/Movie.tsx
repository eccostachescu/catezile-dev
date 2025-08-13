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
import { MovieTrailer } from "@/components/movies/MovieTrailer";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { MovieWhereToWatch } from "@/components/movies/MovieWhereToWatch";
import ReminderButton from "@/components/ReminderButton";
import FollowButton from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { track } from "@/lib/analytics";

export default function Movie() {
  const { pathname } = useLocation();
  const { slug } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [item, setItem] = useState<any | null>(initial?.item || null);
  const [loaded, setLoaded] = useState(!!initial?.item);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try { 
        if (!initial?.item && slug) { 
          const x = await loadMovie(slug); 
          if (!cancelled) setItem(x); 
        } 
      } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial?.item) run();
    return () => { cancelled = true; };
  }, [initial, slug]);

  const noindex = typeof window !== 'undefined' && !initial?.item && !loaded;
  const m = item || initial?.item;

  const title = m?.title || "Film";
  const release = m?.cinema_release_ro || undefined;

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ url, title: m?.title });
      } else {
        await navigator.clipboard.writeText(url);
      }
      track('share_click', { url, type: 'movie' });
    } catch {}
  };

  return (
    <>
      <SEO 
        kind="movie" 
        id={slug} 
        title={m?.seo_title || `${title} — Data premierei în România`} 
        description={m?.seo_description || `Când apare ${title} la cinema în România și pe Netflix/Prime. Setează reminder să nu uiți!`} 
        h1={m?.seo_h1} 
        path={pathname} 
        noindex={noindex} 
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(movieJsonLd({ name: title, releaseDate: release }))}
        </script>
      </Helmet>
      
      <Container className="py-8 space-y-6">
        <Breadcrumbs 
          items={[
            { label: "Acasă", href: routes.home() }, 
            { label: "Filme", href: routes.movies() }, 
            { label: title }
          ]} 
        />
      </Container>
      
      {m && (
        <>
          <MovieHero movie={m} />
          
          <Container className="py-6 space-y-8">
            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 items-center">
              {m.next_date && (
                <ReminderButton
                  when={m.next_date.date}
                  kind="movie"
                  entityId={m.id}
                />
              )}
              <FollowButton />
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partajează
              </Button>
            </div>

            {/* Movie Info */}
            <section aria-labelledby="movie-info" className="space-y-6">
              <h2 id="movie-info" className="sr-only">Informații film</h2>
              
              {m.overview && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Despre film</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-4xl">
                    {m.overview}
                  </p>
                </div>
              )}

              <MovieMeta 
                runtime={m.runtime}
                genres={m.genres}
                certification={m.certification}
                releaseYear={m.cinema_release_ro ? new Date(m.cinema_release_ro).getFullYear() : undefined}
              />

              <MovieWhereToWatch 
                platforms={m.platforms || []}
                streamingRo={m.streaming_ro}
              />

              {m.trailer_key && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Trailer</h3>
                  <MovieTrailer 
                    trailerKey={m.trailer_key}
                    title={m.title}
                    posterUrl={m.poster_url}
                  />
                </div>
              )}
            </section>
          </Container>

          {/* TMDB Disclaimer */}
          <Container className="py-4">
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              Acest produs folosește API-ul TMDB, fără a fi aprobat sau certificat de TMDB.
            </div>
          </Container>
        </>
      )}
    </>
  );
}