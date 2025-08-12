import Container from "@/components/Container";
import TVChips from "@/components/sport/TVChips";
import { Badge } from "@/components/Badge";

export default function TVNow({ items = [] as Array<{ id: string; home: string; away: string; kickoff_at: string; tv_channels?: string[]; status?: string; minute?: number | string | null; slug?: string }> }) {
  if (!items?.length) return null;
  return (
    <section className="py-6" aria-labelledby="tvnow-title">
      <Container>
        <h2 id="tvnow-title" className="text-xl font-semibold mb-3">Acum la TV</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((m) => (
            <a key={m.id} href={`/sport/${m.slug || m.id}`} className="rounded-md border p-3 hover:bg-muted">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{m.home} – {m.away}</div>
                {m.status === 'LIVE' && <Badge variant="destructive">LIVE {m.minute ? `• ${m.minute}'` : ''}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mb-2">{new Date(m.kickoff_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</div>
              <TVChips channels={m.tv_channels || []} />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
