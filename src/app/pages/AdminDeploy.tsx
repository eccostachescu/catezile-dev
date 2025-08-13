import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { 
  RefreshCw, 
  Play, 
  Trash2, 
  Globe, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface DeploymentSettings {
  cache_version: number;
  last_build_at?: string;
  build_status?: string;
  build_reason?: string;
  build_locked: boolean;
  build_min_interval_min: number;
}

interface DeploymentLog {
  id: number;
  started_at: string;
  finished_at?: string;
  status: string;
  reason?: string;
  actor?: string;
  build_id?: string;
  notes?: string;
}

interface HealthStatus {
  status: 'green' | 'yellow' | 'red';
  timestamp: string;
  responseTime: number;
  checks: Array<{
    name: string;
    status: 'green' | 'yellow' | 'red';
    message: string;
    lastRun?: string;
  }>;
}

export default function AdminDeploy() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<DeploymentSettings | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      // Load deployment settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'deployment')
        .single();

      if (settingsData?.value && typeof settingsData.value === 'object' && !Array.isArray(settingsData.value)) {
        const value = settingsData.value as Record<string, any>;
        setSettings({
          cache_version: value.cache_version || 1,
          last_build_at: value.last_build_at,
          build_status: value.build_status,
          build_reason: value.build_reason,
          build_locked: value.build_locked || false,
          build_min_interval_min: value.build_min_interval_min || 10
        });
      }

      // Load recent deployment logs
      const { data: logsData } = await supabase
        .from('deployment_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (logsData) {
        setLogs(logsData);
      }

      // Load health status
      const healthResponse = await supabase.functions.invoke('healthcheck');
      if (healthResponse.data) {
        setHealth(healthResponse.data);
      }

    } catch (error) {
      console.error('Failed to load deployment data:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca datele de deployment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerBuild = async (reason: string, force = false) => {
    setActionLoading('build');
    try {
      const { data, error } = await supabase.functions.invoke('rebuild_hook', {
        body: { reason, force },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: 'Build declanșat',
        description: `Status: ${data.status} - ${data.message}`
      });

      // Reload data after a few seconds
      setTimeout(loadData, 2000);

    } catch (error: any) {
      toast({
        title: 'Eroare build',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const purgeCache = async () => {
    setActionLoading('cache');
    try {
      // Increment cache version
      if (!settings) return;

      await supabase
        .from('settings')
        .update({
          value: {
            ...settings,
            cache_version: settings.cache_version + 1
          }
        })
        .eq('key', 'deployment');

      // Trigger warmup
      await supabase.functions.invoke('warmup', {
        body: { cacheVersion: settings.cache_version + 1 },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      toast({
        title: 'Cache purge',
        description: `Cache version actualizată la ${settings.cache_version + 1}`
      });

      loadData();

    } catch (error: any) {
      toast({
        title: 'Eroare cache purge',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rebuildSitemaps = async () => {
    setActionLoading('sitemaps');
    try {
      await supabase.functions.invoke('ping_sitemaps', {
        body: { source: 'manual_rebuild' },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      toast({
        title: 'Sitemaps rebuild',
        description: 'Sitemaps au fost regenerate și trimise la Google/Bing'
      });

    } catch (error: any) {
      toast({
        title: 'Eroare sitemaps',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBuildLock = async (locked: boolean) => {
    try {
      if (!settings) return;

      await supabase
        .from('settings')
        .update({
          value: {
            ...settings,
            build_locked: locked
          }
        })
        .eq('key', 'deployment');

      setSettings({ ...settings, build_locked: locked });

      toast({
        title: locked ? 'Builds blocate' : 'Builds deblocate',
        description: locked ? 
          'Buildurile automate sunt acum blocate' : 
          'Buildurile automate sunt acum permise'
      });

    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Succes</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Eșuat</Badge>;
      case 'SKIPPED':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Omis</Badge>;
      case 'STARTED':
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />În curs</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthBadge = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <Badge className="bg-green-500">Sănătos</Badge>;
      case 'yellow':
        return <Badge className="bg-yellow-500">Atenție</Badge>;
      case 'red':
        return <Badge variant="destructive">Probleme</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment & Cache</h1>
          <p className="text-muted-foreground">
            Gestionează buildurile, cache-ul și monitorizarea site-ului
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          disabled={!!actionLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reîmprospătează
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ultimul Build</CardTitle>
          </CardHeader>
          <CardContent>
            {settings?.build_status && (
              <div className="space-y-2">
                {getStatusBadge(settings.build_status)}
                {settings.last_build_at && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(settings.last_build_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                  </p>
                )}
                {settings.build_reason && (
                  <p className="text-xs text-muted-foreground">
                    Motiv: {settings.build_reason}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{settings?.cache_version || 1}</div>
            <p className="text-xs text-muted-foreground">
              Cache busting pentru fetch-uri client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            {health && (
              <div className="space-y-2">
                {getHealthBadge(health.status)}
                <p className="text-xs text-muted-foreground">
                  {health.responseTime}ms - {format(new Date(health.timestamp), 'HH:mm')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acțiuni Deployment</CardTitle>
          <CardDescription>
            Comenzi pentru build, cache și sitemaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="build-lock"
              checked={settings?.build_locked || false}
              onCheckedChange={toggleBuildLock}
            />
            <Label htmlFor="build-lock" className="flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Blochează buildurile automate
            </Label>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => triggerBuild('Manual build', true)}
              disabled={!!actionLoading}
              className="w-full"
            >
              {actionLoading === 'build' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Build Acum
            </Button>

            <Button 
              variant="outline"
              onClick={purgeCache}
              disabled={!!actionLoading}
              className="w-full"
            >
              {actionLoading === 'cache' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Purge Cache
            </Button>

            <Button 
              variant="outline"
              onClick={rebuildSitemaps}
              disabled={!!actionLoading}
              className="w-full"
            >
              {actionLoading === 'sitemaps' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              Rebuild Sitemaps
            </Button>

            <Button 
              variant="outline"
              onClick={loadData}
              disabled={!!actionLoading}
              className="w-full"
            >
              <Activity className="w-4 h-4 mr-2" />
              Health Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Details */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Detalii Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {health.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                    {check.lastRun && (
                      <div className="text-xs text-muted-foreground">
                        Ultima rulare: {format(new Date(check.lastRun), 'dd MMM HH:mm')}
                      </div>
                    )}
                  </div>
                  {getHealthBadge(check.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Istoric Deployments</CardTitle>
          <CardDescription>
            Ultimele 20 de builduri și operațiuni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(log.status)}
                    <span className="font-medium">{log.reason}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.actor} • {format(new Date(log.started_at), 'dd MMM yyyy HH:mm', { locale: ro })}
                    {log.finished_at && (
                      <> → {format(new Date(log.finished_at), 'HH:mm')}</>
                    )}
                  </div>
                  {log.notes && (
                    <div className="text-xs text-muted-foreground">{log.notes}</div>
                  )}
                </div>
                {log.build_id && (
                  <Badge variant="outline" className="text-xs">
                    {log.build_id}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}