import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-cron",
};

type Weights = { w1:number; w2:number; w3:number; w4:number; w5:number };

function norm(vals: number[], v: number) {
  if (!vals.length) return 0;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return max === min ? 0 : (v - min) / (max - min);
}

function proximityScore(dt: string | null, kind: 'event'|'match'|'movie', tz = Deno.env.get('TIMEZONE') || 'Europe/Bucharest') {
  if (!dt) return 0;
  const now = new Date();
  const target = new Date(dt);
  const diffH = (target.getTime() - now.getTime()) / 36e5;
  if (kind === 'match') {
    if (diffH < -4) return 0; // finished
    if (diffH < 0) return 0.9; // live-ish
    if (diffH > 72) return 0.1; // far
    return Math.exp(-diffH / 36); // decay within 72h
  }
  if (kind === 'event') {
    if (diffH < 0) return 0;
    if (diffH > 24*14) return 0.05;
    return Math.exp(-diffH / (24*5));
  }
  // movie
  if (diffH < 0) return 0.4;
  if (diffH > 24*14) return 0.05;
  return Math.exp(-diffH / (24*7));
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const cronHeader = req.headers.get('x-admin-cron');
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    if (cronSecret && cronHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    // Weights from settings or defaults
    let weights: Weights = { w1:0.35, w2:0.2, w3:0.25, w4:0.15, w5:0.05 };
    const { data: tw } = await supabase.from('settings').select('value').eq('key','trending_weights').maybeSingle();
    if (tw?.value) weights = { ...weights, ...tw.value };

    const sinceIso = new Date(Date.now() - 36e5 * 24).toISOString();

    // Engagement signals (24h)
    const { data: rlogs } = await supabase.from('reminder_log').select('reminder_id, sent_at').gte('sent_at', sinceIso);
    const remIds = Array.from(new Set((rlogs||[]).map(r=>r.reminder_id).filter(Boolean)));
    const { data: rems } = remIds.length ? await supabase.from('reminder').select('id, entity_type, entity_id').in('id', remIds) : { data: [] } as any;
    const reminderByEntity = new Map<string, number>(); // key: kind:id
    for (const rr of rems||[]) {
      const key = `${rr.entity_type}:${rr.entity_id}`;
      reminderByEntity.set(key, (reminderByEntity.get(key)||0) + 1);
    }

    const { data: follows } = await supabase.from('follow').select('entity_type, entity_id, created_at').gte('created_at', sinceIso);
    const followByEntity = new Map<string, number>();
    for (const f of follows||[]) {
      const key = `${f.entity_type}:${f.entity_id}`;
      followByEntity.set(key, (followByEntity.get(key)||0) + 1);
    }

    // Affiliate intent via clicks → map affiliate_link to entity (events, matches)
    const { data: clicks } = await supabase.from('click').select('entity_id, created_at').eq('kind','affiliate').gte('created_at', sinceIso);
    const linkIds = Array.from(new Set((clicks||[]).map(c=>c.entity_id).filter(Boolean)));
    const { data: eOffers } = linkIds.length ? await supabase.from('event_offer').select('affiliate_link_id, event_id') .in('affiliate_link_id', linkIds) : { data: [] } as any;
    const { data: mOffers } = linkIds.length ? await supabase.from('match_offer').select('affiliate_link_id, match_id') .in('affiliate_link_id', linkIds) : { data: [] } as any;
    const affByEntity = new Map<string, number>();
    const clicksCount: Record<string, number> = {};
    for (const c of clicks||[]) clicksCount[c.entity_id] = (clicksCount[c.entity_id]||0)+1;
    for (const eo of eOffers||[]) {
      const cnt = clicksCount[eo.affiliate_link_id]||0;
      const key = `event:${eo.event_id}`;
      affByEntity.set(key, (affByEntity.get(key)||0) + cnt);
    }
    for (const mo of mOffers||[]) {
      const cnt = clicksCount[mo.affiliate_link_id]||0;
      const key = `match:${mo.match_id}`;
      affByEntity.set(key, (affByEntity.get(key)||0) + cnt);
    }

    // Cohorts to consider (upcoming windows)
    const nowIso = new Date().toISOString();
    const { data: events } = await supabase.from('event').select('id, start_at').gte('start_at', nowIso).lte('start_at', new Date(Date.now()+24*14*36e5).toISOString());
    const { data: matches } = await supabase.from('match').select('id, kickoff_at').gte('kickoff_at', new Date(Date.now()-4*36e5).toISOString()).lte('kickoff_at', new Date(Date.now()+72*36e5).toISOString());
    const { data: movies } = await supabase.from('movie').select('id, cinema_release_ro, netflix_date, prime_date').lte('cinema_release_ro', new Date(Date.now()+14*24*36e5).toISOString());

    type Item = { kind:'event'|'match'|'movie', id:string, proximity:number, reminders:number, follows:number, aff:number };
    const items: Item[] = [];

    for (const e of events||[]) items.push({ kind:'event', id: e.id, proximity: proximityScore(e.start_at,'event'), reminders: reminderByEntity.get(`event:${e.id}`)||0, follows: followByEntity.get(`event:${e.id}`)||0, aff: affByEntity.get(`event:${e.id}`)||0 });
    for (const m of matches||[]) items.push({ kind:'match', id: m.id, proximity: proximityScore(m.kickoff_at,'match'), reminders: reminderByEntity.get(`match:${m.id}`)||0, follows: followByEntity.get(`match:${m.id}`)||0, aff: affByEntity.get(`match:${m.id}`)||0 });
    for (const mv of movies||[]) {
      const dt = mv.cinema_release_ro || mv.netflix_date || mv.prime_date || null;
      items.push({ kind:'movie', id: mv.id, proximity: proximityScore(dt,'movie'), reminders: reminderByEntity.get(`movie:${mv.id}`)||0, follows: followByEntity.get(`movie:${mv.id}`)||0, aff: 0 });
    }

    // Placeholder for pageviews/growth/engagement rate (without Plausible → 0)
    const pageviewsVals = items.map(()=>0);
    const growthVals = items.map(()=>0);
    const proximityVals = items.map(i=>i.proximity);
    const remindersVals = items.map(i=>i.reminders);
    const followsVals = items.map(i=>i.follows);
    const affVals = items.map(i=>i.aff);

    const normProx = (v:number)=> norm(proximityVals, v);
    const normEng  = (v:number)=> norm(remindersVals.map((x,i)=>x + followsVals[i]), v);
    const normAff  = (v:number)=> norm(affVals, v);

    // Compute and upsert
    for (const it of items) {
      const idx = items.indexOf(it);
      const n1 = 0; // pageviews component (await Plausible)
      const n2 = 0; // growth vs 3-day avg (await Plausible)
      const n3 = normEng(it.reminders + it.follows);
      const n4 = normProx(it.proximity);
      const n5 = normAff(it.aff);
      const score = weights.w1*n1 + weights.w2*n2 + weights.w3*n3 + weights.w4*n4 + weights.w5*n5;
      const reasons = { n1, n2, n3, n4, n5, raw: { reminders: it.reminders, follows: it.follows, aff: it.aff, proximity: it.proximity } };
      await supabase.from('trending').upsert({ kind: it.kind, entity_id: it.id, score, reasons }, { onConflict: 'kind,entity_id' });
    }

    return new Response(JSON.stringify({ ok: true, updated: items.length }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('build_trending error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
