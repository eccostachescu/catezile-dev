import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { securityShield } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePayload {
  title: string;
  target_at: string; // ISO string
  privacy?: 'PUBLIC' | 'UNLISTED';
  city?: string;
  theme?: any;
  honeypot?: string;
  turnstile_token?: string;
}

function isEmojiOnly(str: string) {
  // Basic check: contains at least one letter/number after trimming emojis
  const letters = str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  return letters.length === 0;
}

function validateInput(body: any): { ok: true; data: CreatePayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Payload invalid' };
  const title = String(body.title || '').trim();
  if (title.length < 4 || title.length > 80) return { ok: false, error: 'Titlul trebuie 4–80 caractere' };
  if (isEmojiOnly(title)) return { ok: false, error: 'Titlul nu poate fi doar emoji' };

  const target_at = String(body.target_at || '');
  const d = new Date(target_at);
  if (!target_at || isNaN(d.getTime())) return { ok: false, error: 'Data țintă invalidă' };
  const now = Date.now();
  const max = now + 1000 * 60 * 60 * 24 * 365 * 5; // 5 ani
  if (d.getTime() <= now) return { ok: false, error: 'Data trebuie să fie în viitor' };
  if (d.getTime() > max) return { ok: false, error: 'Data este prea departe în viitor' };

  const privacy: 'PUBLIC' | 'UNLISTED' = (body.privacy === 'UNLISTED') ? 'UNLISTED' : 'PUBLIC';
  const city = body.city ? String(body.city).trim() : undefined;
  if (city && (city.length < 2 || city.length > 64)) return { ok: false, error: 'Orașul trebuie 2–64 caractere' };

  const theme = body.theme ?? { code: 'T2' };
  const honeypot = body.honeypot ? String(body.honeypot) : '';
  if (honeypot) return { ok: false, error: 'Blocked' };

  return { ok: true, data: { title, target_at: d.toISOString(), privacy, city, theme } };
}

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET');
  if (!secret) return true; // if not configured, allow
  try {
    if (!token) return false;
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const json = await r.json();
    return !!json.success;
  } catch (e) {
    console.log('Turnstile error', e);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    global: { headers: { ...Object.fromEntries(req.headers), Authorization: req.headers.get('Authorization') || '' } },
  });

  // Apply security shield
  const securityCheck = await securityShield(req, supabase, 'create_countdown');
  if (securityCheck) return securityCheck;

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'Neautentificat' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const json = await req.json().catch(() => ({}));
    const valid = validateInput(json);
    if (!valid.ok) return new Response(JSON.stringify({ error: valid.error }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const passed = await verifyTurnstile(json.turnstile_token);
    if (!passed) return new Response(JSON.stringify({ error: 'Verificare eșuată' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    // Rate limit
    const { data: quotaOk, error: quotaErr } = await supabase.rpc('ugc_quota_exceeded', { p_user: user.id, p_kind: 'countdown' });
    if (quotaErr) {
      console.log('quotaErr', quotaErr);
    }
    if (quotaOk === true) {
      return new Response(JSON.stringify({ error: 'Ai atins limita de 3 countdown-uri în 24h' }), { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const payload = valid.data;

    const { data: inserted, error: insErr } = await supabase
      .from('countdown')
      .insert({
        title: payload.title,
        target_at: payload.target_at,
        privacy: payload.privacy,
        city: payload.city,
        theme: payload.theme,
        status: 'PENDING',
        owner_id: user.id,
      })
      .select('id, slug')
      .single();

    if (insErr) throw insErr;

    await supabase.from('ugc_quota').insert({ user_id: user.id, kind: 'countdown' });

    return new Response(JSON.stringify(inserted), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('create_countdown error', e);
    return new Response(JSON.stringify({ error: e.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
