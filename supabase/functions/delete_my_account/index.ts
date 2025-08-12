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

  // Delete user-owned data
  await supabase.from('reminder').delete().eq('user_id', user.id);
  await supabase.from('follow').delete().eq('user_id', user.id);
  await supabase.from('countdown').delete().eq('owner_id', user.id);
  await supabase.from('user_settings').delete().eq('user_id', user.id);
  await supabase.from('profile').delete().eq('id', user.id);

  // Finally delete auth user
  await supabase.auth.admin.deleteUser(user.id);

  return new Response(null, { status: 204, headers: corsHeaders });
});
