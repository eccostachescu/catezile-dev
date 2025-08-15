import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TVEpisodeCard } from '@/components/cards/TVEpisodeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, Star, Tv, ExternalLink } from 'lucide-react';

interface TVShow {
  tvmaze_id: number;
  name: string;
  summary?: string;
  status?: string;
  language?: string;
  genres?: string[];
  network?: any;
  official_site?: string;
  premiered?: string;
  image?: any;
  rating?: any;
}

interface TVEpisode {
  id: number;
  tvmaze_episode_id: number;
  name?: string;
  season?: number;
  number?: number;
  airstamp: string;
  show_name: string;
  show_genres?: string[];
  show_image_url?: string;
  show_slug?: string;
  network_name?: string;
  runtime?: number;
  summary?: string;
}

export function TVShow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShow | null>(null);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadShow();
    }
  }, [slug]);

  const loadShow = async () => {
    try {
      // First try to find the show through show_mapping
      const { data: mapping } = await supabase
        .from('show_mapping')
        .select(`
          *,
          tvmaze_show!inner(*)
        `)
        .eq('slug', slug)
        .single();

      if (mapping?.tvmaze_show) {
        setShow(mapping.tvmaze_show);
        await loadEpisodes(mapping.tvmaze_show.tvmaze_id);
      } else {
        // Fallback: try to find by tvmaze_show name
        const { data: tvmazeShow } = await supabase
          .from('tvmaze_show')
          .select('*')
          .ilike('name', `%${slug?.replace(/-/g, ' ')}%`)
          .single();

        if (tvmazeShow) {
          setShow(tvmazeShow);
          await loadEpisodes(tvmazeShow.tvmaze_id);
        } else {
          // Final fallback: check if it's a countdown URL that should redirect to /tv/emisiuni/
          const cleanSlug = slug?.replace('insula-iubirii', 'insula-iubirii')
            .replace(/countdown\/tv\//, '');
          
          if (cleanSlug && cleanSlug !== slug) {
            const { data: fallbackShow } = await supabase
              .from('tvmaze_show')
              .select('*')
              .ilike('name', `%${cleanSlug.replace(/-/g, ' ')}%`)
              .single();
              
            if (fallbackShow) {
              setShow(fallbackShow);
              await loadEpisodes(fallbackShow.tvmaze_id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading show:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (tvmazeId: number) => {
    try {
      const { data, error } = await supabase
        .from('v_tv_episodes_upcoming')
        .select('*')
        .eq('tvmaze_show_id', tvmazeId)
        .order('airstamp', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error loading episodes:', error);
        return;
      }

      setEpisodes((data || []) as TVEpisode[]);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setEpisodesLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-96 mb-4" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!show) {
    return (
      <Container>
        <div className="py-8 text-center">
          <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Emisiunea nu a fost găsită</h2>
          <p className="text-muted-foreground mb-4">
            Nu am putut găsi informații despre această emisiune.
          </p>
          <Button onClick={() => navigate('/tv/emisiuni')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la emisiuni
          </Button>
        </div>
      </Container>
    );
  }

  const posterUrl = show.image?.original || show.image?.medium;
  const cleanSummary = show.summary?.replace(/<[^>]*>/g, '') || '';

  return (
    <>
      <SEO 
        title={`${show.name} - Emisiuni TV România`}
        description={cleanSummary.slice(0, 160) || `Urmărește episoadele din ${show.name}. Countdown-uri pentru următoarele episoade.`}
        path={`/tv/emisiuni/${slug}`}
      />
      
      <Container>
        <div className="py-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tv/emisiuni')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la emisiuni
          </Button>

          {/* Show header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={show.name}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                    <Tv className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </Card>
              
              {/* Quick info */}
              <div className="mt-4 space-y-3">
                {show.status && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Status: {show.status}</span>
                  </div>
                )}
                
                {show.premiered && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Premiera: {new Date(show.premiered).getFullYear()}
                    </span>
                  </div>
                )}
                
                {show.network?.name && (
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{show.network.name}</span>
                  </div>
                )}
                
                {show.official_site && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="w-full"
                  >
                    <a href={show.official_site} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Site oficial
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{show.name}</h1>
              
              {/* Genres */}
              {show.genres && show.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {show.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Summary */}
              {cleanSummary && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {cleanSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Episodes section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Următoarele episoade</h2>
            
            {episodesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : episodes.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nu sunt episoade programate</h3>
                <p className="text-muted-foreground">
                  Nu există episoade programate în viitorul apropiat pentru această emisiune.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {episodes.map((episode) => (
                  <TVEpisodeCard 
                    key={episode.tvmaze_episode_id} 
                    episode={episode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}