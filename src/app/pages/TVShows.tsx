import { useState, useEffect } from "react";
import { SEO } from "@/seo/SEO";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Play, Clock } from "lucide-react";

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

interface InternationalShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  genres: string[];
  vote_average: number;
  popularity: number;
  poster_url: string;
  backdrop_url: string;
  slug: string;
}

export function TVShows() {
  const [romanianShows, setRomanianShows] = useState<PopularShow[]>([]);
  const [internationalShows, setInternationalShows] = useState<InternationalShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'romanian' | 'international'>('romanian');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = [
    { key: '', label: 'Toate' },
    { key: 'drama', label: 'Drama' },
    { key: 'comedy', label: 'Comedy' },
    { key: 'crime', label: 'Crime' },
    { key: 'sci-fi', label: 'Sci-Fi' },
    { key: 'fantasy', label: 'Fantasy' },
    { key: 'action', label: 'Acțiune' },
  ];

  const romanianCategories = [
    { key: '', label: 'Toate' },
    { key: 'reality', label: 'Reality TV' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'music', label: 'Muzică' },
    { key: 'talent', label: 'Talent' },
    { key: 'fashion', label: 'Fashion' },
    { key: 'adventure', label: 'Aventură' },
  ];

  useEffect(() => {
    loadShows();
  }, [activeTab, selectedGenre]);

  const loadShows = async () => {
    try {
      setLoading(true);
      console.log('🔧 Loading shows for tab:', activeTab, 'genre:', selectedGenre);

      if (activeTab === 'romanian') {
        const { data, error } = await supabase.functions.invoke('tv_popular_shows', {
          body: { 
            category: selectedGenre,
            limit: 12 
          }
        });

        console.log('🔧 Romanian shows response:', { data, error });
        if (error) throw error;
        setRomanianShows(data?.shows || []);
      } else {
        const { data, error } = await supabase.functions.invoke('tmdb_popular_tv', {
          body: { 
            genre: selectedGenre,
            limit: 12 
          }
        });

        console.log('🔧 International shows response:', { data, error });
        if (error) throw error;
        setInternationalShows(data?.shows || []);
      }
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Seriale TV Populare — Românești și Internaționale"
        description="Descoperă cele mai populare seriale TV românești și internaționale. Dexter, Wednesday, Breaking Bad, Survivor România, Chefi la Cuțite și multe altele."
        path="/tv"
      />
      
      <Container className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Seriale TV Populare
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descoperă cele mai urmărite seriale TV din România și din întreaga lume. 
            De la reality show-uri locale la producții internaționale de top.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'romanian' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('romanian')}
              className="px-6"
            >
              Seriale Românești
            </Button>
            <Button
              variant={activeTab === 'international' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('international')}
              className="px-6"
            >
              Seriale Internaționale
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(activeTab === 'romanian' ? romanianCategories : genres).map((category) => (
            <Button
              key={category.key}
              variant={selectedGenre === category.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTab === 'romanian' ? (
              romanianShows.map((show, index) => (
                <div key={index} className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary/60" />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {show.title}
                      </h3>
                      {show.airs_today && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Azi
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {show.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{show.channel}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{show.typical_time}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {show.typical_days.slice(0, 3).map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                        {show.typical_days.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{show.typical_days.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              internationalShows.map((show) => (
                <div key={show.id} className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {show.poster_url ? (
                      <img 
                        src={show.poster_url} 
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Play className="w-12 h-12 text-primary/60" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {show.vote_average.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                      {show.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {show.overview}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {show.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {show.genres.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{show.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {!loading && (activeTab === 'romanian' ? romanianShows : internationalShows).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nu sunt seriale disponibile pentru filtrele selectate.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-muted/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Urmărește-ți serialele favorite</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Descoperă când sunt difuzate emisiunile tale preferate și nu rata niciun episod. 
            Explorează atât producțiile românești cât și cele internaționale.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg">
              <Calendar className="w-5 h-5 mr-2" />
              Vezi Program TV
            </Button>
            <Button variant="outline" size="lg">
              <Star className="w-5 h-5 mr-2" />
              Top Recomandări
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}