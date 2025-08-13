import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DataImport = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const callFunction = async (functionName: string, body: any = {}) => {
    setLoading(prev => ({ ...prev, [functionName]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw error;
      
      toast({
        title: `${functionName} completed`,
        description: `Successfully imported data: ${JSON.stringify(data)}`,
      });
    } catch (err: any) {
      toast({
        title: `${functionName} failed`,
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const importAll = async () => {
    // Import data in sequence to avoid overwhelming the system
    await callFunction('holidays_generate', { fromYear: 2024, toYear: 2026 });
    await callFunction('movies_sync_tmdb');
    await callFunction('import_liga1_fixtures');
    await callFunction('search_index_refresh');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Data Import Dashboard</h1>
          <p className="text-xl text-muted-foreground">Populate the website with content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Import</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={importAll} 
              disabled={Object.values(loading).some(Boolean)}
              className="w-full"
            >
              {Object.values(loading).some(Boolean) ? 'Importing...' : 'Import All Data'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Holidays & Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => callFunction('holidays_generate', { fromYear: 2024, toYear: 2026 })}
                disabled={loading['holidays_generate']}
                className="w-full"
              >
                {loading['holidays_generate'] ? 'Generating...' : 'Generate Holidays'}
              </Button>
              <Button 
                onClick={() => callFunction('school_import')}
                disabled={loading['school_import']}
                className="w-full"
              >
                {loading['school_import'] ? 'Importing...' : 'Import School Calendar'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movies & Entertainment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => callFunction('movies_sync_tmdb')}
                disabled={loading['movies_sync_tmdb']}
                className="w-full"
              >
                {loading['movies_sync_tmdb'] ? 'Syncing...' : 'Sync TMDB Movies'}
              </Button>
              <Button 
                onClick={() => callFunction('import_tmdb_movies', { pages: 5, year: 2024 })}
                disabled={loading['import_tmdb_movies']}
                className="w-full"
              >
                {loading['import_tmdb_movies'] ? 'Importing...' : 'Import TMDB Movies'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => callFunction('import_liga1_fixtures')}
                disabled={loading['import_liga1_fixtures']}
                className="w-full"
              >
                {loading['import_liga1_fixtures'] ? 'Importing...' : 'Import Liga 1 Fixtures'}
              </Button>
              <Button 
                onClick={() => callFunction('tv_build_from_matches')}
                disabled={loading['tv_build_from_matches']}
                className="w-full"
              >
                {loading['tv_build_from_matches'] ? 'Building...' : 'Build TV from Matches'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search & Index</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => callFunction('search_index_refresh')}
                disabled={loading['search_index_refresh']}
                className="w-full"
              >
                {loading['search_index_refresh'] ? 'Refreshing...' : 'Refresh Search Index'}
              </Button>
              <Button 
                onClick={() => callFunction('build_trending')}
                disabled={loading['build_trending']}
                className="w-full"
              >
                {loading['build_trending'] ? 'Building...' : 'Build Trending Data'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataImport;