import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { addMinutes } from "npm:date-fns@3.6.0";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "npm:date-fns-tz@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TZ = 'Europe/Bucharest';
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

function nowWithinQuiet() {
  const ro = toZonedTime(new Date(), TZ);
  const h = ro.getHours();
  return h >= 7 && h < 22;
}

function nextMorning7UTC() {
  const ro = toZonedTime(new Date(), TZ);
  if (ro.getHours() < 7) { ro.setHours(7,0,0,0); }
  else if (ro.getHours() >= 22) { ro.setDate(ro.getDate()+1); ro.setHours(7,0,0,0); }
  else { return new Date(); }
  return fromZonedTime(ro, TZ);
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

      // Destination email
      const to = await supabase.from('profile').select('email').eq('id', it.user_id).maybeSingle();
      const email = to.data?.email;
      if (!email) {
        await supabase.from('reminder_queue').update({ status:'FAILED', last_error:'no_email' }).eq('id', it.id);
        failed++; continue;
      }

      // Map kind -> template
      const template = it.kind === 'event' ? 'ReminderEvent' : it.kind === 'match' ? 'ReminderMatch' : it.kind === 'movie' ? 'ReminderMovie' : 'TransactionalGeneric';

      try {
        const invoke = await supabase.functions.invoke('email_send', { body: { to: email, template, kind: it.kind, id: it.entity_id, track_marketing: false } });
        if ((invoke as any).error) throw new Error((invoke as any).error.message || 'send error');

        await supabase.from('reminder_queue').update({ status:'SENT' }).eq('id', it.id);
        await supabase.from('reminder_log').insert({ reminder_id: it.reminder_id, user_id: it.user_id, provider_id: (invoke.data as any)?.id || null, subject: null, outcome:'SENT' });
        sent++;
      } catch (err: any) {
        const { data: curr } = await supabase.from('reminder_queue').select('tries').eq('id', it.id).maybeSingle();
        const tries = ((curr?.tries as number) || 0) + 1;
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
