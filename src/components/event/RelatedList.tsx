import EventCard from "@/components/cards/EventCard";

export default function RelatedList({ items }: { items: Array<any> }) {
  if (!items || items.length === 0) return null;
  return (
    <section aria-labelledby="related">
      <h2 id="related" className="text-xl font-semibold mb-3">Evenimente similare</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <EventCard key={e.id} title={e.title} datetime={e.start_at} category={undefined} />
        ))}
      </div>
    </section>
  );
}
