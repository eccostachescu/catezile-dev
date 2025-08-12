import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/app/routes";
import TVNow from "@/components/tv/TVNow";
import TVGrid from "@/components/tv/TVGrid";
import TVAdRail from "@/components/tv/TVAdRail";
import { track } from "@/lib/analytics";

export default function TVGuide() {
  const [day, setDay] = useState<string>(new Date().toISOString().slice(0,10));
  const [programs, setPrograms] = useState<Record<string, any[]>>({});
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const start = new Date(day + 'T00:00:00Z').toISOString();
      const end = new Date(day + 'T23:59:59Z').toISOString();
      const [{ data: ch }, { data: rows }] = await Promise.all([
        supabase.from('tv_channel').select('id,name,slug').eq('active', true).order('priority', { ascending: false }),
        supabase.from('tv_program').select('channel_id,title,subtitle,starts_at,ends_at,status,match_id').gte('starts_at', start).lte('starts_at', end).order('starts_at', { ascending: true })
      ]);
      setChannels(ch || []);
      const group: Record<string, any[]> = {};
      (rows || []).forEach((r: any) => { (group[r.channel_id] ||= []).push(r); });
      setPrograms(group);
      setLoading(false);
      track('tv_view', { day });
    };
    load();
  }, [day]);

  const days = useMemo(() => {
    const arr: Array<{ label: string; value: string }> = [];
    const base = new Date(); base.setHours(0,0,0,0);
    for (let i = -0; i <= 6; i++) {
      const d = new Date(base.getTime() + i*24*3600*1000);
      const value = d.toISOString().slice(0,10);
      const label = d.toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: '2-digit' });
      arr.push({ label, value });
    }
    return arr;
  }, []);

  return (
    <main>
      <SEO kind="generic" title="Program TV Sport în România — Acum și Urmează" description="Vezi ce meciuri sunt acum la TV și pe ce canale: Digi, Prima, Orange, PRO TV. Program sport pe 7 zile." path={routes.tvGuide()} />
      <Container className="py-6">
        <h1 className="text-2xl font-bold mb-3">Program TV Sport</h1>
        <section className="mb-6" aria-labelledby="tv-acum">
          <h2 id="tv-acum" className="text-xl font-semibold mb-2">Acum la TV</h2>
          <TVNow />
        </section>

        <div className="flex items-center gap-2 mb-3" role="navigation" aria-label="Zile">
          {days.map((d) => (
            <button key={d.value} onClick={() => setDay(d.value)} className={`px-3 py-1 rounded-md border ${day===d.value? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              {d.label}
            </button>
          ))}
        </div>

        <TVAdRail position="top" />
        <TVGrid loading={loading} channels={channels} programsByChannel={programs} />
      </Container>
    </main>
  );
}
