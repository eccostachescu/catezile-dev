import Container from "@/components/Container";
import { track } from "@/lib/analytics";

export default function TodayGrid({ items = [] as Array<{ kind: string; id: string; title: string; when_at?: string; tv_channels?: string[]; slug?: string }> }) {
  return (
    <section className="py-6" aria-labelledby="today-title">
      <Container>
        <h2 id="today-title" className="text-xl font-semibold mb-3">Astăzi</h2>
        {items.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">Azi e liniște. Vezi ce urmează mâine.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((it) => (
              <a key={`${it.kind}-${it.id}`} href={hrefFor(it)} className="rounded-md border p-3 hover:bg-muted" onClick={()=>track('today_card_click',{kind:it.kind,id:it.id})}>
                <div className="text-xs text-muted-foreground mb-1">{icon(it.kind)} {time(it.when_at)}</div>
                <div className="font-medium leading-snug">{it.title}</div>
                {it.kind==='match' && it.tv_channels && it.tv_channels.length>0 && (
                  <div className="mt-1 text-xs text-muted-foreground truncate">TV: {it.tv_channels.join(', ')}</div>
                )}
              </a>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function hrefFor(it: any) {
  if (it.kind === 'match') return `/sport/${it.slug || it.id}`;
  if (it.kind === 'movie') return `/filme/${it.slug || it.id}`;
  if (it.kind === 'event') return `/evenimente/${it.slug}`;
  return '/';
}
function icon(kind: string) { return kind==='match'?'⚽️':kind==='movie'?'🎬':'📅'; }
function time(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}

