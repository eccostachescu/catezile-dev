import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MovieCard from "@/components/cards/MovieCard";
import { Helmet } from "react-helmet-async";
import { movieJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { useLocation } from "react-router-dom";

export default function Movie() {
  const title = "Moromeții 3";
  const inCinemas = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const onNetflix = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const { pathname } = useLocation();
  return (
    <>
      <SEO title="Film" path={pathname} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(movieJsonLd({ name: title, releaseDate: inCinemas }))}</script>
      </Helmet>
      <Container className="py-8">
        <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Filme", href: routes.movies() }, { label: title }]} />
        <h1 className="text-3xl font-semibold mb-4">Film</h1>
        <section aria-labelledby="movie-info" className="space-y-6">
          <h2 id="movie-info" className="sr-only">Detalii film</h2>
          <MovieCard title={title} inCinemasAt={inCinemas} onNetflixAt={onNetflix} />
        </section>
      </Container>
    </>
  );
}
