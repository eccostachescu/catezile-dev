import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, AreaChart, Area
} from "recharts";

export default function AdminMetrics() {
  const { isAdmin } = useAuth();
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('30d');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [aff, setAff] = useState<any[]>([]);

  const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const startISO = useMemo(() => new Date(Date.now() - daysBack*24*60*60*1000).toISOString().slice(0,10), [daysBack]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        supabase.from('metric_daily').select('*').gte('day', startISO).order('day', { ascending: true }),
        supabase.from('affiliate_kpi_daily').select('*').gte('day', startISO).order('day', { ascending: true }),
      ]);
      setMetrics(mRes.data || []);
      setAff(aRes.data || []);
      setLoading(false);
    };
    load();
  }, [startISO, isAdmin]);

  if (!isAdmin) return (
    <main className="container mx-auto p-4">
      <SEO title="Admin Analytics" path="/admin/metrics" noIndex />
      Doar admin.
    </main>
  );

  const seriesByDay = useMemo(() => {
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
  }, [metrics]);

  const totalAffiliateClicks = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const m of metrics) if (m.source==='affiliate' && m.metric==='affiliate_clicks') byDay[m.day] = (byDay[m.day]||0) + Number(m.value);
    return Object.entries(byDay).map(([day, clicks]) => ({ day, clicks }));
  }, [metrics]);

  const revenueSeries = useMemo(() => seriesByDay.map((d:any)=>({ day:d.day, est: Number(d.revenue_ads) + Number(d.revenue_aff) })), [seriesByDay]);

  return (
    <>
      <SEO title="Admin Analytics" path="/admin/metrics" noIndex />
      <Container>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(v:any)=>setRange(v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Interval" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Ultimele 7 zile</SelectItem>
                <SelectItem value="30d">Ultimele 30 zile</SelectItem>
                <SelectItem value="90d">Ultimele 90 zile</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=>location.reload()}>Reîmprospătează</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Trafic & Engagement</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="pageviews" name="Pageviews" stroke="#8884d8" dot={false} />
                  <Line dataKey="ad_views" name="Ad views" stroke="#82ca9d" dot={false} />
                  <Line dataKey="reminders_sent" name="Reminders" stroke="#ff7300" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Affiliate clicks / zi</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalAffiliateClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#5B7BFF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Venit estimat</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B7BFF" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#5B7BFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="est" stroke="#5B7BFF" fillOpacity={1} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
