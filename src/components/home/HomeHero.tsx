import Container from "@/components/Container";
import AffiliateButton from "@/components/AffiliateButton";
import TVChips from "@/components/sport/TVChips";
import { track } from "@/lib/analytics";

type HeroBF = { kind: 'bf'; payload: { merchants: Array<{ id?: string; name: string; slug?: string; affiliate_link_id?: string }> } };
type HeroDerby = { kind: 'derby'; payload: { id: string; home: string; away: string; kickoff_at: string; tv_channels?: string[] } };
type HeroToday = { kind: 'today'; payload: { highlights: Array<{ kind: string; title: string; slug: string }> } };

export type HomeHeroData = HeroBF | HeroDerby | HeroToday;

export default function HomeHero({ hero }: { hero: HomeHeroData }) {
  return (
    <header className="bg-hero">
      <Container className="py-8 sm:py-12">
        {hero.kind === 'bf' && (
          <section className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Black Friday în România</h1>
            <p className="text-muted-foreground mb-6">Oferte utile — fără clickbait. Parteneriate marcate corect.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {hero.payload.merchants.slice(0,3).map((m) => (
                <AffiliateButton key={m.slug || m.name} href={`/black-friday#${m.slug || m.name}`} onClick={()=>track('hero_click',{kind:'bf', merchant:m.slug||m.name})}>
                  {m.name}
                </AffiliateButton>
              ))}
            </div>
          </section>
        )}
        {hero.kind === 'derby' && (
          <section className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{hero.payload.home} – {hero.payload.away}</h1>
            <p className="text-muted-foreground mb-3">{new Date(hero.payload.kickoff_at).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <div className="mb-4 flex justify-center">
              <TVChips channels={hero.payload.tv_channels || []} />
            </div>
            <a className="inline-flex h-10 items-center rounded-md border px-4" href={`/sport/${hero.payload.id}`} onClick={()=>track('hero_click',{kind:'derby', id:hero.payload.id})}>Detalii meci</a>
          </section>
        )}
        {hero.kind === 'today' && (
          <section className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Câte zile până la… în România</h1>
            <p className="text-muted-foreground mb-4">Astăzi, {new Date().toLocaleDateString('ro-RO', { dateStyle: 'full' })}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hero.payload.highlights?.map((h) => (
                <a key={h.slug} href={linkFor(h.kind, h.slug)} className="rounded-full border px-3 py-1 text-sm hover:bg-muted" onClick={()=>track('hero_click',{kind:'today', item:h.slug})}>
                  {iconFor(h.kind)} <span className="ml-1">{h.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </Container>
    </header>
  );
}

function linkFor(kind?: string, slug?: string) {
  if (!kind || !slug) return '/';
  if (kind === 'match') return `/sport/${slug}`;
  if (kind === 'movie') return `/filme/${slug}`;
  if (kind === 'event') return `/evenimente/${slug}`;
  return '/';
}

function iconFor(kind?: string) {
  if (kind === 'match') return '⚽️';
  if (kind === 'movie') return '🎬';
  if (kind === 'event') return '📅';
  return '⭐️';
}
