import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { addMinutes, addHours, differenceInMinutes } from "npm:date-fns@3.6.0";
import { toZonedTime, fromZonedTime } from "npm:date-fns-tz@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TZ = 'Europe/Bucharest';

function ensureQuiet(d: Date) {
  const ro = toZonedTime(d, TZ);
  const h = ro.getHours();
  if (h < 7) { ro.setHours(7,0,0,0); return fromZonedTime(ro, TZ); }
  if (h >= 22) { const n = new Date(ro.getTime()); n.setDate(n.getDate()+1); n.setHours(7,0,0,0); return fromZonedTime(n, TZ); }
  return d;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const now = new Date();
    const horizon = addHours(now, 48);

    // Find reminders that should fire within next 48h based on stored next_fire_at
    const { data: reminders, error } = await supabase
      .from('reminder')
      .select('id,user_id,entity_type,entity_id,offset_days,offset_hours,status,next_fire_at')
      .eq('status','ACTIVE')
      .lte('next_fire_at', horizon.toISOString());
    if (error) throw error;

    let enqueued = 0, skipped = 0;

    for (const r of (reminders || [])) {
      if (!r.next_fire_at) continue;
      let fireAt = ensureQuiet(new Date(r.next_fire_at));

      // Check idempotency: any pending in this minute?
      const minuteBucket = new Date(fireAt);
      minuteBucket.setSeconds(0,0);
      const { data: existing } = await supabase
        .from('reminder_queue')
        .select('id')
        .eq('reminder_id', r.id)
        .eq('status','PENDING')
        .gte('fire_at', minuteBucket.toISOString())
        .lte('fire_at', addMinutes(minuteBucket, 1).toISOString())
        .limit(1)
        .maybeSingle();
      if (existing) { skipped++; continue; }

      const ins = await supabase.from('reminder_queue').insert({
        reminder_id: r.id,
        user_id: r.user_id,
        fire_at: fireAt.toISOString(),
        kind: r.entity_type,
        entity_id: r.entity_id,
      });
      if (ins.error) { skipped++; } else { enqueued++; }
    }

    // ingestion log
    await supabase.from('ingestion_log').insert({ source: 'reminder-scheduler', status: 'OK', message: `enqueued=${enqueued} skipped=${skipped}` });

    return new Response(JSON.stringify({ enqueued, skipped }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    await supabase.from('ingestion_log').insert({ source: 'reminder-scheduler', status: 'ERROR', message: e.message });
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
