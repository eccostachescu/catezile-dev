import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, Tv, Play, Bell } from 'lucide-react';
import { tmdbService } from '@/services/tmdb';

interface TVShowCardProps {
  show: {
    id: number;
    name: string;
    overview: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average: number;
    first_air_date: string;
    genres?: string[];
    poster_url?: string;
    backdrop_url?: string;
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
  };
  onClick?: () => void;
  showCountdown?: boolean;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function TVShowCard({ show, onClick, showCountdown = true }: TVShowCardProps) {
  const [countdown, setCountdown] = useState<CountdownTime | null>(null);
  const [isAiring, setIsAiring] = useState(false);

  useEffect(() => {
    console.log('🔧 TVShowCard effect:', { showCountdown, airDate: show.air_date, showName: show.name });
    if (!showCountdown || !show.air_date) return;

    const updateCountdown = () => {
      const timeData = tmdbService.getTimeUntilAiring(show.air_date!);
      console.log('🔧 Countdown calculation for', show.name, ':', timeData);
      
      if (timeData) {
        setCountdown({
          days: timeData.days,
          hours: timeData.hours,
          minutes: timeData.minutes,
          seconds: timeData.seconds
        });
        setIsAiring(false);
      } else {
        setCountdown(null);
        setIsAiring(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [show.air_date, showCountdown]);

  const posterUrl = show.poster_url || tmdbService.getImageURL(show.poster_path, 'w500');
  const backdropUrl = show.backdrop_url || tmdbService.getImageURL(show.backdrop_path, 'w1280');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEpisodeInfo = () => {
    if (show.next_episode) {
      return `S${show.next_episode.season_number}E${show.next_episode.episode_number}: ${show.next_episode.name}`;
    }
    if (show.season_number && show.episode_number) {
      return `S${show.season_number}E${show.episode_number}${show.episode_name ? `: ${show.episode_name}` : ''}`;
    }
    return 'Episod nou';
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card border-border overflow-hidden"
      onClick={onClick}
    >
      {/* Backdrop/Poster Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {backdropUrl ? (
          <img 
            src={backdropUrl} 
            alt={show.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-primary/60" />
          </div>
        )}

        {/* Overlay with badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-black/80 text-white border-0">
            <Tv className="w-3 h-3 mr-1" />
            TV
          </Badge>
          {isAiring && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE ACUM
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center">
          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
          {show.vote_average.toFixed(1)}
        </div>

        {/* Show title and episode info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
            {show.name}
          </h3>
          <p className="text-white/90 text-sm font-medium">
            {getEpisodeInfo()}
          </p>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Countdown Timer */}
        {showCountdown && countdown && (
          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Începe în:
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{countdown.days}</div>
                  <div className="text-xs text-muted-foreground">Zile</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{countdown.hours}</div>
                  <div className="text-xs text-muted-foreground">Ore</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{countdown.minutes}</div>
                  <div className="text-xs text-muted-foreground">Min</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{countdown.seconds}</div>
                  <div className="text-xs text-muted-foreground">Sec</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show countdown even if no data for debugging */}
        {showCountdown && !countdown && show.air_date && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-center">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Episode airing: {show.air_date}
              </p>
              <p className="text-xs text-yellow-600">
                Debug: Countdown calculation failed
              </p>
            </div>
          </div>
        )}

        {/* Show Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {show.overview || show.next_episode?.overview || 'Fără descriere disponibilă.'}
        </p>

        {/* Air Date Info */}
        {show.air_date && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Difuzare: {formatDate(show.air_date)}</span>
          </div>
        )}

        {/* Genres */}
        {show.genres && show.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {show.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            {show.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{show.genres.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              // Handle reminder setting
            }}
          >
            <Bell className="w-4 h-4 mr-1" />
            Reminder
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view details
              onClick?.();
            }}
          >
            Detalii
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}