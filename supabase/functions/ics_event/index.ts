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
  const parts = url.pathname.split('/'); // /functions/v1/ics_event/:id
  const id = parts[parts.length - 1];
  const kind = url.searchParams.get('kind') || 'event';

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let title = 'Reminder', start: Date | null = null, end: Date | null = null, pageUrl = Deno.env.get('SITE_URL') || '';
  if (kind === 'event') {
    const { data } = await supabase.from('event').select('title,slug,start_at,end_at,timezone').eq('id', id).maybeSingle();
    if (data) { title = data.title; start = new Date(data.start_at); end = data.end_at?new Date(data.end_at):new Date(start.getTime()+60*60*1000); pageUrl += `/evenimente/${data.slug}`; }
  } else if (kind === 'match') {
    const { data } = await supabase.from('match').select('home,away,slug,kickoff_at').eq('id', id).maybeSingle();
    if (data) { title = `${data.home} – ${data.away}`; start = new Date(data.kickoff_at); end = new Date(start.getTime()+2*60*60*1000); pageUrl += `/sport/${data.slug}`; }
  } else if (kind === 'movie') {
    const { data } = await supabase.from('movie').select('title,slug,cinema_release_ro').eq('id', id).maybeSingle();
    if (data && data.cinema_release_ro) { title = data.title; start = new Date(data.cinema_release_ro); end = new Date(start.getTime()+2*60*60*1000); pageUrl += `/filme/${data.slug}`; }
  } else if (kind === 'countdown') {
    const { data } = await supabase.from('countdown').select('title,slug,target_at').eq('id', id).maybeSingle();
    if (data) { title = data.title; start = new Date(data.target_at); end = new Date(start.getTime()+60*60*1000); pageUrl += `/c/${data.slug}`; }
  }

  if (!start) return new Response('Not found', { status: 404, headers: corsHeaders });

  const uid = `${id}-${kind}@catezile.ro`;
  const out = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CateZile.ro//EN\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end!)}\nSUMMARY:${title}\nURL:${pageUrl}\nEND:VEVENT\nEND:VCALENDAR`;

  return new Response(out, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${title.replace(/\s+/g,'-')}.ics"`,
      ...corsHeaders,
    },
  });
});
