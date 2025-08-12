import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function dt(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const token = url.pathname.split('/').pop()!.replace(/\.ics$/,'');

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: profile } = await supabase.from('profile').select('id').eq('ical_token', token).maybeSingle();
  if (!profile) return new Response('Not found', { status: 404, headers: corsHeaders });

  // Collect active reminders for next 6 months
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + 6);

  const { data: rems } = await supabase
    .from('reminder')
    .select('id,entity_type,entity_id')
    .eq('user_id', profile.id)
    .eq('status','ACTIVE');

  let events = '';
  for (const r of (rems||[])) {
    let title = 'Item', start: Date | null = null, end: Date | null = null;
    if (r.entity_type === 'event') {
      const { data } = await supabase.from('event').select('title,start_at,end_at').eq('id', r.entity_id).maybeSingle();
      if (data) { title = data.title; start = new Date(data.start_at); end = data.end_at?new Date(data.end_at):new Date(start.getTime()+60*60*1000); }
    } else if (r.entity_type === 'match') {
      const { data } = await supabase.from('match').select('home,away,kickoff_at').eq('id', r.entity_id).maybeSingle();
      if (data) { title = `${data.home} – ${data.away}`; start = new Date(data.kickoff_at); end = new Date(start.getTime()+2*60*60*1000); }
    } else if (r.entity_type === 'movie') {
      const { data } = await supabase.from('movie').select('title,cinema_release_ro').eq('id', r.entity_id).maybeSingle();
      if (data?.cinema_release_ro) { title = data.title; start = new Date(data.cinema_release_ro); end = new Date(start.getTime()+2*60*60*1000); }
    } else if (r.entity_type === 'countdown') {
      const { data } = await supabase.from('countdown').select('title,target_at').eq('id', r.entity_id).maybeSingle();
      if (data) { title = data.title; start = new Date(data.target_at); end = new Date(start.getTime()+60*60*1000); }
    }
    if (!start || start > horizon) continue;
    const uid = `${r.id}@catezile.ro`;
    events += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end!)}\nSUMMARY:${title}\nEND:VEVENT\n`;
  }

  const out = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CateZile.ro//EN\n${events}END:VCALENDAR`;
  return new Response(out, { status: 200, headers: { 'Content-Type':'text/calendar; charset=utf-8', 'Cache-Control':'public, max-age=900', ...corsHeaders } });
});
