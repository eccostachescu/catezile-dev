import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface MovieCastGridProps {
  movie: any;
}

export function MovieCastGrid({ movie }: MovieCastGridProps) {
  // Extract cast data from various sources
  const credits = movie.credits;
  const castFromStreaming = movie.streaming_ro?.main_cast;
  const directorFromStreaming = movie.streaming_ro?.director;
  
  // Combine cast data
  let castMembers: any[] = [];
  
  if (credits?.cast && credits.cast.length > 0) {
    castMembers = credits.cast.slice(0, 10);
  } else if (castFromStreaming) {
    castMembers = castFromStreaming.split(',').map((name: string, index: number) => ({
      id: index,
      name: name.trim(),
      character: '',
      profile_path: null
    }));
  } else if (movie.main_cast && Array.isArray(movie.main_cast)) {
    castMembers = movie.main_cast.map((name: string, index: number) => ({
      id: index,
      name: name,
      character: '',
      profile_path: null
    }));
  }

  // Get crew data
  const director = directorFromStreaming || movie.director || 
    (credits?.crew?.find((person: any) => person.job === 'Director')?.name);
  
  const writer = credits?.crew?.find((person: any) => person.job === 'Writer' || person.job === 'Screenplay')?.name;
  const producer = credits?.crew?.find((person: any) => person.job === 'Producer')?.name;

  if (!castMembers.length && !director) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribuție și echipă
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Crew */}
        {(director || writer || producer) && (
          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Echipa principală</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {director && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Regizor</div>
                  <Badge variant="secondary">{director}</Badge>
                </div>
              )}
              {writer && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Scenarist</div>
                  <Badge variant="secondary">{writer}</Badge>
                </div>
              )}
              {producer && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Producător</div>
                  <Badge variant="secondary">{producer}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cast Grid */}
        {castMembers.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">
              Actori principali ({castMembers.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {castMembers.map((person) => (
                <a
                  key={person.id || person.name}
                  href={person.id ? `https://www.themoviedb.org/person/${person.id}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer"
                  onClick={() => person.id && window.open(`https://www.themoviedb.org/person/${person.id}`, '_blank')}
                >
                  <div className="space-y-2">
                    <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-muted flex items-center justify-center ${person.profile_path ? 'hidden' : ''}`}>
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">{person.name}</div>
                      {person.character && (
                        <div className="text-xs text-muted-foreground leading-tight line-clamp-2">
                          {person.character}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Full Cast Link */}
        {movie.tmdb_id && (
          <div className="pt-3 border-t">
            <a
              href={`https://www.themoviedb.org/movie/${movie.tmdb_id}/cast`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Vezi distribuția completă pe TMDB →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}