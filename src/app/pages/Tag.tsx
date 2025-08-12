import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function TagPage() {
  const { slug } = useParams();
  const [tag, setTag] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(()=>{
    (async()=>{
      const { data: t } = await supabase.from('tag').select('*').eq('slug', slug).maybeSingle();
      setTag(t);
      if (t) {
        const { data: et } = await supabase
          .from('event_tag')
          .select('event_id')
          .eq('tag_id', t.id);
        const ids = (et||[]).map((x:any)=>x.event_id);
        if (ids.length) {
          const { data: evs } = await supabase
            .from('event')
            .select('slug,title,start_at,city,status')
            .in('id', ids)
            .eq('status','PUBLISHED')
            .order('start_at', { ascending: true });
          setEvents(evs || []);
        }
      }
    })();
  }, [slug]);

  return (
    <main>
      <SEO kind="generic" title={`#${tag?.name || slug}`} description={`Evenimente pentru #${tag?.name || slug}`} path={`/tag/${slug}`} />
      <Container className="py-8">
        <h1 className="text-2xl font-bold mb-4">#{tag?.name || slug}</h1>
        <script type="application/ld+json">{JSON.stringify({
          "@context":"https://schema.org",
          "@type":"BreadcrumbList",
          itemListElement: [
            { "@type":"ListItem", position: 1, name: "Acasă", item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro") },
            { "@type":"ListItem", position: 2, name: `#${tag?.name || slug}`, item: (typeof window!=="undefined"?window.location.origin:"https://catezile.ro")+`/tag/${slug}` }
          ]
        })}</script>
        <div className="grid gap-3">
          {events.map((e:any)=> (
            <a key={e.slug} href={`/evenimente/${e.slug}`} className="p-3 rounded-md border hover:bg-muted">
              <div className="font-medium">{e.title}</div>
              {e.start_at && <div className="text-xs text-muted-foreground">{new Date(e.start_at).toLocaleString('ro-RO')}</div>}
            </a>
          ))}
          {events.length===0 && <div className="text-muted-foreground">Nicio intrare încă.</div>}
        </div>
      </Container>
    </main>
  );
}
