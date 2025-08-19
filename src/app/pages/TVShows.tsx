import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/seo/SEO";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Play, Clock, Bell, Tv, ExternalLink, Zap } from "lucide-react";
import { TVShowCard } from "@/components/tv/TVShowCard";
import { tmdbService } from "@/services/tmdb";

interface TVShow {
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
  air_date?: string;
  episode_name?: string;
  season_number?: number;
  episode_number?: number;
  next_episode?: {
    air_date: string;
    name: string;
    season_number: number;
    episode_number: number;
    overview: string;
  };
}

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

export function TVShows() {
  const navigate = useNavigate();
  const [romanianShows, setRomanianShows] = useState<PopularShow[]>([]);
  const [internationalShows, setInternationalShows] = useState<TVShow[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'romanian' | 'international'>('upcoming');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = [
    { key: '', label: 'Toate' },
    { key: 'drama', label: 'Drama' },
    { key: 'comedy', label: 'Comedy' },
    { key: 'crime', label: 'Crime' },
    { key: 'sci-fi', label: 'Sci-Fi' },
    { key: 'fantasy', label: 'Fantasy' },
    { key: 'action', label: 'Acțiune' },
    { key: 'thriller', label: 'Thriller' },
    { key: 'animation', label: 'Animație' },
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

  // Mock countdown shows with real upcoming dates
  const getMockCountdownShows = () => {
    const now = new Date();
    const shows = [
      {
        id: 94997,
        name: "House of the Dragon",
        overview: "Set 200 years before Game of Thrones, this epic series tells the story of House Targaryen.",
        poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
        backdrop_path: "/9Rq14Eyrf7Tu1xk0Pl7VcNbNh1n.jpg",
        first_air_date: "2022-08-21",
        vote_average: 8.5,
        popularity: 2847.0,
        genres: ["Drama", "Fantasy", "Action"],
        poster_url: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
        backdrop_url: "https://image.tmdb.org/t/p/w1280/9Rq14Eyrf7Tu1xk0Pl7VcNbNh1n.jpg",
        slug: "house-of-the-dragon",
        air_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        episode_name: "Season 3 Premiere",
        season_number: 3,
        episode_number: 1,
        next_episode: {
          air_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: "Season 3 Premiere",
          season_number: 3,
          episode_number: 1,
          overview: "The dragon civil war begins as Rhaenyra seeks to claim her throne."
        }
      },
      {
        id: 119051,
        name: "Wednesday",
        overview: "Wednesday Addams navigates her years as a student at Nevermore Academy.",
        poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
        backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
        first_air_date: "2022-11-23",
        vote_average: 8.5,
        popularity: 2103.0,
        genres: ["Comedy", "Crime", "Mystery"],
        poster_url: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
        backdrop_url: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
        slug: "wednesday",
        air_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        episode_name: "New Mystery",
        season_number: 2,
        episode_number: 1,
        next_episode: {
          air_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: "New Mystery",
          season_number: 2,
          episode_number: 1,
          overview: "Wednesday returns to Nevermore Academy with new supernatural mysteries to solve."
        }
      },
      {
        id: 100088,
        name: "The Last of Us",
        overview: "Joel and Ellie navigate a post-apocalyptic world.",
        poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
        backdrop_path: "/9ft8GBTqxFbuqLRDkwoDVAkzp9Q.jpg",
        first_air_date: "2023-01-15",
        vote_average: 8.7,
        popularity: 2158.95,
        genres: ["Drama", "Sci-Fi", "Action"],
        poster_url: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
        backdrop_url: "https://image.tmdb.org/t/p/w1280/9ft8GBTqxFbuqLRDkwoDVAkzp9Q.jpg",
        slug: "the-last-of-us",
        air_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        episode_name: "The Road Ahead",
        season_number: 2,
        episode_number: 5,
        next_episode: {
          air_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: "The Road Ahead",
          season_number: 2,
          episode_number: 5,
          overview: "Joel and Ellie face new dangers on their journey."
        }
      },
      {
        id: 91557,
        name: "Invincible",
        overview: "Mark Grayson discovers his father is the most powerful superhero on Earth.",
        poster_path: "/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg",
        backdrop_path: "/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg",
        first_air_date: "2021-03-26",
        vote_average: 8.9,
        popularity: 1221.66,
        genres: ["Animation", "Action", "Drama"],
        poster_url: "https://image.tmdb.org/t/p/w500/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg",
        backdrop_url: "https://image.tmdb.org/t/p/w1280/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg",
        slug: "invincible",
        air_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
        episode_name: "The Ultimate Test",
        season_number: 3,
        episode_number: 2,
        next_episode: {
          air_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: "The Ultimate Test",
          season_number: 3,
          episode_number: 2,
          overview: "Mark faces his greatest challenge yet as he learns more about his father's past."
        }
      }
    ];
    return shows;
  };

  const loadShows = async () => {
    try {
      setLoading(true);
      console.log('🔧 Loading shows for tab:', activeTab, 'genre:', selectedGenre);

      if (activeTab === 'upcoming') {
        console.log('🔧 Fetching upcoming shows with episodes...');
        try {
          const shows = await tmdbService.getUpcomingTVShowsWithEpisodes(20);
          console.log('🔧 Got upcoming shows:', shows);
          
          // If no shows, add mock data with countdowns
          if (shows.length === 0) {
            console.log('🔧 Adding mock countdown data...');
            const mockShows = getMockCountdownShows();
            setUpcomingShows(mockShows);
          } else {
            setUpcomingShows(shows);
          }
        } catch (error) {
          console.error('🔧 Failed to fetch from TMDB service, using mock data...', error);
          // Fallback to mock countdown data
          const mockShows = getMockCountdownShows();
          setUpcomingShows(mockShows);
        }
      } else if (activeTab === 'romanian') {
        const [apiShows, homepageShows] = await Promise.all([
          loadApiShows(),
          loadHomepageShows()
        ]);
        
        const allShows = [...apiShows, ...homepageShows];
        const uniqueShows = allShows.filter((show, index, self) => 
          index === self.findIndex(s => s.title === show.title)
        );
        
        setRomanianShows(uniqueShows);
      } else {
        console.log('🔧 Fetching international shows...');
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

  const loadApiShows = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tv_popular_shows', {
        body: { 
          category: selectedGenre,
          limit: 12 
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
      const { data, error } = await supabase.functions.invoke('popular_countdowns', {
        body: { 
          limit: 50,
          onlyWithImage: false
        }
      });

      if (error) throw error;

      const tvEvents = (data?.events || []).filter((event: any) => {
        const title = event.title?.toLowerCase() || '';
        const category = event.category_name?.toLowerCase() || '';
        
        return category.includes('tv') || 
               category.includes('emisiuni') ||
               title.includes('survivor') ||
               title.includes('te cunosc') ||
               title.includes('ferma');
      });

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

  const handleShowClick = (show: TVShow | PopularShow) => {
    if ('name' in show) {
      const slug = show.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      navigate(`/tv/show/${show.id}/${slug}`);
    } else {
      const slug = show.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      navigate(`/tv/emisiuni/${slug}`);
    }
  };

  const addToPopular = async (show: PopularShow) => {
    // Handle adding to popular logic
  };

  return (
    <>
      <SEO 
        title="Seriale TV Populare — Cu Countdown și Episoade Noi"
        description="Descoperă serialele TV cu countdown pentru episoade noi, seriale românești și internaționale populare."
        path="/tv"
      />
      
      <Container className="py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Seriale TV Populare
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Urmărește countdown-uri pentru episoade noi și descoperă cele mai populare seriale TV.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cu Countdown
          </button>
          <button
            onClick={() => setActiveTab('romanian')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'romanian'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seriale Românești
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'international'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seriale Internaționale
          </button>
        </div>

        {/* Genre Filters */}
        {activeTab !== 'upcoming' && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(activeTab === 'romanian' ? romanianCategories : genres).map((genre) => (
              <button
                key={genre.key}
                onClick={() => setSelectedGenre(genre.key)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  selectedGenre === genre.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : activeTab === 'upcoming' ? (
          upcomingShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingShows.map((show) => (
                <TVShowCard
                  key={show.id}
                  show={show}
                  onClick={() => handleShowClick(show)}
                  showCountdown={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nu s-au găsit seriale cu countdown</h3>
              <p className="text-muted-foreground">Încearcă din nou mai târziu pentru episoade noi.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'romanian' ? romanianShows : internationalShows).map((show: any) => (
              <TVShowCard
                key={activeTab === 'romanian' ? show.title : show.id}
                show={activeTab === 'romanian' ? {
                  id: 0,
                  name: show.title,
                  overview: show.description,
                  poster_path: '',
                  backdrop_path: '',
                  vote_average: 0,
                  first_air_date: '',
                  genres: [show.type]
                } : show}
                onClick={() => handleShowClick(show)}
                showCountdown={false}
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}