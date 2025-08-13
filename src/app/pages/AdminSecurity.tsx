import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { schemas } from "@/lib/security";
import { Shield, AlertTriangle, Ban, CheckCircle, Download, Trash2, Eye } from "lucide-react";

interface SecurityEvent {
  id: number;
  occurred_at: string;
  ip_hash: string;
  route: string;
  user_agent: string;
  kind: string;
  meta: any;
}

interface IPEntry {
  id: string;
  ip: unknown;
  reason?: string;
  note?: string;
  until?: string;
  created_at: string;
  created_by: string;
}

export default function AdminSecurity() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<IPEntry[]>([]);
  const [allowedIPs, setAllowedIPs] = useState<IPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  
  // Form states
  const [blockForm, setBlockForm] = useState({ ip: '', reason: '', duration: '24' });
  const [allowForm, setAllowForm] = useState({ ip: '', note: '' });
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showAllowDialog, setShowAllowDialog] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [selectedTimeframe]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(selectedTimeframe));
      
      // Load security events
      const { data: events } = await supabase
        .from('security_event')
        .select('*')
        .gte('occurred_at', since.toISOString())
        .order('occurred_at', { ascending: false })
        .limit(500);
      
      // Load blocked IPs
      const { data: blocked } = await supabase
        .from('ip_blocklist')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load allowed IPs
      const { data: allowed } = await supabase
        .from('ip_allowlist')
        .select('*')
        .order('created_at', { ascending: false });

      setSecurityEvents(events || []);
      setBlockedIPs(blocked || []);
      setAllowedIPs(allowed || []);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const blockIP = async () => {
    try {
      const validatedData = schemas.ipBlock.parse({
        ip: blockForm.ip,
        reason: blockForm.reason,
        duration: parseInt(blockForm.duration)
      });
      
      const until = new Date();
      until.setHours(until.getHours() + validatedData.duration);
      
      const { error } = await supabase
        .from('ip_blocklist')
        .insert({
          ip: validatedData.ip,
          reason: validatedData.reason,
          until: until.toISOString()
        });
      
      if (error) throw error;
      
      toast.success('IP blocked successfully');
      setShowBlockDialog(false);
      setBlockForm({ ip: '', reason: '', duration: '24' });
      loadSecurityData();
    } catch (error: any) {
      console.error('Error blocking IP:', error);
      toast.error(error.message || 'Failed to block IP');
    }
  };

  const allowIP = async () => {
    try {
      const validatedData = schemas.ipAllow.parse({
        ip: allowForm.ip,
        note: allowForm.note
      });
      
      const { error } = await supabase
        .from('ip_allowlist')
        .insert({
          ip: validatedData.ip,
          note: validatedData.note
        });
      
      if (error) throw error;
      
      toast.success('IP added to allowlist');
      setShowAllowDialog(false);
      setAllowForm({ ip: '', note: '' });
      loadSecurityData();
    } catch (error: any) {
      console.error('Error allowing IP:', error);
      toast.error(error.message || 'Failed to allow IP');
    }
  };

  const unblockIP = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ip_blocklist')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('IP unblocked');
      loadSecurityData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Failed to unblock IP');
    }
  };

  const removeFromAllowlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ip_allowlist')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('IP removed from allowlist');
      loadSecurityData();
    } catch (error) {
      console.error('Error removing from allowlist:', error);
      toast.error('Failed to remove from allowlist');
    }
  };

  const clearRateLimits = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_rate_limit');
      if (error) throw error;
      
      toast.success('Rate limits cleared');
    } catch (error) {
      console.error('Error clearing rate limits:', error);
      toast.error('Failed to clear rate limits');
    }
  };

  const exportSecurityEvents = () => {
    const csv = [
      'Timestamp,IP Hash,Route,User Agent,Event Type,Details',
      ...securityEvents.map(event => 
        `${event.occurred_at},"${event.ip_hash}","${event.route}","${event.user_agent}","${event.kind}","${JSON.stringify(event.meta)}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getEventBadgeVariant = (kind: string) => {
    switch (kind) {
      case 'BLOCKED': return 'destructive';
      case 'RATE_LIMIT': return 'destructive';
      case 'WAF_PATTERN': return 'destructive';
      case 'UGC_SPAM': return 'destructive';
      default: return 'secondary';
    }
  };

  const eventsByType = securityEvents.reduce((acc, event) => {
    acc[event.kind] = (acc[event.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoutes = securityEvents.reduce((acc, event) => {
    acc[event.route] = (acc[event.route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading security dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor and manage security events for CateZile.ro</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportSecurityEvents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedIPs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Allowed IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{allowedIPs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Threat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {Object.entries(eventsByType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
          <TabsTrigger value="allowed">Allowed IPs</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Security events from the last {selectedTimeframe} day(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>IP Hash</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.occurred_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_hash.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.route}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEventBadgeVariant(event.kind)}>
                          {event.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs">
                        {event.user_agent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Blocked IPs
                <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Ban className="h-4 w-4 mr-2" />
                      Block IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block IP Address</DialogTitle>
                      <DialogDescription>
                        Block an IP address from accessing the site
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="block-ip">IP Address</Label>
                        <Input
                          id="block-ip"
                          value={blockForm.ip}
                          onChange={(e) => setBlockForm({...blockForm, ip: e.target.value})}
                          placeholder="192.168.1.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="block-reason">Reason</Label>
                        <Textarea
                          id="block-reason"
                          value={blockForm.reason}
                          onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                          placeholder="Suspicious activity detected"
                        />
                      </div>
                      <div>
                        <Label htmlFor="block-duration">Duration (hours)</Label>
                        <Select value={blockForm.duration} onValueChange={(value) => setBlockForm({...blockForm, duration: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="168">1 week</SelectItem>
                            <SelectItem value="720">1 month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={blockIP}>
                        Block IP
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{String(entry.ip)}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell>
                        {entry.until ? new Date(entry.until).toLocaleString() : 'Permanent'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unblockIP(entry.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allowed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Allowed IPs
                <Dialog open={showAllowDialog} onOpenChange={setShowAllowDialog}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Allow IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Allow IP Address</DialogTitle>
                      <DialogDescription>
                        Add an IP address to the allowlist (bypasses all security checks)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="allow-ip">IP Address</Label>
                        <Input
                          id="allow-ip"
                          value={allowForm.ip}
                          onChange={(e) => setAllowForm({...allowForm, ip: e.target.value})}
                          placeholder="192.168.1.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="allow-note">Note</Label>
                        <Textarea
                          id="allow-note"
                          value={allowForm.note}
                          onChange={(e) => setAllowForm({...allowForm, note: e.target.value})}
                          placeholder="Trusted admin IP"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAllowDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={allowIP}>
                        Allow IP
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allowedIPs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{String(entry.ip)}</TableCell>
                      <TableCell>{entry.note || '-'}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromAllowlist(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>
                  Maintenance and cleanup operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={clearRateLimits} variant="outline" className="w-full">
                  Clear Rate Limits
                </Button>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These actions affect active security rules. Use with caution.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
                <CardDescription>
                  Breakdown of security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(eventsByType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-sm">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}