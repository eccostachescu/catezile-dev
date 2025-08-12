import Container from "@/components/Container";
import EventCard from "@/components/cards/EventCard";
import { Link } from "react-router-dom";

export default function SectionList({ title, items, href }: { title: string; items: any[]; href: string }) {
  if (!items?.length) return null;
  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Link className="text-sm underline underline-offset-4" to={href}>Vezi toate</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((e) => (
            <Link key={e.slug} to={`/evenimente/${e.slug}`}>
              <EventCard title={e.title} datetime={e.start_at || new Date()} />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
