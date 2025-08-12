import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { addMinutes } from "npm:date-fns@3.6.0";
import { utcToZonedTime, zonedTimeToUtc, formatInTimeZone } from "npm:date-fns-tz@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TZ = 'Europe/Bucharest';
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

function nowWithinQuiet() {
  const ro = utcToZonedTime(new Date(), TZ);
  const h = ro.getHours();
  return h >= 7 && h < 22;
}

function nextMorning7UTC() {
  const ro = utcToZonedTime(new Date(), TZ);
  if (ro.getHours() < 7) { ro.setHours(7,0,0,0); }
  else if (ro.getHours() >= 22) { ro.setDate(ro.getDate()+1); ro.setHours(7,0,0,0); }
  else { return new Date(); }
  return zonedTimeToUtc(ro, TZ);
}

function icsLink(kind: string, id: string) {
  const base = Deno.env.get('SUPABASE_URL');
  return `${base}/functions/v1/ics_event/${id}?kind=${encodeURIComponent(kind)}`;
}

async function buildEmailPayload(supabase: any, kind: string, entity_id: string) {
  if (kind === 'event') {
    const { data } = await supabase.from('event').select('title,slug,start_at,timezone').eq('id', entity_id).maybeSingle();
    if (!data) return null;
    const dt = formatInTimeZone(new Date(data.start_at), data.timezone || TZ, 'dd MMM yyyy, HH:mm');
    return { url: `${Deno.env.get('SITE_URL')}/evenimente/${data.slug}`, title: data.title, when: dt, subject: `În curând: ${data.title} (${dt})` };
  }
  if (kind === 'match') {
    const { data } = await supabase.from('match').select('home,away,slug,kickoff_at,tv_channels').eq('id', entity_id).maybeSingle();
    if (!data) return null;
    const dt = formatInTimeZone(new Date(data.kickoff_at), TZ, 'HH:mm');
    const tv = (data.tv_channels||[]).join(', ');
    return { url: `${Deno.env.get('SITE_URL')}/sport/${data.slug}`, title: `${data.home} – ${data.away}`, when: `astăzi la ${dt}`, subject: `Astăzi: ${data.home} – ${data.away} la ${dt}${tv?` • ${tv}`:''}` };
  }
  if (kind === 'movie') {
    const { data } = await supabase.from('movie').select('title,slug,cinema_release_ro,netflix_date,prime_date').eq('id', entity_id).maybeSingle();
    if (!data) return null;
    const url = `${Deno.env.get('SITE_URL')}/filme/${data.slug}`;
    let subject = `Noutate: ${data.title}`;
    if (data.cinema_release_ro) subject = `De azi în cinema: ${data.title}`;
    else if (data.netflix_date) subject = `Pe Netflix din ${data.netflix_date}: ${data.title}`;
    else if (data.prime_date) subject = `Pe Prime din ${data.prime_date}: ${data.title}`;
    return { url, title: data.title, when: '', subject };
  }
  if (kind === 'countdown') {
    const { data } = await supabase.from('countdown').select('title,slug,target_at').eq('id', entity_id).maybeSingle();
    if (!data) return null;
    const dt = formatInTimeZone(new Date(data.target_at), TZ, 'dd MMM yyyy, HH:mm');
    return { url: `${Deno.env.get('SITE_URL')}/c/${data.slug}`, title: data.title, when: dt, subject: `În curând: ${data.title} (${dt})` };
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    // Quiet hours: if outside, push all pending to next morning 7 RO
    if (!nowWithinQuiet()) {
      const next7 = nextMorning7UTC().toISOString();
      await supabase.from('reminder_queue').update({ fire_at: next7 }).eq('status','PENDING').lte('fire_at', new Date().toISOString());
      return new Response(JSON.stringify({ rescheduled: true }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
    }

    // Rate-limit window
    const cutoff = new Date(Date.now() - 24*60*60*1000).toISOString();

    const { data: items, error } = await supabase
      .from('reminder_queue')
      .select('id,reminder_id,user_id,fire_at,kind,entity_id,tries')
      .eq('status','PENDING')
      .lte('fire_at', new Date().toISOString())
      .order('fire_at', { ascending: true })
      .limit(200);
    if (error) throw error;

    let sent = 0, failed = 0;
    for (const it of (items||[])) {
      // Per-user rate limit: max 3/day
      const { count } = await supabase
        .from('reminder_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', it.user_id)
        .eq('outcome', 'SENT')
        .gte('sent_at', cutoff);
      if ((count||0) >= 3) {
        await supabase.from('reminder_queue').update({ status:'CANCELLED', last_error:'rate_limit' }).eq('id', it.id);
        continue;
      }

      const payload = await buildEmailPayload(supabase, it.kind, it.entity_id);
      if (!payload) {
        await supabase.from('reminder_queue').update({ status:'FAILED', last_error:'payload' }).eq('id', it.id);
        failed++; continue;
      }

      const html = `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif; line-height:1.5;">
          <h2 style="margin:0 0 8px;">${payload.subject}</h2>
          ${payload.when?`<p style="margin:0 0 12px;">${payload.when} (RO)</p>`:''}
          <p style="margin:0 0 16px;">Primești acest e‑mail deoarece ai setat un reminder pe CateZile.ro.</p>
          <p style="margin:0 0 16px;"><a href="${payload.url}" style="background:#0ea5e9;color:white;padding:10px 14px;border-radius:8px;text-decoration:none;">Vezi detalii</a>
            <a href="${icsLink(it.kind, it.entity_id)}" style="margin-left:12px;color:#0ea5e9;">Adaugă în calendar (ICS)</a></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
          <p style="color:#6b7280;font-size:12px;">Gestionează preferințele: ${Deno.env.get('SITE_URL')}/account#notifications</p>
        </div>`;

      try {
        const to = await supabase.from('profile').select('email').eq('id', it.user_id).maybeSingle();
        const email = to.data?.email;
        if (!email) throw new Error('no email');

        const res = await resend.emails.send({
          from: Deno.env.get('SENDER_EMAIL') || 'CateZile.ro <noreply@catezile.ro>',
          to: [email],
          subject: payload.subject,
          html,
        });

        await supabase.from('reminder_queue').update({ status:'SENT' }).eq('id', it.id);
        await supabase.from('reminder_log').insert({ reminder_id: it.reminder_id, user_id: it.user_id, provider_id: (res?.data as any)?.id || null, subject: payload.subject, outcome:'SENT' });
        sent++;
      } catch (err: any) {
        const tries = (it.tries||0) + 1;
        const delayMin = Math.min(tries*tries*10, 120); // cap at 2h
        await supabase.from('reminder_queue').update({ tries, last_error: err.message, fire_at: addMinutes(new Date(), delayMin).toISOString() }).eq('id', it.id);
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
