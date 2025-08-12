import Container from "@/components/Container";
import { track } from "@/lib/analytics";

export default function UpcomingStrip({ title, items = [] as any[], kind }: { title: string; items: any[]; kind: 'sport'|'movies'|'events' }) {
  if (!items?.length) return null;
  const hrefFor = (it: any) => kind==='sport' ? `/sport/${it.slug || it.id}` : kind==='movies' ? `/filme/${it.slug || it.id}` : `/evenimente/${it.slug}`;
  const subFor = (it: any) => kind==='sport' ? time(it.kickoff_at) : kind==='movies' ? date(it.cinema_release_ro) : date(it.start_at);
  return (
    <section className="py-6" id="in-curand" aria-labelledby={`up-${kind}`}>
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 id={`up-${kind}`} className="text-xl font-semibold">{title}</h2>
          <a className="text-sm underline underline-offset-4" href={kind==='movies'?'/filme':kind==='sport'?'/sport':'/'}>Vezi tot</a>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x">
          {items.map((it) => (
            <a key={`${kind}-${it.id}`} href={hrefFor(it)} className="min-w-[280px] snap-start rounded-md border p-3 hover:bg-muted" onClick={()=>track('strip_card_click',{kind})}>
              <div className="text-xs text-muted-foreground mb-1">{subFor(it)}</div>
              <div className="font-medium leading-snug truncate">{it.title || `${it.home} – ${it.away}`}</div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

function time(iso?: string) { try { return new Date(iso||'').toLocaleString('ro-RO', { dateStyle:'medium', timeStyle:'short' }); } catch { return ''; } }
function date(d?: string) { return d ? new Date(d).toLocaleDateString('ro-RO', { dateStyle:'medium' }) : ''; }

