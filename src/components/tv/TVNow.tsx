import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export default function TVNow({ channelSlug }: { channelSlug?: string }) {
  const [live, setLive] = useState<any[]>([]);
  const [next, setNext] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.functions.invoke('tv_now_status', { body: { channelSlug, windowMin: 90 } });
      setLive(data?.live || []);
      setNext(data?.next || []);
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [channelSlug]);

  const Item = ({ item }: { item: any }) => {
    const m = item.match;
    const kickoff = m?.kickoff_at ? new Date(m.kickoff_at) : (item.starts_at ? new Date(item.starts_at) : null);
    const time = kickoff ? new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' }).format(kickoff) : '';
    
    return (
      <a href={m ? `/sport/${m.slug || m.id}` : '#'} onClick={()=>m && track('tv_program_click',{ id: m.id })} className="rounded-md border p-3 hover:bg-muted transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-muted-foreground font-medium">{time}</div>
              {item.season && item.episode_number && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  S{item.season}E{item.episode_number}
                </span>
              )}
              {m?.status === 'LIVE' && (
                <span className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground">
                  LIVE {m?.score?.elapsed ? `• ${m.score.elapsed}'` : ''}
                </span>
              )}
            </div>
            <div className="font-medium">{m ? `${m.home} – ${m.away}` : item.title}</div>
            {item.subtitle && (
              <div className="text-sm text-muted-foreground mt-1">{item.subtitle}</div>
            )}
            {item.channel_name && (
              <div className="text-xs text-muted-foreground mt-1">{item.channel_name}</div>
            )}
          </div>
          {item.image_url && (
            <div className="w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </a>
    );
  };

  if (!live.length && !next.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {live.map((item) => <Item key={`l-${item.id || item.starts_at}`} item={item} />)}
      {next.map((item) => <Item key={`n-${item.id || item.starts_at}`} item={item} />)}
    </div>
  );
}
