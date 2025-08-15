import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';
import Container from '@/components/Container';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  platform: string;
  message: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export default function AdminTMDB() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('netflix');
  const [importLimit, setImportLimit] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [movieCount, setMovieCount] = useState(0);
  const { toast } = useToast();

  const platforms = [
    { id: 'netflix', name: 'Netflix', providerId: 8 },
    { id: 'prime-video', name: 'Prime Video', providerId: 119 },
    { id: 'hbo-max', name: 'HBO Max', providerId: 1899 },
    { id: 'disney-plus', name: 'Disney+', providerId: 337 },
    { id: 'apple-tv', name: 'Apple TV+', providerId: 350 }
  ];

  // Load movie count on mount
  useEffect(() => {
    loadMovieCount();
  }, []);

  const loadMovieCount = async () => {
    try {
      const { count, error } = await supabase
        .from('movie')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setMovieCount(count || 0);
    } catch (error) {
      console.error('Error loading movie count:', error);
    }
  };

  // Bulk import from TMDB
  const handleBulkImport = async () => {
    setIsImporting(true);
    setImportStats(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-platform-movies', {
        body: {
          platform: selectedPlatform,
          limit: importLimit
        }
      });

      if (error) throw error;
      
      setImportStats(data);
      await loadMovieCount();
      
      toast({
        title: "Import completed",
        description: data.message,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || 'An error occurred during import',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Search movies on TMDB
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY || 'demo'}&language=ro-RO&query=${encodeURIComponent(searchQuery)}&include_adult=false`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data.results || []);
      
      toast({
        title: "Search completed",
        description: `Found ${data.results?.length || 0} movies`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Import individual movie
  const importMovie = async (tmdbMovie: TMDBMovie) => {
    try {
      // Check if movie already exists
      const { data: existingMovie } = await supabase
        .from('movie')
        .select('id')
        .eq('tmdb_id', tmdbMovie.id)
        .single();

      if (existingMovie) {
        toast({
          title: "Movie already exists",
          description: `${tmdbMovie.title} is already in the database`,
          variant: "destructive",
        });
        return;
      }

      const movieData = {
        title: tmdbMovie.title,
        tmdb_id: tmdbMovie.id,
        overview: tmdbMovie.overview,
        poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
        poster_path: tmdbMovie.poster_path,
        backdrop_url: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : null,
        backdrop_path: tmdbMovie.backdrop_path,
        popularity: tmdbMovie.popularity,
        cinema_release_ro: tmdbMovie.release_date || null,
        genres: [],
        status: 'RELEASED'
      };

      const { error } = await supabase
        .from('movie')
        .insert(movieData);

      if (error) throw error;

      toast({
        title: "Movie imported",
        description: `${tmdbMovie.title} has been added to the database`,
      });
      
      // Remove from search results
      setSearchResults(prev => prev.filter(m => m.id !== tmdbMovie.id));
      await loadMovieCount();
      
    } catch (error: any) {
      console.error('Error importing movie:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Clear all movies
  const clearAllMovies = async () => {
    if (!confirm('Are you sure you want to delete ALL movies? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('movie')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a dummy UUID

      if (error) throw error;
      
      await loadMovieCount();
      toast({
        title: "All movies deleted",
        description: "The movie database has been cleared",
      });
    } catch (error: any) {
      console.error('Error deleting movies:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getImageURL = (path: string, size = 'w92') => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">TMDB Management</h1>
          <p className="text-muted-foreground">
            Import movies from The Movie Database and manage streaming providers
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="mr-2">
              Total movies: {movieCount}
            </Badge>
          </div>
        </div>

        {/* Bulk Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Number of movies</label>
                <Input
                  type="number"
                  value={importLimit}
                  onChange={(e) => setImportLimit(parseInt(e.target.value) || 20)}
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import Movies
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Import Stats */}
            {importStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importStats.imported}</div>
                  <div className="text-sm text-muted-foreground">Imported</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importStats.updated}</div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importStats.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{importStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Search & Import */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Individual Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search movies on TMDB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={getImageURL(movie.poster_path)}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{movie.title}</h3>
                      <p className="text-sm text-muted-foreground">{movie.release_date}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{movie.overview}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          ⭐ {movie.vote_average?.toFixed(1)}
                        </Badge>
                        <Badge variant="outline">
                          TMDB ID: {movie.id}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank')}
                        variant="outline"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => importMovie(movie)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleBulkImport()}
                className="h-auto p-4 flex-col"
              >
                <Download className="w-6 h-6 mb-2" />
                <span className="font-medium">Quick Import</span>
                <span className="text-sm text-muted-foreground">Import from selected platform</span>
              </Button>

              <Button
                variant="outline"
                onClick={loadMovieCount}
                className="h-auto p-4 flex-col"
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="font-medium">Refresh Count</span>
                <span className="text-sm text-muted-foreground">Update movie statistics</span>
              </Button>

              <Button
                variant="destructive"
                onClick={clearAllMovies}
                className="h-auto p-4 flex-col"
              >
                <Trash2 className="w-6 h-6 mb-2" />
                <span className="font-medium">Clear All</span>
                <span className="text-sm text-muted-foreground">Delete all movies</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Note:</span>
              <span className="text-sm">
                This admin panel requires a valid TMDB API key and admin privileges.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}