import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MovieCard from "@/components/cards/MovieCard";

export default function Movie() {
  const inCinemas = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const onNetflix = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  return (
    <>
      <SEO title="Film" path={location.pathname} />
      <Container className="py-8">
        <h1 className="text-3xl font-semibold mb-4">Film</h1>
        <section aria-labelledby="movie-info" className="space-y-6">
          <h2 id="movie-info" className="sr-only">Detalii film</h2>
          <MovieCard title="Moromeții 3" inCinemasAt={inCinemas} onNetflixAt={onNetflix} />
        </section>
      </Container>
    </>
  );
}
