import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const ResendKeysList = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('resend_list_keys');
      
      if (error) throw error;
      
      setKeys(data.keys || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Resend API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchKeys} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch API Keys'}
        </Button>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}
        
        {keys.length > 0 && (
          <div className="space-y-2">
            {keys.map((key: any, index: number) => (
              <div key={index} className="p-4 bg-muted rounded-md">
                <div className="space-y-2">
                  <p><strong>Name:</strong> {key.name}</p>
                  <p><strong>ID:</strong> {key.id}</p>
                  <p><strong>Created:</strong> {new Date(key.created_at).toLocaleString()}</p>
                  {key.token && (
                    <p><strong>Token:</strong> <code className="bg-background px-2 py-1 rounded text-sm">{key.token}</code></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};