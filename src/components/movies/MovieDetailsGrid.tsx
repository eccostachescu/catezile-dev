import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Calendar, Award, Globe, Camera } from "lucide-react";
import { MovieWhereToWatch } from "./MovieWhereToWatch";

interface MovieDetailsGridProps {
  movie: any;
}

export function MovieDetailsGrid({ movie }: MovieDetailsGridProps) {
  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Where to watch */}
          {movie.platforms && movie.platforms.length > 0 && (
            <MovieWhereToWatch 
              platforms={movie.platforms}
              streamingRo={movie.streaming_ro}
            />
          )}

          {/* Cast & Crew */}
          {(movie.main_cast || movie.director) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribuție și echipă
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {movie.director && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Regizor</h4>
                    <Badge variant="secondary">{movie.director}</Badge>
                  </div>
                )}
                
                {movie.main_cast && movie.main_cast.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Actori principali</h4>
                    <div className="flex flex-wrap gap-2">
                      {movie.main_cast.map((actor: string, index: number) => (
                        <Badge key={index} variant="outline">{actor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Production Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Informații de producție
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {movie.cinema_release_ro && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Data lansării
                    </div>
                    <div className="font-medium">
                      {new Date(movie.cinema_release_ro).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                
                {movie.original_title && movie.original_title !== movie.title && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      Titlu original
                    </div>
                    <div className="font-medium">{movie.original_title}</div>
                  </div>
                )}
                
                {movie.tmdb_id && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">ID TMDB</div>
                    <div className="font-medium">#{movie.tmdb_id}</div>
                  </div>
                )}
                
                {movie.status && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={movie.status === 'RELEASED' ? 'default' : 'secondary'}>
                      {movie.status === 'RELEASED' ? 'Lansat' : 'Programat'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TMDB Disclaimer */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Datele despre filme sunt furnizate de{" "}
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  The Movie Database (TMDB)
                </a>
                . Disponibilitatea poate varia. Verifică pe platformă pentru informații actualizate.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Linkurile către platforme pot conține coduri de afiliere care ne ajută să menținem serviciul gratuit.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popularity & Rating */}
          {movie.popularity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Popularitate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Scor TMDB</span>
                    <Badge variant={movie.popularity > 50 ? 'default' : 'secondary'}>
                      {Math.round(movie.popularity)}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(movie.popularity, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bazat pe vizualizări și interacțiuni TMDB
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistici rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {movie.runtime && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Durată</span>
                  <span className="font-medium">{movie.runtime} min</span>
                </div>
              )}
              
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Genuri</span>
                  <span className="font-medium">{movie.genres.length}</span>
                </div>
              )}
              
              {movie.main_cast && movie.main_cast.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Actori principali</span>
                  <span className="font-medium">{movie.main_cast.length}</span>
                </div>
              )}
              
              {movie.platforms && movie.platforms.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platforme</span>
                  <span className="font-medium">{movie.platforms.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>Legături externe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {movie.tmdb_id && (
                <Button variant="outline" size="sm" className="w-full justify-between" asChild>
                  <a 
                    href={`https://www.themoviedb.org/movie/${movie.tmdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vezi pe TMDB
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              
              {movie.trailer_youtube_key && (
                <Button variant="outline" size="sm" className="w-full justify-between" asChild>
                  <a 
                    href={`https://www.youtube.com/watch?v=${movie.trailer_youtube_key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trailer pe YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}