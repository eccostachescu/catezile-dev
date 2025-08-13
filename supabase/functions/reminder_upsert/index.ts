import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { addHours, subDays } from "npm:date-fns@3.6.0";
import { toZonedTime, fromZonedTime } from "npm:date-fns-tz@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TZ = "Europe/Bucharest";

function withinQuietHours(d: Date) {
  const ro = toZonedTime(d, TZ);
  const h = ro.getHours();
  return h >= 7 && h < 22;
}

function adjustToQuietHours(d: Date) {
  const ro = toZonedTime(d, TZ);
  const h = ro.getHours();
  if (h < 7) {
    ro.setHours(7, 0, 0, 0);
    return fromZonedTime(ro, TZ);
  }
  if (h >= 22) {
    const next = new Date(ro.getTime());
    next.setDate(next.getDate() + 1);
    next.setHours(7, 0, 0, 0);
    return fromZonedTime(next, TZ);
  }
  return d;
}

async function getTargetAt(supabase: any, kind: string, entity_id: string): Promise<Date | null> {
  if (kind === 'event') {
    const { data } = await supabase.from('event').select('start_at').eq('id', entity_id).maybeSingle();
    return data?.start_at ? new Date(data.start_at) : null;
  }
  if (kind === 'match') {
    const { data } = await supabase.from('match').select('kickoff_at').eq('id', entity_id).maybeSingle();
    return data?.kickoff_at ? new Date(data.kickoff_at) : null;
  }
  if (kind === 'movie') {
    const { data } = await supabase.from('movie').select('cinema_release_ro, netflix_date, prime_date').eq('id', entity_id).maybeSingle();
    const d = data;
    const candidate = d?.cinema_release_ro || d?.netflix_date || d?.prime_date;
    return candidate ? new Date(candidate) : null;
  }
  if (kind === 'countdown') {
    const { data } = await supabase.from('countdown').select('target_at').eq('id', entity_id).maybeSingle();
    return data?.target_at ? new Date(data.target_at) : null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  });

  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const body = await req.json();
    const kind: string = body.kind;
    const entity_id: string = body.entity_id;
    const days: number = Number(body.offsets?.days ?? 1);
    const hours: number = Number(body.offsets?.hours ?? 0);

    // Check consent
    const { data: settings } = await supabase.from('user_settings').select('email_reminders').eq('user_id', user.id).maybeSingle();
    if (settings && settings.email_reminders === false) {
      return new Response(JSON.stringify({ error: 'Email reminders disabled' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Target datetime
    const targetAt = await getTargetAt(supabase, kind, entity_id);
    if (!targetAt) {
      return new Response(JSON.stringify({ error: 'Target not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    let next = subDays(targetAt, days);
    next = addHours(next, -hours);
    next = adjustToQuietHours(next);

    // Upsert reminder for this offset
    const payload = {
      user_id: user.id,
      entity_type: kind,
      entity_id,
      offset_days: days,
      offset_hours: hours,
      channel: 'email',
      status: 'ACTIVE',
      next_fire_at: next.toISOString(),
    };

    const { data: up, error } = await supabase.from('reminder').upsert(payload).select('id').maybeSingle();
    if (error) throw error;

    return new Response(JSON.stringify({ reminder_id: up?.id, next_fire_at: payload.next_fire_at }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
