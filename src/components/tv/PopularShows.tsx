import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CardCountdown from "@/components/homepage/CardCountdown";

interface PopularShow {
  title: string;
  channel: string;
  type: string;
  typical_time: string;
  typical_days: string[];
  description: string;
  airs_today: boolean;
  next_typical_day: string;
}

interface PopularShowsResponse {
  shows: PopularShow[];
  total: number;
  current_day: string;
  filters_applied: {
    category?: string;
    channel?: string;
  };
}

export default function PopularShows() {
  const [shows, setShows] = useState<PopularShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');

  const categories = [
    { key: '', label: 'Toate' },
    { key: 'reality', label: 'Reality TV' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'music', label: 'Muzică' },
    { key: 'talent', label: 'Talent' },
    { key: 'fashion', label: 'Fashion' },
    { key: 'adventure', label: 'Aventură' },
  ];

  const channels = [
    { key: '', label: 'Toate canalele' },
    { key: 'Antena 1', label: 'Antena 1' },
    { key: 'Pro TV', label: 'Pro TV' },
    { key: 'Kanal D', label: 'Kanal D' },
  ];

  const loadShows = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedChannel) params.append('channel', selectedChannel);
      params.append('limit', '12');

      const { data, error } = await supabase.functions.invoke('tv_popular_shows', {
        body: Object.fromEntries(params)
      });

      if (error) throw error;

      const response = data as PopularShowsResponse;
      setShows(response.shows || []);
    } catch (error) {
      console.error('Error loading popular shows:', error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, [selectedCategory, selectedChannel]);

  // Convert show to countdown-compatible format
  const convertShowToCountdown = (show: PopularShow, index: number) => {
    // Calculate next airing time based on typical schedule
    const today = new Date();
    const nextAiring = new Date();
    
    if (show.airs_today) {
      // Parse typical time (e.g., "20:30")
      const [hours, minutes] = show.typical_time.split(':').map(Number);
      nextAiring.setHours(hours, minutes, 0, 0);
      
      // If it's already past today's time, move to next typical day
      if (nextAiring <= today) {
        const nextDay = show.next_typical_day;
        const dayMap: Record<string, number> = {
          'duminică': 0, 'luni': 1, 'marți': 2, 'miercuri': 3, 
          'joi': 4, 'vineri': 5, 'sâmbătă': 6
        };
        
        const targetDay = dayMap[nextDay] || 1;
        const daysUntil = (targetDay - today.getDay() + 7) % 7 || 7;
        nextAiring.setDate(today.getDate() + daysUntil);
      }
    } else {
      // Use next typical day
      const nextDay = show.next_typical_day;
      const dayMap: Record<string, number> = {
        'duminică': 0, 'luni': 1, 'marți': 2, 'miercuri': 3, 
        'joi': 4, 'vineri': 5, 'sâmbătă': 6
      };
      
      const targetDay = dayMap[nextDay] || 1;
      const daysUntil = (targetDay - today.getDay() + 7) % 7 || 7;
      nextAiring.setDate(today.getDate() + daysUntil);
      
      const [hours, minutes] = show.typical_time.split(':').map(Number);
      nextAiring.setHours(hours, minutes, 0, 0);
    }

    return {
      id: `show-${index}`,
      title: show.title,
      slug: `tv/${show.title.toLowerCase().replace(/\s+/g, '-')}`,
      startDate: nextAiring.toISOString(),
      location: show.channel,
      category: show.type === 'reality' ? 'Reality TV' : 
                show.type === 'cooking' ? 'Cooking' :
                show.type === 'music' ? 'Muzică' :
                show.type === 'talent' ? 'Talent' :
                show.type === 'fashion' ? 'Fashion' :
                show.type === 'adventure' ? 'Aventură' :
                show.type === 'survival' ? 'Survival' : 'TV',
      status: show.airs_today ? "upcoming" as const : "upcoming" as const,
      rank: index + 1
    };
  };

  const handleReminderClick = (showId: string) => {
    // Extract show index from ID
    const index = parseInt(showId.replace('show-', ''));
    const show = shows[index];
    
    if (show) {
      console.log(`Setting reminder for: ${show.title} on ${show.channel}`);
      // Here you can implement actual reminder logic:
      // - Save to localStorage
      // - Send to backend
      // - Show confirmation toast
      alert(`Reminder set for "${show.title}" on ${show.channel}!`);
    }
  };

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Emisiuni Populare Românești</h2>
          <p className="text-muted-foreground">
            Cele mai urmărite show-uri de la TV din România
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => (
              <Button
                key={channel.key}
                variant={selectedChannel === channel.key ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChannel(channel.key)}
              >
                {channel.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Shows Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shows.map((show, index) => {
              const countdownData = convertShowToCountdown(show, index);
              return (
                <CardCountdown
                  key={`show-${index}`}
                  id={countdownData.id}
                  title={countdownData.title}
                  slug={countdownData.slug}
                  startDate={countdownData.startDate}
                  location={countdownData.location}
                  category={countdownData.category}
                  status={countdownData.status}
                  rank={countdownData.rank}
                  onReminderClick={handleReminderClick}
                />
              );
            })}
          </div>
        )}
        
        {!loading && shows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nu sunt emisiuni disponibile pentru filtrele selectate.</p>
          </div>
        )}
      </div>
    </section>
  );
}