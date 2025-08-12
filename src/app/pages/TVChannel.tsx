import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function TVChannelPage() {
  const { channelSlug } = useParams();
  const [channel, setChannel] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(()=>{
    (async()=>{
      const { data: ch } = await supabase.from('tv_channel').select('*').eq('slug', channelSlug).maybeSingle();
      setChannel(ch);
      const name = ch?.name || (channelSlug || '').replace(/-/g,' ');
      const { data } = await supabase
        .from('match')
        .select('id,home,away,kickoff_at,tv_channels')
        .contains('tv_channels', [name])
        .gte('kickoff_at', new Date().toISOString())
        .order('kickoff_at', { ascending: true })
        .limit(50);
      setMatches(data || []);
    })();
  }, [channelSlug]);

  return (
    <main>
      <SEO kind="generic" title={`Meciuri pe ${channel?.name || channelSlug}`} description={`Program TV pentru ${channel?.name || channelSlug}`} path={`/tv/${channelSlug}`} />
      <Container className="py-8">
        <h1 className="text-2xl font-bold mb-4">{channel?.name || channelSlug}</h1>
        <script type="application/ld+json">{JSON.stringify({
          "@context":"https://schema.org",
          "@type":"BreadcrumbList",
          itemListElement: [
            { "@type":"ListItem", position: 1, name: "Acasă", item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro") },
            { "@type":"ListItem", position: 2, name: (channel?.name || channelSlug), item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro")+`/tv/${channelSlug}` }
          ]
        })}</script>
        <div className="grid gap-3">
          {matches.map((m:any)=> (
            <a key={m.id} href={`/sport/${m.id}`} className="p-3 rounded-md border hover:bg-muted">
              <div className="font-medium">{m.home} – {m.away}</div>
              {m.kickoff_at && <div className="text-xs text-muted-foreground">{new Date(m.kickoff_at).toLocaleString('ro-RO')}</div>}
              {m.tv_channels && m.tv_channels.length>0 && <div className="text-xs text-muted-foreground">TV: {m.tv_channels.join(', ')}</div>}
            </a>
          ))}
          {matches.length===0 && <div className="text-muted-foreground">Nicio partida găsită.</div>}
        </div>
      </Container>
    </main>
  );
}
