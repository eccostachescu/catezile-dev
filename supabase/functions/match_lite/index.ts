import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { id } = await req.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from('match')
      .select('status, score, kickoff_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Compute minute fallback if LIVE and no minute present
    let score = data.score || {};
    if ((data.status === 'LIVE') && (score.elapsed == null && score.minute == null) && data.kickoff_at) {
      const start = new Date(data.kickoff_at).getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - start) / 60000));
      score = { ...score, elapsed: mins };
    }

    return new Response(JSON.stringify({ status: data.status, score }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
