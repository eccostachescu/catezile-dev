import Container from "@/components/Container";
import EventCard from "@/components/cards/EventCard";
import MatchCard from "@/components/cards/MatchCard";
import MovieCard from "@/components/cards/MovieCard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function WeekAhead({ trending }: { trending: any[] }) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setItems(null); return; }
      const { data: follows } = await supabase.from('follow').select('entity_id,entity_type').eq('user_id', user.id).limit(50);
      if (!follows?.length) { setItems(null); return; }
      const eventIds = follows.filter(f=>f.entity_type==='event').map(f=>f.entity_id);
      const matchIds = follows.filter(f=>f.entity_type==='match').map(f=>f.entity_id);
      const movieIds = follows.filter(f=>f.entity_type==='movie').map(f=>f.entity_id);
      const now = new Date();
      const in7 = new Date(now.getTime()+7*24*60*60*1000).toISOString();
      const [ev, mt, mv] = await Promise.all([
        eventIds.length ? supabase.from('event').select('slug,title,start_at').in('id', eventIds).gte('start_at', now.toISOString()).lte('start_at', in7) : Promise.resolve({ data: [] as any[] }),
        matchIds.length ? supabase.from('match').select('id,home,away,kickoff_at').in('id', matchIds).gte('kickoff_at', now.toISOString()).lte('kickoff_at', in7) : Promise.resolve({ data: [] as any[] }),
        movieIds.length ? supabase.from('movie').select('id,title,cinema_release_ro').in('id', movieIds).gte('cinema_release_ro', now.toISOString().slice(0,10)) : Promise.resolve({ data: [] as any[] }),
      ]);
      if (cancelled) return;
      const out: any[] = [];
      (ev.data||[]).forEach((e:any)=>out.push({ kind:'event', sort:new Date(e.start_at).getTime(), node: <Link key={e.slug} to={`/evenimente/${e.slug}`}><EventCard title={e.title} datetime={e.start_at} /></Link> }));
      (mt.data||[]).forEach((m:any)=>out.push({ kind:'match', sort:new Date(m.kickoff_at).getTime(), node: <Link key={m.id} to={`/sport/${m.id}`}><MatchCard homeTeam={m.home} awayTeam={m.away} datetime={m.kickoff_at} /></Link> }));
      (mv.data||[]).forEach((m:any)=>out.push({ kind:'movie', sort:new Date(m.cinema_release_ro).getTime(), node: <Link key={m.id} to={`/filme/${m.id}`}><MovieCard title={m.title} inCinemasAt={m.cinema_release_ro} /></Link> }));
      setItems(out.sort((a,b)=>a.sort-b.sort).slice(0,8));
    }
    load();
    return ()=>{ cancelled = true };
  }, [user?.id]);

  const list = items ?? trending?.map((e:any)=>({ kind:'event', node: <Link key={e.slug} to={`/evenimente/${e.slug}`}><EventCard title={e.title} datetime={e.start_at} /></Link> }));

  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{items ? 'Săptămâna ta' : 'Trending acum'}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list?.map((x:any, idx:number)=> (
            <div key={idx}>{x.node}</div>
          ))}
        </div>
      </Container>
    </section>
  );
}
