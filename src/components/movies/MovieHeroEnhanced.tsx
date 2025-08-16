import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, Users, Play, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReminderButton from "@/components/ReminderButton";
import { PillCountdown } from "@/components/ui/cz-pill-countdown";
import FollowButton from "@/components/FollowButton";
import { Share2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface MovieHeroEnhancedProps {
  movie: any;
}

export function MovieHeroEnhanced({ movie }: MovieHeroEnhancedProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const releaseDate = movie.cinema_release_ro || movie.netflix_date || movie.prime_date;
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();
  
  const handleShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      track('share_click', { url });
    } catch {}
  };

  const getRating = () => {
    if (movie.popularity && movie.popularity > 80) return "★★★★★";
    if (movie.popularity && movie.popularity > 60) return "★★★★☆";
    if (movie.popularity && movie.popularity > 40) return "★★★☆☆";
    if (movie.popularity && movie.popularity > 20) return "★★☆☆☆";
    return "★☆☆☆☆";
  };

  const getGenreColors = (genre: string) => {
    const colors: Record<string, string> = {
      'Action': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Adventure': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Animation': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Comedy': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Drama': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Fantasy': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Horror': 'bg-gray-800/20 text-gray-300 border-gray-500/30',
      'Romance': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'Sci-Fi': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Thriller': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    };
    return colors[genre] || 'bg-accent/20 text-accent-foreground border-accent/30';
  };

  return (
    <div className="relative overflow-hidden">
      {/* Backdrop with overlay */}
      {(movie.backdrop_url || movie.backdrop_path) && (
        <div className="absolute inset-0 z-0">
          <img 
            src={movie.backdrop_url || `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} 
            alt={`Backdrop ${movie.title}`} 
            className="w-full h-full object-cover"
            loading="lazy" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
      )}
      
      <Container className="relative z-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Poster */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                {(movie.poster_url || movie.poster_path) ? (
                  <img 
                    src={movie.poster_url || `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={`Poster ${movie.title}`} 
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted/20 flex items-center justify-center">
                    <span className="text-muted-foreground">Fără poster</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main info */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title and year */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight drop-shadow-lg">
                {movie.seo_h1 || movie.title}
              </h1>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="text-xl text-foreground/80 font-medium drop-shadow">{movie.original_title}</p>
              )}
              
              {/* Quick info badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {movie.cinema_release_ro && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-foreground/70" />
                    <span className="text-sm text-foreground/90 drop-shadow">
                      {new Date(movie.cinema_release_ro).getFullYear()}
                    </span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-foreground/70" />
                    <span className="text-sm text-foreground/90 drop-shadow">{movie.runtime} min</span>
                  </div>
                )}
                {(movie.vote_average || movie.popularity) && movie.popularity > 20 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-foreground/90 drop-shadow">
                      {movie.vote_average ? `${Math.round(movie.vote_average * 10)}%` : getRating()}
                    </span>
                  </div>
                )}
                {movie.certification && (
                  <Badge variant="outline" className="bg-white/10 border-white/20 text-foreground backdrop-blur">
                    {movie.certification}
                  </Badge>
                )}
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 4).map((genre: string) => (
                  <Badge 
                    key={genre} 
                    variant="outline" 
                    className={`${getGenreColors(genre)} border`}
                  >
                    {genre}
                  </Badge>
                ))}
                {movie.genres.length > 4 && (
                  <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/30">
                    +{movie.genres.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Description */}
            {movie.overview && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground drop-shadow">Despre film</h3>
                <p className="text-foreground/90 leading-relaxed text-base max-w-2xl drop-shadow">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Cast preview */}
            {(movie.streaming_ro?.main_cast || movie.main_cast) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground drop-shadow flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Actori principali
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(movie.streaming_ro?.main_cast 
                    ? movie.streaming_ro.main_cast.split(',').map((actor: string) => actor.trim())
                    : movie.main_cast || []).slice(0, 4).map((actor: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-foreground/90 backdrop-blur border-white/10">
                      {actor}
                    </Badge>
                  ))}
                  {(movie.streaming_ro?.main_cast 
                    ? movie.streaming_ro.main_cast.split(',').length 
                    : movie.main_cast ? movie.main_cast.length : 0) > 4 && (
                    <Badge variant="secondary" className="bg-white/10 text-foreground/90 backdrop-blur border-white/10">
                      +{(movie.streaming_ro?.main_cast 
                        ? movie.streaming_ro.main_cast.split(',').length 
                        : movie.main_cast ? movie.main_cast.length : 0) - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action panel */}
          <div className="lg:col-span-3">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 space-y-4">
                {/* Countdown */}
                {isUpcoming && releaseDate && (
                  <div className="text-center space-y-2">
                    <h4 className="text-sm font-medium text-foreground/70">Premiere în</h4>
                    <div className="flex justify-center">
                      <PillCountdown date={releaseDate} status="upcoming" className="text-base px-3 py-1 font-semibold" />
                    </div>
                  </div>
                )}

                {/* Trailer */}
                {(movie.trailer_youtube_key || movie.trailer_key) && (
                  <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Play className="mr-2 h-5 w-5" />
                        Vezi trailer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full p-0 bg-black border-white/10">
                      <div className="relative aspect-video">
                        <iframe
                          ref={iframeRef}
                          src={`https://www.youtube.com/embed/${movie.trailer_youtube_key || movie.trailer_key}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1`}
                          title="Movie Trailer"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Actions */}
                <div className="space-y-3">
                {releaseDate && (
                  <div className="w-full">
                    <ReminderButton 
                      when={releaseDate} 
                      kind="movie" 
                      entityId={movie.id}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FollowButton />
                  </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Release info */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  {movie.cinema_release_ro && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Cinema:</span>
                      <span className="text-foreground font-medium">
                        {new Date(movie.cinema_release_ro).toLocaleDateString('ro-RO', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {movie.netflix_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Netflix:</span>
                      <span className="text-foreground font-medium">
                        {new Date(movie.netflix_date).toLocaleDateString('ro-RO', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {movie.prime_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Prime Video:</span>
                      <span className="text-foreground font-medium">
                        {new Date(movie.prime_date).toLocaleDateString('ro-RO', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}