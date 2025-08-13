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
  const { toast } = useToast();

  const runAllImports = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const steps = [
      { name: 'holidays_generate', label: 'Generating holidays...', body: { fromYear: 2024, toYear: 2026 } },
      { name: 'movies_sync_tmdb', label: 'Syncing TMDB movies...', body: {} },
      { name: 'import_liga1_fixtures', label: 'Importing Liga 1 fixtures...', body: {} },
      { name: 'search_index_refresh', label: 'Refreshing search index...', body: {} }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStep(step.label);
        setProgress((i / steps.length) * 100);

        console.log(`Starting ${step.name}...`);
        const { data, error } = await supabase.functions.invoke(step.name, { body: step.body });
        
        if (error) {
          console.error(`Error in ${step.name}:`, error);
          toast({
            title: `${step.name} failed`,
            description: error.message,
            variant: 'destructive',
          });
        } else {
          console.log(`${step.name} completed:`, data);
          toast({
            title: `${step.name} completed`,
            description: `Success: ${JSON.stringify(data)}`,
          });
        }
      }
      
      setProgress(100);
      setCurrentStep('All imports completed!');
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Populate Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={runAllImports} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Imports...' : 'Start Data Import'}
          </Button>
          
          {isRunning && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{currentStep}</p>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulateData;