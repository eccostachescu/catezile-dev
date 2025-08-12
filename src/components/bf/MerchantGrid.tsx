import { Link } from "react-router-dom";

export default function MerchantGrid({ items = [] as Array<{ id: string; slug: string; name: string; logo_url?: string | null }> }) {
  if (!items?.length) return null;
  return (
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-3">Magazine populare</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((m)=> (
          <Link key={m.id} to={`/black-friday/${m.slug}`} className="rounded-md border p-3 hover:bg-muted flex items-center gap-2">
            {m.logo_url && <img src={m.logo_url} alt={`Logo ${m.name}`} width={28} height={28} className="rounded-sm" />}
            <div className="text-sm font-medium truncate">{m.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
