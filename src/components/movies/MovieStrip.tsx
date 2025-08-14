import { Card, CardContent } from "@/components/Card";
import { MovieCountdownCard } from "./MovieCountdownCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function MovieStrip({ title, items = [] as any[] }: { title: string; items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Carousel className="relative">
        <CarouselContent>
          {items.map((m) => (
            <CarouselItem key={m.id} className="basis-3/4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <MovieCountdownCard 
                movie={{
                  id: m.id,
                  title: m.title,
                  slug: m.slug || m.id,
                  poster_path: m.poster_url,
                  cinema_release_ro: m.cinema_release_ro,
                  overview: m.overview,
                  genres: m.genres,
                  runtime: m.runtime,
                  popularity: m.popularity,
                  next_date: m.cinema_release_ro ? {
                    date: m.cinema_release_ro,
                    type: 'cinema',
                    platform: 'Cinema'
                  } : m.netflix_date ? {
                    date: m.netflix_date,
                    type: 'streaming',
                    platform: 'Netflix'
                  } : m.prime_date ? {
                    date: m.prime_date,
                    type: 'streaming',
                    platform: 'Prime Video'
                  } : undefined
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
