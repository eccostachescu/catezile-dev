import EventCard from "@/components/cards/EventCard";
import Container from "@/components/Container";
import { Link } from "react-router-dom";

export interface FeaturedTimersProps {
  events: { slug: string; title: string; start_at: string | Date | null; }[];
}

export default function FeaturedTimers({ events }: FeaturedTimersProps) {
  if (!events?.length) return null;
  return (
    <section className="py-8">
      <Container>
        <h2 className="sr-only">Evenimente recomandate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((e) => (
            <Link key={e.slug} to={`/evenimente/${e.slug}`} aria-label={`Deschide ${e.title}`}>
              <EventCard title={e.title} datetime={e.start_at || new Date()} />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
