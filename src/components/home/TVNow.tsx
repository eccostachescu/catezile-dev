import Container from "@/components/Container";
import TVChips from "@/components/sport/TVChips";
import { Badge } from "@/components/Badge";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

export default function TVNow({ items = [] as Array<{ id: string; home: string; away: string; kickoff_at: string; tv_channels?: string[]; status?: string; minute?: number | string | null; slug?: string }> }) {
  const [rows, setRows] = useState(items);
  const ids = useMemo(()=> rows.map(r=>r.id), [rows]);

  useEffect(() => {
    if (!ids.length) return;
    const tick = async () => {
      const { data } = await supabase
        .from('match')
        .select('id,home,away,kickoff_at,tv_channels,status,score,slug')
        .in('id', ids);
      const updated = (data || []).map((m:any)=> ({
        id: m.id,
        home: m.home,
        away: m.away,
        kickoff_at: m.kickoff_at,
        tv_channels: m.tv_channels,
        status: m.status,
        minute: (m.score && (m.score.minute || m.score.min)) || null,
        slug: m.slug || m.id,
      }));
      // preserve order
      const asMap = new Map(updated.map(u=>[u.id,u] as const));
      setRows(prev => prev.map(p => asMap.get(p.id) || p));
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [ids.join('|')]);

  if (!rows?.length) return null;
  return (
    <section className="py-6" aria-labelledby="tvnow-title">
      <Container>
        <h2 id="tvnow-title" className="text-xl font-semibold mb-3">Acum la TV</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((m) => (
            <a key={m.id} href={`/sport/${m.slug || m.id}`} className="rounded-md border p-3 hover:bg-muted" onClick={()=>track('tvnow_click',{id:m.id})}>
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
