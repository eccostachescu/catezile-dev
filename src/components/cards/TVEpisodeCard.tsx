import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import CountdownTimer from "@/components/CountdownTimer";
import ReminderButton from "@/components/ReminderButton";
import { CalendarDays, Clock, Eye, Tv } from 'lucide-react';

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

interface TVEpisodeCardProps {
  episode: TVEpisode;
  className?: string;
}

export function TVEpisodeCard({ episode, className = "" }: TVEpisodeCardProps) {
  const formatEpisodeNumber = (season?: number, number?: number) => {
    if (!season || !number) return '';
    return `S${season.toString().padStart(2, '0')}E${number.toString().padStart(2, '0')}`;
  };

  const airDate = new Date(episode.airstamp);
  const now = new Date();
  const isPast = airDate.getTime() < now.getTime();

  return (
    <Card className={`group hover:shadow-lg transition-shadow overflow-hidden ${className}`}>
      {/* Hero image with countdown overlay */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
        {episode.show_image_url ? (
          <img
            src={episode.show_image_url}
            alt={episode.show_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Countdown overlay - matching EventCard style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Network badge */}
        {episode.network_name && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              {episode.network_name}
            </Badge>
          </div>
        )}
        
        {/* Episode number badge */}
        {(episode.season || episode.number) && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              {formatEpisodeNumber(episode.season, episode.number)}
            </Badge>
          </div>
        )}
        
        {/* Bottom section with countdown - like EventCard */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 text-shadow">
            {episode.show_name}
          </h3>
          
          {episode.name && (
            <p className="text-sm text-white/90 mb-3 line-clamp-1">
              {episode.name}
            </p>
          )}
          
          {/* Countdown timer */}
          {!isPast && (
            <div className="mb-3">
              <CountdownTimer target={airDate} className="text-white" />
            </div>
          )}
          
          {/* Air time */}
          <div className="flex items-center gap-4 text-sm text-white/80 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {airDate.toLocaleDateString('ro-RO', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {episode.runtime && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {episode.runtime} min
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {!isPast && (
              <ReminderButton 
                when={airDate} 
                kind="event" 
                entityId={episode.tvmaze_episode_id.toString()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom content */}
      <div className="p-4">
        {/* Summary */}
        {episode.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {episode.summary.replace(/<[^>]*>/g, '')} {/* Strip HTML */}
          </p>
        )}

        {/* Genres */}
        {episode.show_genres && episode.show_genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {episode.show_genres.slice(0, 3).map((genre, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}