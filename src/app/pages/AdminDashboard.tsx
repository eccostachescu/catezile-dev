import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [loading, setLoading] = useState<string | null>(null);

  const triggerFunction = async (functionName: string, body: any = {}, successMessage: string) => {
    setLoading(functionName);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;
      toast({ title: "Succes", description: successMessage });
      console.log(`${functionName} result:`, data);
    } catch (error: any) {
      toast({ 
        title: "Eroare", 
        description: error.message || `Failed to execute ${functionName}`,
        variant: "destructive" 
      });
      console.error(`${functionName} error:`, error);
    } finally {
      setLoading(null);
    }
  };

  const syncMovies = () => triggerFunction('movies_sync_tmdb', {}, 'Filme sincronizate cu TMDB');
  const populateMonthlyMovies = () => triggerFunction(
    'populate_monthly_movies', 
    { year: 2025 }, 
    'Filme populate pentru 2025'
  );
  const updateProviders = () => triggerFunction('movies_refresh_providers', {}, 'Provideri actualizați');
  const syncPlatformMovies = () => triggerFunction('sync-platform-movies', {}, 'Platforme sincronizate');
  return (
    <>
      <SEO title="Admin Dashboard" path="/admin" noIndex />
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎬 Filme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={populateMonthlyMovies}
                  disabled={loading === 'populate_monthly_movies'}
                  className="w-full"
                >
                  {loading === 'populate_monthly_movies' ? 'Se populează...' : 'Populează filme 2025'}
                </Button>
                <Button 
                  onClick={syncMovies}
                  disabled={loading === 'movies_sync_tmdb'}
                  variant="outline"
                  className="w-full"
                >
                  {loading === 'movies_sync_tmdb' ? 'Se sincronizează...' : 'Sincronizează TMDB'}
                </Button>
                <Button 
                  onClick={updateProviders}
                  disabled={loading === 'update_movie_providers'}
                  variant="outline"
                  className="w-full"
                >
                  {loading === 'update_movie_providers' ? 'Se actualizează...' : 'Actualizează Provideri'}
                </Button>
                <Button 
                  onClick={syncPlatformMovies}
                  disabled={loading === 'sync-platform-movies'}
                  variant="outline"
                  className="w-full"
                >
                  {loading === 'sync-platform-movies' ? 'Se sincronizează...' : 'Sincronizează Platforme'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evenimente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Administrează evenimente și moderare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/events">Vezi Evenimente</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrici</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Statistici și analiză</p>
                <Button asChild className="w-full">
                  <Link to="/admin/metrics">Vezi Metrici</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Securitate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Setări de securitate și moderare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/security">Securitate</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Căutare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Administrare căutare și indexare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/search">Căutare</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deploying</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Deploy și management aplicație</p>
                <Button asChild className="w-full">
                  <Link to="/admin/deploy">Deploy</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email-uri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Management email și notificări</p>
                <Button asChild className="w-full">
                  <Link to="/admin/emails">Email-uri</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
