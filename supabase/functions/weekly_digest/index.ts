import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    // Monday 06:00 UTC trigger expected
    const { data: users } = await supabase.from('user_settings').select('user_id').eq('email_digest', true);

    let total = 0;
    for (const u of (users||[])) {
      // TODO: Build personalized weekly summary. For now, log intent.
      await supabase.from('reminder_log').insert({ user_id: u.user_id, subject: 'WEEKLY_DIGEST', outcome: 'SENT', meta: { note: 'digest placeholder' } });
      total++;
    }

    return new Response(JSON.stringify({ total }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
