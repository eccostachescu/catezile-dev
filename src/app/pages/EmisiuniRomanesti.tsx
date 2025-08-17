import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/seo/SEO";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, Clock, Bell, Tv } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import ReminderButton from "@/components/ReminderButton";

interface PopularShow {
  title: string;
  channel: string;
  type: string;
  typical_time: string;
  typical_days: string[];
  description: string;
  airs_today: boolean;
  next_typical_day: string;
  next_air_time?: string;
  slug?: string;
  id?: string;
}

export function EmisiuniRomanesti() {
  const navigate = useNavigate();
  const [shows, setShows] = useState<PopularShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { key: '', label: 'Toate' },
    { key: 'reality', label: 'Reality TV' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'music', label: 'Muzică' },
    { key: 'talent', label: 'Talent' },
    { key: 'fashion', label: 'Fashion' },
    { key: 'adventure', label: 'Aventură' },
    { key: 'entertainment', label: 'Divertisment' },
  ];

  useEffect(() => {
    loadShows();
  }, [selectedCategory]);

  const loadShows = async () => {
    try {
      setLoading(true);
      
      // Load both API shows and homepage shows
      const [apiShows, homepageShows] = await Promise.all([
        loadApiShows(),
        loadHomepageShows()
      ]);
      
      // Combine and deduplicate shows
      const allShows = [...apiShows, ...homepageShows];
      const uniqueShows = allShows.filter((show, index, self) => 
        index === self.findIndex(s => s.title === show.title)
      );
      
      setShows(uniqueShows);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApiShows = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tv_popular_shows', {
        body: { 
          category: selectedCategory,
          limit: 20 
        }
      });

      if (error) throw error;
      return data?.shows || [];
    } catch (error) {
      console.error('Error loading API shows:', error);
      return [];
    }
  };

  const loadHomepageShows = async () => {
    try {
      // Get Romanian TV shows from homepage popular events
      const { data, error } = await supabase.functions.invoke('popular_countdowns', {
        body: { 
          limit: 50,
          onlyWithImage: false
        }
      });

      if (error) throw error;

      // Filter for TV/Entertainment events
      const tvEvents = (data?.events || []).filter((event: any) => {
        const title = event.title?.toLowerCase() || '';
        const category = event.category_name?.toLowerCase() || '';
        
        return category.includes('tv') || 
               category.includes('emisiuni') ||
               title.includes('survivor') ||
               title.includes('te cunosc') ||
               title.includes('ferma') ||
               title.includes('insula') ||
               title.includes('chefi') ||
               title.includes('asia express') ||
               title.includes('bravo') ||
               title.includes('masked singer') ||
               title.includes('vocea') ||
               title.includes('românii au talent');
      });

      // Convert to our show format
      const convertedShows = tvEvents.map((event: any) => ({
        title: event.title,
        channel: 'Program TV',
        type: 'entertainment',
        typical_time: '20:30',
        typical_days: ['verifică programul'],
        description: `${event.title} - Vezi când este difuzat`,
        airs_today: false,
        next_typical_day: 'verifică programul',
        id: event.id,
        slug: event.slug,
        next_air_time: event.starts_at
      }));

      return convertedShows;
    } catch (error) {
      console.error('Error loading homepage shows:', error);
      return [];
    }
  };

  const getNextAirDateTime = (show: PopularShow) => {
    const today = new Date();
    
    if (show.airs_today) {
      const [hours, minutes] = show.typical_time.split(':');
      const airTime = new Date(today);
      airTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (airTime > today) {
        return airTime;
      }
    }
    
    // Find next air date
    const dayMap: { [key: string]: number } = {
      'luni': 1, 'marți': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sâmbătă': 6, 'duminică': 0
    };
    
    let nextAirDate = new Date(today);
    
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDayName = checkDate.toLocaleDateString('ro-RO', { weekday: 'long' });
      
      if (show.typical_days.includes(checkDayName)) {
        const [hours, minutes] = show.typical_time.split(':');
        checkDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return checkDate;
      }
    }
    
    return null;
  };

  const handleShowClick = (show: PopularShow) => {
    const slug = show.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    navigate(`/tv/emisiuni/${slug}`);
  };

  return (
    <>
      <SEO 
        title="Emisiuni TV Românești — Survivor, Chefi la Cuțite, Vocea României"
        description="Urmărește cele mai populare emisiuni TV românești. Survivor România, Chefi la Cuțite, Vocea României, Asia Express și multe altele."
        path="/tv/emisiuni"
      />
      
      <Container className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Emisiuni TV Românești
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descoperă cele mai urmărite emisiuni TV din România. 
            De la reality show-uri la show-uri de talent și cooking shows.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
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

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shows.map((show, index) => {
                const nextAirTime = getNextAirDateTime(show);
                return (
                  <div 
                    key={index} 
                    className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleShowClick(show)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                      <Play className="w-12 h-12 text-primary/60 group-hover:scale-110 transition-transform" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={show.airs_today ? "destructive" : "secondary"} className="text-xs">
                          <Tv className="w-3 h-3 mr-1" />
                          {show.channel}
                        </Badge>
                      </div>
                      {show.airs_today && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            LIVE AZI
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                        {show.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {show.description}
                      </p>
                      
                      {nextAirTime && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Următoarea difuzare:</span>
                            <Badge variant="outline" className="text-xs">
                              {show.typical_time}
                            </Badge>
                          </div>
                          <CountdownTimer 
                            target={nextAirTime}
                            className="text-center"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{show.typical_days.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Ora {show.typical_time}</span>
                        </div>
                      </div>
                      
                      {nextAirTime && (
                        <div className="w-full">
                          <ReminderButton
                            when={nextAirTime}
                            kind="event"
                            entityId={show.id || `${show.title}-${index}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {shows.length === 0 && !loading && (
              <div className="text-center py-12">
                <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nu s-au găsit emisiuni</h3>
                <p className="text-muted-foreground">
                  Încearcă să schimbi categoria pentru a vedea mai multe emisiuni.
                </p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Explorează Programul TV</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Vezi ce este la TV acum și ce urmează în program. Găsește emisiunile tale preferate pe canalele românești.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={() => navigate('/tv/program')} size="lg">
                  <Tv className="w-5 h-5 mr-2" />
                  Program TV
                </Button>
                <Button onClick={() => navigate('/tv')} variant="outline" size="lg">
                  Seriale Internaționale
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}