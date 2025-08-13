import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuickSampleData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const insertSampleData = async () => {
    setLoading(true);
    try {
      // Insert sample movies
      const sampleMovies = [
        {
          tmdb_id: 12345,
          title: 'Film de Test 1',
          slug: 'film-de-test-1',
          overview: 'Un film de test pentru demonstrație.',
          status: 'RELEASED',
          cinema_release_ro: '2024-01-15',
          popularity: 8.5
        },
        {
          tmdb_id: 12346,
          title: 'Film de Test 2', 
          slug: 'film-de-test-2',
          overview: 'Alt film de test pentru demonstrație.',
          status: 'SCHEDULED',
          cinema_release_ro: '2024-12-20',
          popularity: 7.2
        }
      ];

      const { error: movieError } = await supabase
        .from('movie')
        .upsert(sampleMovies, { onConflict: 'tmdb_id' });

      if (movieError) throw movieError;

      // Insert sample matches
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);

      const sampleMatches = [
        {
          home: 'FCSB',
          away: 'CFR Cluj',
          kickoff_at: tomorrow.toISOString(),
          status: 'SCHEDULED',
          tv_channels: ['Digi Sport 1', 'Prima Sport 1'],
          slug: 'fcsb-cfr-cluj-test',
          is_derby: true
        },
        {
          home: 'Dinamo Bucuresti',
          away: 'Rapid Bucuresti', 
          kickoff_at: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED',
          tv_channels: ['Digi Sport 2'],
          slug: 'dinamo-rapid-test',
          is_derby: true
        }
      ];

      const { error: matchError } = await supabase
        .from('match')
        .upsert(sampleMatches, { onConflict: 'slug' });

      if (matchError) throw matchError;

      // Refresh search index
      await supabase.functions.invoke('search_index_refresh');

      toast({
        title: 'Sample data inserted!',
        description: 'Added sample movies and matches for testing.',
      });

    } catch (error: any) {
      toast({
        title: 'Error inserting sample data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🚀 Quick Sample Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Insert sample movies and matches to test the website functionality without external APIs.
        </p>
        <Button 
          onClick={insertSampleData}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Inserting...' : 'Insert Sample Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickSampleData;