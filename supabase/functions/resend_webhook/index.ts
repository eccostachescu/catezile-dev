import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  if (!secret) return new Response('Missing secret', { status: 500, headers: corsHeaders });

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const hook = new Webhook(secret);

  try {
    const event = hook.verify(payload, headers) as any;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Minimal handling: store event
    const msgId = event?.data?.email?.id || null;
    const outcome = event?.type?.includes('bounce') ? 'BOUNCE' : event?.type?.includes('complaint') ? 'SPAM' : 'OTHER';
    await supabase.from('reminder_log').insert({ provider_id: msgId, outcome, meta: event });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 401, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
