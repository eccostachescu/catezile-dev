import Container from "@/components/Container";
import { track } from "@/lib/analytics";

export default function TrendingRail({ items = [] as Array<{ kind: string; id: string; title: string; subtitle?: string | null; slug?: string | null; reasons?: any }> }) {
  if (!items?.length) return null;
  const hrefFor = (it: any) => it.kind === 'match' ? `/sport/${it.slug || it.id}` : it.kind === 'movie' ? `/filme/${it.slug || it.id}` : `/evenimente/${it.slug}`;
  return (
    <section className="py-6" aria-labelledby="trending-title">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 id="trending-title" className="text-xl font-semibold">În trend</h2>
          <a className="text-sm underline underline-offset-4" href="#in-curand">Vezi toate</a>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x">
          {items.slice(0,10).map((it) => (
            <a key={`${it.kind}-${it.id}`} href={hrefFor(it)} className="min-w-[260px] snap-start rounded-md border p-3 hover:bg-muted" onClick={()=>track('trending_card_click',{kind:it.kind,id:it.id})}>
              <div className="text-xs text-muted-foreground mb-1">{label(it.kind)}</div>
              <div className="font-medium leading-snug">{it.title}</div>
              {it.subtitle && <div className="text-sm text-muted-foreground truncate">{it.subtitle}</div>}
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

function label(kind: string) {
  if (kind === 'match') return 'Meci';
  if (kind === 'movie') return 'Film';
  if (kind === 'event') return 'Eveniment';
  return 'Altul';
}
