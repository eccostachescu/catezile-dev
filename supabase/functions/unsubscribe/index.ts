import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) return new Response('Missing token', { status: 400, headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SERVICE);

  const { data, error } = await supabase.from('email_unsub').select('user_id').eq('token', token).maybeSingle();
  if (error || !data) return new Response('Invalid token', { status: 400, headers: corsHeaders });

  await supabase.from('user_settings').update({ marketing_emails: false }).eq('user_id', data.user_id);
  return Response.redirect(`${url.origin}/legal/cookies?unsubscribed=1`, 302);
});
