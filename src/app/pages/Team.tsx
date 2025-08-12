import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function TeamPage() {
  const { teamSlug } = useParams();
  const teamName = (teamSlug || '').replace(/-/g, ' ');
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(()=>{
    (async()=>{
      const { data } = await supabase
        .from('match')
        .select('id,home,away,kickoff_at,tv_channels')
        .or(`home.ilike.%${teamName}%,away.ilike.%${teamName}%`)
        .gte('kickoff_at', new Date().toISOString())
        .order('kickoff_at', { ascending: true })
        .limit(50);
      setMatches(data || []);
    })();
  }, [teamSlug]);

  return (
    <main>
      <SEO kind="generic" title={`Program ${teamName}`} description={`Meciuri pentru ${teamName}`} path={`/echipa/${teamSlug}`} />
      <Container className="py-8">
        <h1 className="text-2xl font-bold mb-4">{teamName}</h1>
        <script type="application/ld+json">{JSON.stringify({
          "@context":"https://schema.org",
          "@type":"BreadcrumbList",
          itemListElement: [
            { "@type":"ListItem", position: 1, name: "Acasă", item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro") },
            { "@type":"ListItem", position: 2, name: teamName, item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro")+`/echipa/${teamSlug}` }
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
          {matches.length===0 && <div className="text-muted-foreground">Nicio partida programată în perioada următoare.</div>}
        </div>
      </Container>
    </main>
  );
}
