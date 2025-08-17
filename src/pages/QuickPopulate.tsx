import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function QuickPopulate() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const triggerFunction = async (functionName: string, body: any = {}, successMessage: string) => {
    setLoading(prev => ({ ...prev, [functionName]: true }));
    
    try {
      console.log(`🚀 Starting ${functionName}...`);
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) {
        console.error(`❌ ${functionName} error:`, error);
        throw error;
      }
      
      console.log(`✅ ${functionName} success:`, data);
      toast({ 
        title: "Succes!", 
        description: successMessage 
      });
      
      return data;
    } catch (error: any) {
      console.error(`❌ ${functionName} failed:`, error);
      toast({ 
        title: "Eroare", 
        description: error.message || `Eroare la ${functionName}`,
        variant: "destructive" 
      });
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const populateAll = async () => {
    try {
      // Step 1: Populate movies from TMDB
      await triggerFunction('movies_sync_tmdb', {}, 'Filme TMDB sincronizate');
      
      // Step 2: Populate monthly movies
      await triggerFunction('populate_monthly_movies', { year: 2025 }, 'Filme lunare populate pentru 2025');
      
      // Step 3: Import multi-league sports data
      await triggerFunction('import_multi_leagues', {
        league_codes: [
          'GB-PL',     // Premier League
          'ES-LL',     // La Liga
          'IT-SA',     // Serie A
          'DE-BL',     // Bundesliga
          'FR-L1',     // Ligue 1
          'EU-CL',     // Champions League
          'EU-EL'      // Europa League
        ],
        season: 2024
      }, 'Meciuri europene importate');
      
      // Step 4: Import Liga 1 fixtures
      await triggerFunction('import_liga1_fixtures', {}, 'Meciuri Liga 1 importate');
      
      // Step 5: Update movie providers
      await triggerFunction('movies_refresh_providers', {}, 'Provideri filme actualizați');
      
      // Step 6: Refresh search index
      await triggerFunction('search_index_refresh', {}, 'Index căutare actualizat');
      
      toast({ 
        title: "Populare completă!", 
        description: "Toate datele au fost populate cu succes!",
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Populare failed:', error);
    }
  };

  return (
    <Container className="max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🚀 Populare Rapidă Date</h1>
          <p className="text-muted-foreground mt-2">
            Populează site-ul cu filme și meciuri
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Populare Completă</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={populateAll}
              disabled={Object.values(loading).some(Boolean)}
              size="lg"
              className="w-full"
            >
              {Object.values(loading).some(Boolean) ? "Se populează..." : "🎬⚽ Populează Tot"}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => triggerFunction('movies_sync_tmdb', {}, 'Filme TMDB sincronizate')}
                disabled={loading['movies_sync_tmdb']}
                variant="outline"
              >
                {loading['movies_sync_tmdb'] ? "Se încarcă..." : "🎬 Filme TMDB"}
              </Button>
              
              <Button 
                onClick={() => triggerFunction('populate_monthly_movies', { year: 2025 }, 'Filme lunare 2025')}
                disabled={loading['populate_monthly_movies']}
                variant="outline"
              >
                {loading['populate_monthly_movies'] ? "Se încarcă..." : "🗓️ Filme Lunare"}
              </Button>
              
              <Button 
                onClick={() => triggerFunction('import_liga1_fixtures', {}, 'Liga 1 importată')}
                disabled={loading['import_liga1_fixtures']}
                variant="outline"
              >
                {loading['import_liga1_fixtures'] ? "Se încarcă..." : "⚽ Liga 1"}
              </Button>
              
              <Button 
                onClick={() => triggerFunction('import_multi_leagues', {
                  league_codes: ['GB-PL', 'ES-LL', 'IT-SA', 'DE-BL', 'FR-L1', 'EU-CL', 'EU-EL'],
                  season: 2024
                }, 'Ligi europene importate')}
                disabled={loading['import_multi_leagues']}
                variant="outline"
              >
                {loading['import_multi_leagues'] ? "Se încarcă..." : "🌍 Ligi Europene"}
              </Button>
              
              <Button 
                onClick={() => triggerFunction('movies_refresh_providers', {}, 'Provideri actualizați')}
                disabled={loading['movies_refresh_providers']}
                variant="outline"
              >
                {loading['movies_refresh_providers'] ? "Se încarcă..." : "📺 Provideri"}
              </Button>
              
              <Button 
                onClick={() => triggerFunction('search_index_refresh', {}, 'Index căutare actualizat')}
                disabled={loading['search_index_refresh']}
                variant="outline"
              >
                {loading['search_index_refresh'] ? "Se încarcă..." : "🔍 Index Căutare"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}