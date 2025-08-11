import Container from "@/components/Container";
import MovieCard from "@/components/cards/MovieCard";

export default function MoviesStrip({ movies }: { movies: any[] }) {
  if (!movies?.length) return null;
  return (
    <section className="py-6">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Lansări de film</h2>
          <a className="text-sm underline underline-offset-4" href="/filme">Vezi toate</a>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x">
          {movies.map((m) => (
            <a key={m.id} href={`/filme/${m.id}`} className="min-w-[320px] snap-start">
              <MovieCard title={m.title} posterUrl={m.poster_url || undefined} inCinemasAt={m.cinema_release_ro || undefined} onNetflixAt={m.netflix_date || undefined} onPrimeAt={m.prime_date || undefined} />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
