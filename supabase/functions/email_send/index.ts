import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

  try {
    const { to, template, kind, id, track_marketing = false } = await req.json();
    if (!to || !template) throw new Error('Missing to/template');

    const renderRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email_render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, kind, id }),
    });
    const { subject, html, text } = await renderRes.json();
    if (!subject || !html) throw new Error('Render failed');

    const { data, error } = await resend.emails.send({
      from: Deno.env.get('SENDER_EMAIL') || 'CateZile.ro <noreply@catezile.ro>',
      to: [to],
      subject,
      html,
      text,
      tags: [{ name: 'template', value: template }],
      // Resend disables open/click tracking by default unless set in the account; no marketing trackers here
    } as any);
    if (error) throw error;

    await supabase.from('reminder_log').insert({ user_id: null, provider_id: (data as any)?.id || null, subject, outcome: 'SENT', meta: { template, kind, id } });

    return new Response(JSON.stringify({ ok: true, id: (data as any)?.id || null }), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
