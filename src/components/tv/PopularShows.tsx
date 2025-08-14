import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Tv, Calendar } from "lucide-react";

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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      reality: 'bg-red-100 text-red-800',
      cooking: 'bg-orange-100 text-orange-800',
      music: 'bg-purple-100 text-purple-800',
      talent: 'bg-blue-100 text-blue-800',
      fashion: 'bg-pink-100 text-pink-800',
      adventure: 'bg-green-100 text-green-800',
      entertainment: 'bg-yellow-100 text-yellow-800',
      survival: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shows.map((show, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${show.airs_today ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{show.title}</CardTitle>
                    {show.airs_today && (
                      <Badge variant="default" className="shrink-0">
                        Azi
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tv className="h-4 w-4" />
                    {show.channel}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {show.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(show.type)}>
                      {show.type.charAt(0).toUpperCase() + show.type.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      De obicei la {show.typical_time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {show.typical_days.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && shows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nu au fost găsite emisiuni pentru filtrele selectate.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}