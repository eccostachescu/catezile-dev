import Container from "@/components/Container";
import { Card, CardContent } from "@/components/Card";
import WatchBadges from "./WatchBadges";

export default function MovieHero({ movie }: { movie: any }) {
  return (
    <div className="relative">
      {movie.backdrop_url && (
        <img src={movie.backdrop_url} alt={`Backdrop ${movie.title}`} className="w-full h-48 sm:h-64 md:h-80 object-cover" loading="lazy" />
      )}
      <Container className="py-6">
        <div className="flex gap-4">
          {movie.poster_url && (
            <img src={movie.poster_url} alt={`Poster ${movie.title}`} className="w-28 sm:w-36 md:w-44 rounded-md shadow" loading="lazy" />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{movie.seo_h1 || movie.title}</h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-muted-foreground text-sm">{movie.original_title}</p>
            )}
            <div className="mt-3">
              <WatchBadges cinemaDate={movie.cinema_release_ro} netflixDate={movie.netflix_date} primeDate={movie.prime_date} provider={movie.provider} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
