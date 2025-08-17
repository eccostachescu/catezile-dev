import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  status: string;
  home?: string;
  away?: string;
  score?: any;
  tv_channels?: string[];
  competition_name?: string;
  is_live: boolean;
}

interface LiveNowSectionProps {
  onCardClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}

export default function LiveNowSection({ onCardClick, onReminderClick }: LiveNowSectionProps) {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveEvents = async () => {
      try {
        console.log('🔴 Fetching live events...');
        const { data, error } = await supabase.rpc('get_live_events');
        
        if (error) {
          console.error('Error fetching live events:', error);
          return;
        }

        console.log('🔴 Raw live events data:', data);
        const liveItems = data?.filter((item: any) => item.is_live) || [];
        console.log('🔴 Filtered live events:', liveItems);
        setLiveEvents(liveItems.slice(0, 4)); // Max 4 live events
      } catch (error) {
        console.error('Error in live events fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveEvents();
    
    // Refresh every 30 seconds for live data
    const interval = setInterval(fetchLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't render section if no live events
  console.log('🔴 LiveNowSection render - loading:', loading, 'events count:', liveEvents.length);
  console.log('🔴 Live events data:', liveEvents);
  
  // Temporarily disable live section to debug 500 error
  return null;
  
  if (loading) {
    console.log('🔴 LiveNowSection showing loading state');
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Încărcare evenimente live...</div>
        </div>
      </section>
    );
  }
  
  if (liveEvents.length === 0) {
    console.log('🔴 LiveNowSection not rendering - no live events');
    return null;
  }

  return (
    <section id="live-now" className="py-8" style={{ backgroundColor: 'var(--cz-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="rounded-2xl p-6" style={{ 
          backgroundColor: '#FFF6F3',
          border: '1px solid var(--cz-border)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-h2 font-bold text-[--cz-ink]">LIVE acum</h2>
              </div>
            </div>
            <button
              onClick={() => {
                window.location.href = '/sport/live';
              }}
              className="text-sm font-medium text-[--cz-primary] hover:text-[--cz-primary-600] transition-colors"
            >
              Vezi toate live →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-[--cz-border] overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      LIVE
                    </span>
                    {event.tv_channels && event.tv_channels.length > 0 && (
                      <span className="text-xs text-[--cz-ink-muted] bg-[--cz-border] px-2 py-1 rounded">
                        {event.tv_channels[0]}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm text-[--cz-ink] mb-1 line-clamp-2">
                    {event.home && event.away ? `${event.home} - ${event.away}` : event.title}
                  </h3>
                  
                  {event.score && (
                    <div className="text-xs text-[--cz-ink-muted] mb-1">
                      {event.score.home || 0} - {event.score.away || 0}
                    </div>
                  )}
                  
                  {event.competition_name && (
                    <div className="text-xs text-[--cz-ink-muted]">
                      {event.competition_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}