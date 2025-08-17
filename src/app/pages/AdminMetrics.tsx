import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Users, Eye, Mail, DollarSign, MousePointer, 
  Calendar, Download, RefreshCw, Activity 
} from "lucide-react";

export default function AdminMetrics() {
  const { isAdmin } = useAuth();
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('30d');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [aff, setAff] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const startISO = useMemo(() => new Date(Date.now() - daysBack*24*60*60*1000).toISOString().slice(0,10), [daysBack]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, aRes] = await Promise.all([
          supabase.from('metric_daily').select('*').gte('day', startISO).order('day', { ascending: true }),
          supabase.from('affiliate_kpi_daily').select('*').gte('day', startISO).order('day', { ascending: true }),
        ]);
        
        // Get trending data from popular_signals instead
        const { data: trendingData } = await supabase
          .from('popular_signals')
          .select(`
            event_id,
            score,
            event:event_id (
              title,
              slug,
              start_at
            )
          `)
          .order('score', { ascending: false })
          .limit(30);
        
        setMetrics(mRes.data || []);
        setAff(aRes.data || []);
        setTrending(trendingData || []);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setTrending([]);
      }
      setLoading(false);
    };
    load();
  }, [startISO, isAdmin]);

  // Move all useMemo hooks to top level - always called unconditionally
  const seriesByDay = useMemo(() => {
    if (!isAdmin || !metrics.length) return [];
    const map: Record<string, any> = {};
    for (const m of metrics) {
      const d = m.day;
      map[d] ||= { day: d, pageviews: 0, visitors: 0, ad_views: 0, reminders_sent: 0, revenue_ads: 0, revenue_aff: 0 };
      if (m.source === 'plausible' && m.metric === 'pageviews') map[d].pageviews += Number(m.value);
      if (m.source === 'plausible' && m.metric === 'visitors') map[d].visitors += Number(m.value);
      if (m.source === 'ads' && m.metric === 'ad_views') map[d].ad_views += Number(m.value);
      if (m.source === 'internal' && m.metric === 'reminders_sent') map[d].reminders_sent += Number(m.value);
      if (m.source === 'ads' && m.metric === 'revenue_est') map[d].revenue_ads += Number(m.value);
      if (m.source === 'affiliate' && m.metric === 'revenue_est') map[d].revenue_aff += Number(m.value);
    }
    return Object.values(map).sort((a:any,b:any)=>a.day.localeCompare(b.day));
  }, [metrics, isAdmin]);

  const totalAffiliateClicks = useMemo(() => {
    if (!isAdmin || !metrics.length) return [];
    const byDay: Record<string, number> = {};
    for (const m of metrics) if (m.source==='affiliate' && m.metric==='affiliate_clicks') byDay[m.day] = (byDay[m.day]||0) + Number(m.value);
    return Object.entries(byDay).map(([day, clicks]) => ({ day, clicks }));
  }, [metrics, isAdmin]);

  const revenueSeries = useMemo(() => {
    if (!isAdmin) return [];
    return seriesByDay.map((d:any)=>({ day:d.day, est: Number(d.revenue_ads) + Number(d.revenue_aff) }));
  }, [seriesByDay, isAdmin]);

  if (!isAdmin) return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <SEO title="Admin Analytics" path="/admin/metrics" noIndex />
      <Card className="p-8 max-w-md mx-auto">
        <CardHeader className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Acces restricționat</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Doar administratorii pot accesa această pagină.
        </CardContent>
      </Card>
    </main>
  );

  const exportCsv = async () => {
    const { data, error } = await supabase.functions.invoke('export_metrics_csv', { body: { start: startISO } });
    if (error) return;
    const blob = new Blob([data as any], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${startISO}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!seriesByDay.length) return null;
    
    const totalPageviews = seriesByDay.reduce((sum, day) => sum + day.pageviews, 0);
    const totalVisitors = seriesByDay.reduce((sum, day) => sum + day.visitors, 0);
    const totalAdViews = seriesByDay.reduce((sum, day) => sum + day.ad_views, 0);
    const totalReminders = seriesByDay.reduce((sum, day) => sum + day.reminders_sent, 0);
    const totalRevenue = seriesByDay.reduce((sum, day) => sum + day.revenue_ads + day.revenue_aff, 0);
    const totalAffiliateClicksCount = totalAffiliateClicks.reduce((sum, day) => sum + day.clicks, 0);
    
    return {
      pageviews: totalPageviews,
      visitors: totalVisitors,
      adViews: totalAdViews,
      reminders: totalReminders,
      revenue: totalRevenue,
      affiliateClicks: totalAffiliateClicksCount,
      avgDailyPageviews: Math.round(totalPageviews / seriesByDay.length),
      avgDailyVisitors: Math.round(totalVisitors / seriesByDay.length)
    };
  }, [seriesByDay, totalAffiliateClicks]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <>
      <SEO title="Admin Analytics" path="/admin/metrics" noIndex />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Container>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pt-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitorizarea performanței platformei și analiză detaliată
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={range} onValueChange={(v:any)=>setRange(v)}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Ultimele 7 zile</SelectItem>
                  <SelectItem value="30d">Ultimele 30 zile</SelectItem>
                  <SelectItem value="90d">Ultimele 90 zile</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCsv} className="hover:scale-105 transition-transform">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={()=>location.reload()} className="hover:scale-105 transition-transform">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reîmprospătează
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && summaryStats && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Vizualizări</p>
                        <p className="text-lg font-bold">{summaryStats.pageviews.toLocaleString()}</p>
                      </div>
                      <Eye className="w-5 h-5 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Vizitatori</p>
                        <p className="text-lg font-bold">{summaryStats.visitors.toLocaleString()}</p>
                      </div>
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Ad Views</p>
                        <p className="text-lg font-bold">{summaryStats.adViews.toLocaleString()}</p>
                      </div>
                      <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Reminders</p>
                        <p className="text-lg font-bold">{summaryStats.reminders.toLocaleString()}</p>
                      </div>
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30 border-teal-200 dark:border-teal-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Affiliate Clicks</p>
                        <p className="text-lg font-bold">{summaryStats.affiliateClicks.toLocaleString()}</p>
                      </div>
                      <MousePointer className="w-5 h-5 text-teal-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Venit Est.</p>
                        <p className="text-lg font-bold">${summaryStats.revenue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Trafic & Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={seriesByDay}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          dataKey="pageviews" 
                          name="Pageviews" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                        />
                        <Line 
                          dataKey="ad_views" 
                          name="Ad views" 
                          stroke="hsl(var(--secondary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          dataKey="reminders_sent" 
                          name="Reminders" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MousePointer className="w-5 h-5 text-primary" />
                      Affiliate Clicks / zi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={totalAffiliateClicks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="clicks" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card className="mb-8 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Venit estimat (Daily)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="est" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trending Section */}
              {trending.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Trending Content (Top 30)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-border">
                            <th className="p-3 font-medium">Tip</th>
                            <th className="p-3 font-medium">Entity ID</th>
                            <th className="p-3 font-medium">Scor</th>
                            <th className="p-3 font-medium">Detalii</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trending.map((t, index)=> (
                            <tr key={`${t.kind}-${t.entity_id}`} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                              <td className="p-3">
                                <Badge variant="outline" className="capitalize">
                                  {t.kind}
                                </Badge>
                              </td>
                              <td className="p-3 font-mono text-xs text-muted-foreground">{t.entity_id}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <span className="font-medium">{Number(t.score).toFixed(3)}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                <details className="cursor-pointer">
                                  <summary className="text-xs">Vezi detalii</summary>
                                  <pre className="text-xs mt-2 p-2 bg-muted rounded">
                                    {JSON.stringify(t.reasons, null, 2)}
                                  </pre>
                                </details>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Container>
      </div>
    </>
  );
}
