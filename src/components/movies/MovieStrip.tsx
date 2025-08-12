import { Card, CardContent } from "@/components/Card";
import MovieCard from "@/components/cards/MovieCard";
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
              <MovieCard title={m.title} posterUrl={m.poster_url || undefined} inCinemasAt={m.cinema_release_ro || undefined} onNetflixAt={m.netflix_date || undefined} onPrimeAt={(m as any).prime_date || undefined} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
