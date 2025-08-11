import Container from "@/components/Container";
import EventCard from "@/components/cards/EventCard";

export default function SectionList({ title, items, href }: { title: string; items: any[]; href: string }) {
  if (!items?.length) return null;
  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <a className="text-sm underline underline-offset-4" href={href}>Vezi toate</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((e) => (
            <a key={e.slug} href={`/evenimente/${e.slug}`}>
              <EventCard title={e.title} datetime={e.start_at || new Date()} />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
