import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Calendar, Award, Globe, Camera, Star, DollarSign, Languages } from "lucide-react";
import { MovieWhereToWatch } from "./MovieWhereToWatch";
import { MovieCastGrid } from "./MovieCastGrid";

interface MovieDetailsGridProps {
  movie: any;
}

export function MovieDetailsGrid({ movie }: MovieDetailsGridProps) {
  // Extract real data from TMDB
  const budget = movie.budget ? `$${movie.budget.toLocaleString()}` : null;
  const revenue = movie.revenue ? `$${movie.revenue.toLocaleString()}` : null;
  const voteAverage = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const voteCount = movie.vote_count || null;
  const originalLanguage = movie.original_language || null;
  const productionCompanies = movie.production_companies || [];
  const productionCountries = movie.production_countries || [];
  const keywords = movie.keywords || (movie.streaming_ro?.keywords ? movie.streaming_ro.keywords : []);

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
          {(movie.streaming_ro?.main_cast || movie.main_cast || movie.credits) && (
            <MovieCastGrid movie={movie} />
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
                
                {originalLanguage && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Languages className="h-4 w-4" />
                      Limba originală
                    </div>
                    <div className="font-medium">{originalLanguage.toUpperCase()}</div>
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

                {budget && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Buget
                    </div>
                    <div className="font-medium">{budget}</div>
                  </div>
                )}

                {revenue && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Încasări
                    </div>
                    <div className="font-medium">{revenue}</div>
                  </div>
                )}

                {productionCompanies.length > 0 && (
                  <div className="space-y-1 sm:col-span-2">
                    <div className="text-sm text-muted-foreground">Companii de producție</div>
                    <div className="flex flex-wrap gap-2">
                      {productionCompanies.slice(0, 3).map((company: any, index: number) => (
                        <Badge key={index} variant="outline">{company.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {productionCountries.length > 0 && (
                  <div className="space-y-1 sm:col-span-2">
                    <div className="text-sm text-muted-foreground">Țări de producție</div>
                    <div className="flex flex-wrap gap-2">
                      {productionCountries.map((country: any, index: number) => (
                        <Badge key={index} variant="outline">{country.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          {keywords && keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cuvinte cheie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 12).map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
          {/* User Score & Rating */}
          {(voteAverage || movie.popularity) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Evaluare utilizatori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voteAverage && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Scor TMDB</span>
                        <Badge variant={voteAverage > 70 ? 'default' : voteAverage > 50 ? 'secondary' : 'outline'}>
                          {voteAverage}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${voteAverage}%` }}
                        />
                      </div>
                      {voteCount && (
                        <p className="text-xs text-muted-foreground">
                          Bazat pe {voteCount.toLocaleString()} voturi
                        </p>
                      )}
                    </div>
                  )}
                  
                  {movie.popularity && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Popularitate</span>
                        <Badge variant="outline">
                          {Math.round(movie.popularity)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Bazat pe vizualizări și interacțiuni TMDB
                      </p>
                    </div>
                  )}
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
                  <span className="font-medium">{movie.genres.join(', ')}</span>
                </div>
              )}
              
              {movie.cinema_release_ro && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">An lansare</span>
                  <span className="font-medium">{new Date(movie.cinema_release_ro).getFullYear()}</span>
                </div>
              )}

              {movie.certification && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Clasificare</span>
                  <Badge variant="outline" className="text-xs">
                    {movie.certification}
                  </Badge>
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
              
              {(movie.trailer_youtube_key || movie.trailer_key) && (
                <Button variant="outline" size="sm" className="w-full justify-between" asChild>
                  <a 
                    href={`https://www.youtube.com/watch?v=${movie.trailer_youtube_key || movie.trailer_key}`}
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