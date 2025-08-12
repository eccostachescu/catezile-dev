import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerateBody {
  id: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    global: { headers: { ...Object.fromEntries(req.headers), Authorization: req.headers.get('Authorization') || '' } },
  });

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'Neautentificat' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) return new Response(JSON.stringify({ error: 'Interzis' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const body = await req.json() as ModerateBody;
    if (!body?.id || !body?.action) return new Response(JSON.stringify({ error: 'Cerere invalidă' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    if (body.action === 'REJECT') {
      const reason = (body.reason || '').trim();
      if (reason.length < 10) return new Response(JSON.stringify({ error: 'Motivul trebuie să aibă minim 10 caractere' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const update: any = { status: body.action === 'APPROVE' ? 'APPROVED' : 'REJECTED' };
    if (body.action === 'REJECT') update.reject_reason = body.reason?.trim();

    const { data: updated, error: updErr } = await supabase
      .from('countdown')
      .update(update)
      .eq('id', body.id)
      .select('id, title, slug, owner_id, status, reject_reason')
      .single();
    if (updErr) throw updErr;

    // Fetch owner email
    const { data: owner } = await supabase.from('profile').select('email').eq('id', updated.owner_id).maybeSingle();
    const toEmail = owner?.email as string | undefined;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY && toEmail) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        const subject = updated.status === 'APPROVED' ? 'Countdown aprobat pe CateZile.ro' : 'Countdown respins pe CateZile.ro';
        const reasonHtml = updated.status === 'REJECTED' ? `<p><strong>Motiv:</strong> ${htmlEscape(updated.reject_reason || '')}</p>` : '';
        const link = `${supabaseUrl?.replace('https://', 'https://')}/c/${updated.id}`;
        const html = `
          <div>
            <h2 style="margin:0 0 12px;">${subject}</h2>
            <p>Countdown: <strong>${htmlEscape(updated.title || '')}</strong></p>
            <p>Link: <a href="${link}">${link}</a></p>
            ${reasonHtml}
            <p>Mulțumim!<br/>Echipa CateZile.ro</p>
          </div>
        `;
        await resend.emails.send({
          from: 'CateZile.ro <no-reply@catezile.ro>',
          to: [toEmail],
          subject,
          html,
        });
      } catch (e) {
        console.log('Resend error', e);
      }
    } else {
      console.log('RESEND_API_KEY missing or owner email missing, skipping email');
    }

    return new Response(JSON.stringify({ ok: true, id: updated.id, status: updated.status }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('moderate_countdown error', e);
    return new Response(JSON.stringify({ error: e.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
