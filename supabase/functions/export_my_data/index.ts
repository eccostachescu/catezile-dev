import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabaseAuth = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: req.headers.get('Authorization')! } } });
  const supabase = createClient(SUPABASE_URL, SERVICE);

  const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });

  // Collect data owned by the user
  const [profile, settings, follows, reminders, countdowns] = await Promise.all([
    supabase.from('profile').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('follow').select('*').eq('user_id', user.id),
    supabase.from('reminder').select('*').eq('user_id', user.id),
    supabase.from('countdown').select('*').eq('owner_id', user.id),
  ]).then(rs => rs.map((r:any)=>r.data));

  const payload = { profile, settings, follows, reminders, countdowns };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=export.json", ...corsHeaders },
  });
});
