import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const PopulateData = () => {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const runAllImports = async () => {
    setIsRunning(true);
    setProgress(0);
    setLogs([]);
    
    const steps = [
      { name: 'holidays_generate', label: 'Generating holidays...', body: { fromYear: 2024, toYear: 2026 } },
      { name: 'movies_sync_tmdb', label: 'Syncing TMDB movies...', body: {} },
      { name: 'import_liga1_fixtures', label: 'Importing Liga 1 fixtures...', body: {} },
      { name: 'search_index_refresh', label: 'Refreshing search index...', body: {} }
    ];

    addLog('🚀 Starting data population...');

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStep(step.label);
        setProgress((i / steps.length) * 100);

        addLog(`📋 ${step.label}`);
        const { data, error } = await supabase.functions.invoke(step.name, { body: step.body });
        
        if (error) {
          addLog(`❌ ${step.name} failed: ${error.message}`);
          toast({
            title: `${step.name} failed`,
            description: error.message,
            variant: 'destructive',
          });
        } else {
          addLog(`✅ ${step.name} completed: ${JSON.stringify(data)}`);
          toast({
            title: `${step.name} completed`,
            description: 'Success!',
          });
        }
      }
      
      setProgress(100);
      setCurrentStep('All imports completed!');
      
      // Check final counts
      addLog('📊 Checking final counts...');
      const [movieCount, matchCount, holidayCount] = await Promise.all([
        supabase.from('movie').select('id', { count: 'exact' }),
        supabase.from('match').select('id', { count: 'exact' }),
        supabase.from('holiday_instance').select('id', { count: 'exact' })
      ]);
      
      addLog(`📈 Movies: ${movieCount.count || 0}`);
      addLog(`⚽ Matches: ${matchCount.count || 0}`);
      addLog(`📅 Holiday instances: ${holidayCount.count || 0}`);
      addLog('🎉 All data population completed successfully!');
      
    } catch (error: any) {
      addLog(`❌ Population failed: ${error.message}`);
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-start on mount
  useEffect(() => {
    runAllImports();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Data Population in Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{currentStep}</p>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Import Log:</h3>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {!isRunning && (
            <Button 
              onClick={runAllImports} 
              className="w-full"
            >
              Run Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulateData;