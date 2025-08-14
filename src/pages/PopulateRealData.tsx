import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, Trash2 } from 'lucide-react';

export default function PopulateRealData() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handlePopulateRealData = async () => {
    setIsPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate_real_data');
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Database populated with real data: ${JSON.stringify(data.data)}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to populate database with real data",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all existing data? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      // Clear specific tables manually (only ones we can access)
      await supabase.from('popular_signals').delete().neq('event_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('reminder').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('follow').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('follow_channel').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('click').delete().neq('id', 0);
      await supabase.from('countdown').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('event').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('match').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('movie').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('holiday_instance').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Success!",
        description: "Existing data cleared successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to clear some data - this is normal due to permissions",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            Populate the database with real Romanian events, movies, sports matches, and holidays.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Populate Real Data
              </CardTitle>
              <CardDescription>
                Add real Romanian events, festivals, sports matches, movies, and holidays to the database.
                This includes:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Untold, Neversea, Electric Castle festivals</li>
                  <li>Real Liga 1 football matches</li>
                  <li>Upcoming movies with Romanian release dates</li>
                  <li>Romanian public holidays</li>
                  <li>Real countdown events</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePopulateRealData} 
                disabled={isPopulating}
                className="w-full"
                size="lg"
              >
                {isPopulating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Populating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Populate Real Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Clear Existing Data
              </CardTitle>
              <CardDescription>
                Remove all existing test/fake data from the database before populating with real data.
                This will clear:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All events and countdowns</li>
                  <li>All movies and matches</li>
                  <li>All holiday instances</li>
                  <li>All reminders and follows</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleClearData} 
                disabled={isClearing}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>First:</strong> Click "Clear All Data" to remove any existing test data</li>
              <li><strong>Then:</strong> Click "Populate Real Data" to add real Romanian events and data</li>
              <li><strong>Finally:</strong> Navigate back to the homepage to see real events with proper countdowns</li>
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              This will give you real data to test the countdown functionality, event displays, and other features properly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}