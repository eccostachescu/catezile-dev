import Container from "@/components/Container";
import { track } from "@/lib/analytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/Tooltip";
import { Info } from "lucide-react";

export default function TrendingRail({ items = [] as Array<{ kind: string; id: string; title: string; subtitle?: string | null; slug?: string | null; when_at?: string | null; reasons?: any }> }) {
  if (!items?.length) return null;
  const hrefFor = (it: any) => it.kind === 'match' ? `/sport/${it.slug || it.id}` : it.kind === 'movie' ? `/filme/${it.slug || it.id}` : `/evenimente/${it.slug}`;
  return (
    <section className="py-6" aria-labelledby="trending-title">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 id="trending-title" className="text-xl font-semibold">În trend</h2>
          <a className="text-sm underline underline-offset-4" href="#in-curand">Vezi toate</a>
        </div>
        <TooltipProvider>
          <div className="flex gap-3 overflow-x-auto snap-x">
            {items.slice(0,10).map((it) => (
              <a key={`${it.kind}-${it.id}`} href={hrefFor(it)} className="min-w-[260px] snap-start rounded-md border p-3 hover:bg-muted" onClick={()=>track('trending_card_click',{kind:it.kind,id:it.id})}>
                <div className="text-xs text-muted-foreground mb-1">{label(it.kind)}</div>
                <div className="font-medium leading-snug">{it.title}</div>
                {it.subtitle && <div className="text-sm text-muted-foreground truncate">{it.subtitle}</div>}
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  {it.when_at && <span>{whenText(it.when_at)}</span>}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="ml-auto inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline cursor-help"
                        aria-label={`De ce e trending: ${reasonLabel(it.reasons)}`}
                        onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                      >
                        <Info className="h-3.5 w-3.5" />
                        Motiv
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-[240px]">De ce e trending: {reasonLabel(it.reasons)}</div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </a>
            ))}
          </div>
        </TooltipProvider>
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

function whenText(iso?: string | null) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const fmtDay = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' });
    const sameDay = fmtDay.format(d) === fmtDay.format(now);
    if (sameDay) return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' });
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function reasonLabel(reasons?: any) {
  try {
    const r = reasons || {};
    const pairs: Array<[string, number]> = [
      ['remindere', Number(r.reminders_norm ?? r.reminders ?? 0)],
      ['follow-uri', Number(r.follows_norm ?? r.follows ?? 0)],
      ['trafic', Number(r.clicks_norm ?? r.clicks ?? 0)],
      ['apropiere în timp', Number(r.proximity_norm ?? r.proximity ?? 0)],
    ];
    const top = pairs.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    if (top.length) return top.join(', ');
    return 'mix de semnale';
  } catch { return 'mix de semnale'; }
}
