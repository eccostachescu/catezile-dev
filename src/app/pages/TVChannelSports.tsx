import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import TVNow from "@/components/tv/TVNow";
import FollowChannelButton from "@/components/tv/FollowChannelButton";
import { routes } from "@/app/routes";

export default function TVChannelPage() {
  const { channelSlug } = useParams();
  const [channel, setChannel] = useState<any>(null);
  const [days, setDays] = useState<Array<{ label: string; value: string }>>([]);
  const [day, setDay] = useState<string>(new Date().toISOString().slice(0,10));
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=>{
    const arr: Array<{ label: string; value: string }> = [];
    const base = new Date(); base.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i*24*3600*1000);
      arr.push({ label: d.toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: '2-digit' }), value: d.toISOString().slice(0,10) });
    }
    setDays(arr);
  },[]);

  useEffect(()=>{
    (async()=>{
      const { data: ch } = await supabase.from('tv_channel').select('*').eq('slug', channelSlug).maybeSingle();
      setChannel(ch);
    })();
  }, [channelSlug]);

  useEffect(()=>{
    if (!channel?.id) return;
    (async()=>{
      const start = new Date(day + 'T00:00:00Z').toISOString();
      const end = new Date(day + 'T23:59:59Z').toISOString();
      const { data } = await supabase
        .from('tv_program')
        .select('id,title,subtitle,starts_at,ends_at,status,match_id')
        .eq('channel_id', channel.id)
        .eq('kind','sport')
        .gte('starts_at', start)
        .lte('starts_at', end)
        .order('starts_at', { ascending: true });
      // Enrich with match for linking
      const ids = (data||[]).map((r:any)=>r.match_id).filter(Boolean);
      let matchMap = new Map<string, any>();
      if (ids.length) {
        const { data: matches } = await supabase.from('match').select('id,home,away,kickoff_at,slug,tv_channels').in('id', ids);
        matchMap = new Map(matches?.map((m: any) => [m.id, m]) || []);
      }
      setItems((data||[]).map((r:any)=> ({ ...r, match: r.match_id ? matchMap.get(r.match_id) || null : null })));
    })();
  }, [channel?.id, day]);

  const title = channel?.name || channelSlug;

  return (
    <main>
      <SEO kind="generic" title={`Program ${title} — Sport`} description={`Meciuri și programe sportive pe ${title}: azi și în următoarele 7 zile.`} path={routes.tv(channelSlug || '')} />
      <Container className="py-8">
        <nav className="mb-3 text-sm text-muted-foreground" aria-label="breadcrumbs">
          <a href={routes.home()}>Acasă</a> <span>/</span> <a href={routes.tvGuide()}>TV</a> <span>/</span> <span>{title}</span>
        </nav>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          {channel?.id && <FollowChannelButton channelId={channel.id} />}
        </div>
        <section className="mb-4" aria-labelledby="acum">
          <h2 id="acum" className="text-lg font-semibold mb-2">Acum pe {title}</h2>
          <TVNow channelSlug={channelSlug} />
        </section>
        <div className="flex items-center gap-2 mb-3" role="navigation" aria-label="Zile">
          {days.map((d) => (
            <button key={d.value} onClick={() => setDay(d.value)} className={`px-3 py-1 rounded-md border ${day===d.value? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {items.map((it:any, idx:number)=> (
            <a key={`${idx}-${it.starts_at}`} href={it.match ? `/sport/${it.match.slug || it.match_id}` : '#'} className="block">
              <div className="flex items-center justify-between gap-3 p-2 rounded-md border hover:bg-muted">
                <div>
                  <div className="text-sm text-muted-foreground">{new Date(it.starts_at).toLocaleString('ro-RO', { hour:'2-digit', minute:'2-digit' })}</div>
                  <div className="font-medium">{it.match ? `${it.match.home} – ${it.match.away}` : it.title}</div>
                </div>
                {it.match?.tv_channels && <div className="text-xs text-muted-foreground">TV: {it.match.tv_channels.join(', ')}</div>}
              </div>
            </a>
          ))}
          {items.length===0 && <div className="text-muted-foreground">Nu există programe sportive pentru această zi.</div>}
        </div>
      </Container>
    </main>
  );
}
