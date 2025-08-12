import { Link } from "react-router-dom";

export default function CategoryPills({ items = [] as Array<{ id: string; slug: string; name: string }> }) {
  if (!items?.length) return null;
  return (
    <section className="py-4">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((c)=> (
          <Link key={c.id} to={`/black-friday/${c.slug}`} className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-muted whitespace-nowrap">
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
