import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Search, 
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShowMapping {
  tvmaze_show_id: number;
  tmdb_id?: number;
  slug?: string;
  image_url?: string;
  image_source?: string;
  verified: boolean;
  manual_override: boolean;
  tvmaze_show: {
    name: string;
    genres?: string[];
    network?: any;
    premiered?: string;
  };
}

export function AdminTVShows() {
  const [shows, setShows] = useState<ShowMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShow, setSelectedShow] = useState<ShowMapping | null>(null);
  const [editingTmdbId, setEditingTmdbId] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('show_mapping')
        .select(`
          tvmaze_show_id,
          tmdb_id,
          slug,
          image_url,
          image_source,
          verified,
          manual_override,
          tvmaze_show!inner(
            name,
            genres,
            network,
            premiered
          )
        `)
        .order('verified', { ascending: true })
        .order('tvmaze_show_id', { ascending: false });

      if (error) {
        console.error('Error loading shows:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca emisiunile TV.',
          variant: 'destructive',
        });
        return;
      }

      setShows(data || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShows = shows.filter(show =>
    show.tvmaze_show.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditShow = (show: ShowMapping) => {
    setSelectedShow(show);
    setEditingTmdbId(show.tmdb_id?.toString() || '');
    setEditingSlug(show.slug || '');
  };

  const handleSaveShow = async () => {
    if (!selectedShow) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('show_mapping')
        .update({
          tmdb_id: editingTmdbId ? parseInt(editingTmdbId) : null,
          slug: editingSlug || null,
          verified: true,
          manual_override: true,
        })
        .eq('tvmaze_show_id', selectedShow.tvmaze_show_id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Succes',
        description: 'Maparea a fost actualizată.',
      });

      setSelectedShow(null);
      loadShows();
    } catch (error) {
      console.error('Error saving show:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva maparea.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const runTmdbMapping = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('map_tvmaze_to_tmdb');
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Succes',
        description: data.message || 'Maparea TMDB a fost rulată cu succes.',
      });

      loadShows();
    } catch (error) {
      console.error('Error running TMDB mapping:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut rula maparea TMDB.',
        variant: 'destructive',
      });
    }
  };

  const runImageEnrichment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('images_enrich_missing_shows');
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Succes',
        description: data.message || 'Îmbogățirea imaginilor a fost rulată cu succes.',
      });

      loadShows();
    } catch (error) {
      console.error('Error running image enrichment:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut rula îmbogățirea imaginilor.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SEO 
        title="Admin - Emisiuni TV"
        description="Administrare emisiuni TV și mapări TMDB"
        noindex
      />
      
      <Container>
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Administrare Emisiuni TV</h1>
            <p className="text-muted-foreground mb-6">
              Gestionează mapările TMDB și verifică emisiunile TV importate.
            </p>
            
            <div className="flex gap-4 mb-6">
              <Button onClick={runTmdbMapping} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Rulează Mapare TMDB
              </Button>
              <Button onClick={runImageEnrichment} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Îmbogățește Imagini
              </Button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută emisiuni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emisiune</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TMDB ID</TableHead>
                    <TableHead>Imagine</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShows.map((show) => (
                    <TableRow key={show.tvmaze_show_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{show.tvmaze_show.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {show.tvmaze_show.premiered && (
                              <span>Premiera: {new Date(show.tvmaze_show.premiered).getFullYear()}</span>
                            )}
                            {show.tvmaze_show.genres && show.tvmaze_show.genres.length > 0 && (
                              <span className="ml-2">• {show.tvmaze_show.genres.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {show.verified ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verificat
                            </Badge>
                          ) : show.tmdb_id ? (
                            <Badge variant="secondary">Necesar review</Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Nemapat
                            </Badge>
                          )}
                          {show.manual_override && (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {show.tmdb_id ? (
                          <a
                            href={`https://www.themoviedb.org/tv/${show.tmdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {show.tmdb_id}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {show.image_url ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={show.image_url}
                              alt={show.tvmaze_show.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <Badge variant="outline" className="text-xs">
                              {show.image_source || 'unknown'}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Lipsește</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditShow(show)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editează Maparea</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Emisiune TVMaze</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedShow?.tvmaze_show.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">TMDB ID</label>
                                <Input
                                  value={editingTmdbId}
                                  onChange={(e) => setEditingTmdbId(e.target.value)}
                                  placeholder="ID din The Movie Database"
                                  type="number"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Slug</label>
                                <Input
                                  value={editingSlug}
                                  onChange={(e) => setEditingSlug(e.target.value)}
                                  placeholder="slug-pentru-url"
                                />
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  onClick={handleSaveShow} 
                                  disabled={saving}
                                  className="flex-1"
                                >
                                  {saving ? 'Salvează...' : 'Salvează'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedShow(null)}
                                  className="flex-1"
                                >
                                  Anulează
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredShows.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nu s-au găsit emisiuni.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </Container>
    </>
  );
}