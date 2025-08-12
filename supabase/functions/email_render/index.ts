import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";

// Minimal inline components (duplicated for Edge, do not import from src)
const container = { width: '100%', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: '12px', padding: 16 } as const;
const btn = { display: 'inline-block', background: '#5B7BFF', color: '#fff', padding: '12px 16px', borderRadius: 12, textDecoration: 'none', fontSize: 14 } as const;
const text = { fontSize: 14, color: '#111827', lineHeight: 1.5 } as const;

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

function layout(children: React.ReactNode, preheader?: string, showUnsub?: boolean, unsubUrl?: string) {
  return React.createElement(
    'html',
    null,
    React.createElement('head', null, preheader ? React.createElement('div', { style: { display: 'none', overflow: 'hidden', lineHeight: 1, maxHeight: 0, maxWidth: 0, opacity: 0 } }, preheader) : null),
    React.createElement('body', { style: { margin: 0, padding: 0, background: '#f8fafc' } },
      React.createElement('div', { style: { background: '#0B0F1A', padding: '16px 0' } },
        React.createElement('div', { style: { width: 600, maxWidth: '100%', padding: '0 16px', margin: '0 auto' } },
          React.createElement('div', { style: { color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif' } }, 'CateZile.ro')
        )
      ),
      React.createElement('div', { style: { padding: 16 } },
        React.createElement('div', { style: container }, children)
      ),
      React.createElement('div', { style: { padding: '16px 0' } },
        React.createElement('div', { style: { width: 600, maxWidth: '100%', padding: '0 16px', margin: '0 auto' } },
          React.createElement('p', { style: { margin: '0 0 8px', color: '#6b7280', fontSize: 12 } }, 'Primești acest e‑mail deoarece ai setat remindere pe CateZile.ro.'),
          React.createElement('p', { style: { margin: 0, color: '#6b7280', fontSize: 12 } },
            React.createElement('a', { href: `${Deno.env.get('SITE_URL') || 'https://catezile.ro'}/account#notifications`, style: { color: '#6b7280' } }, 'Gestionează preferințele'),
            showUnsub && unsubUrl ? React.createElement(React.Fragment, null, ' • ', React.createElement('a', { href: unsubUrl, style: { color: '#6b7280' } }, 'Dezabonează‑te')) : null
          )
        )
      )
    )
  );
}

function icsLink(kind: string, id: string) {
  const base = Deno.env.get('SUPABASE_URL');
  return `${base}/functions/v1/ics_event/${id}?kind=${encodeURIComponent(kind)}`;
}

async function buildPayload(supabase: any, template: string, kind?: string, id?: string, sample?: string) {
  const site = Deno.env.get('SITE_URL') || 'https://catezile.ro';
  if (template === 'ReminderEvent') {
    if (id && kind === 'event') {
      const { data } = await supabase.from('event').select('id, title, slug, start_at, timezone, city').eq('id', id).maybeSingle();
      if (!data) throw new Error('not found');
      const when = new Date(data.start_at).toLocaleString('ro-RO', { timeZone: data.timezone || 'Europe/Bucharest' });
      const html = await renderAsync(layout(
        React.createElement(React.Fragment, null,
          React.createElement('h2', null, data.title),
          React.createElement('p', { style: text }, `${when}${data.city ? `, ${data.city}` : ''}`),
          React.createElement('div', { style: { display: 'flex', gap: 12 } },
            React.createElement('a', { href: `${site}/evenimente/${data.slug}`, style: btn }, 'Vezi detalii'),
            React.createElement('a', { href: icsLink('event', data.id), style: { color: '#2563eb', alignSelf: 'center' } }, 'Adaugă în calendar (ICS)')
          )
        )
      ), { pretty: true });
      const subject = `În curând: ${data.title}`;
      const textAlt = `${data.title}\n${when}\n${site}/evenimente/${data.slug}`;
      return { subject, html, text: textAlt };
    }
    // sample fallback
    const title = 'Concert exemplu';
    const when = '12 aug 2025, 20:00';
    const html = await renderAsync(layout(
      React.createElement(React.Fragment, null,
        React.createElement('h2', null, title),
        React.createElement('p', { style: text }, when),
        React.createElement('a', { href: `${site}/`, style: btn }, 'Vezi detalii')
      )
    ), { pretty: true });
    return { subject: `În curând: ${title}`, html, text: `${title}\n${when}\n${site}` };
  }
  if (template === 'ReminderMatch') {
    if (id && kind === 'match') {
      const { data } = await supabase.from('match').select('id, home, away, slug, kickoff_at, tv_channels').eq('id', id).maybeSingle();
      if (!data) throw new Error('not found');
      const time = new Date(data.kickoff_at).toLocaleTimeString('ro-RO', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' });
      const tv = (data.tv_channels||[]).join(', ');
      const html = await renderAsync(layout(
        React.createElement(React.Fragment, null,
          React.createElement('div', { style: { display: 'inline-block', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 999, fontSize: 12 } }, 'Sport'),
          React.createElement('h2', null, `${data.home} – ${data.away}`),
          React.createElement('p', { style: text }, `astăzi la ${time}`),
          tv ? React.createElement('div', { style: { fontSize: 13, color: '#374151' } }, `Canale: ${tv}`) : null,
          React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 8 } },
            React.createElement('a', { href: `${site}/sport/${data.slug}`, style: btn }, 'Vezi detalii'),
            React.createElement('a', { href: icsLink('match', data.id), style: { color: '#2563eb', alignSelf: 'center' } }, 'Adaugă în calendar (ICS)')
          )
        )
      ), { pretty: true });
      const subject = `Astăzi: ${data.home} – ${data.away} la ${time}${tv?` • ${tv}`:''}`;
      const textAlt = `${data.home} – ${data.away} la ${time}${tv?` • ${tv}`:''}\n${site}/sport/${data.slug}`;
      return { subject, html, text: textAlt };
    }
    const title = 'FCSB – CFR Cluj';
    const time = 'astăzi la 21:45';
    const html = await renderAsync(layout(
      React.createElement(React.Fragment, null,
        React.createElement('div', { style: { display: 'inline-block', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 999, fontSize: 12 } }, 'Sport'),
        React.createElement('h2', null, title),
        React.createElement('p', { style: text }, time),
        React.createElement('a', { href: `${site}/sport`, style: btn }, 'Vezi detalii')
      )
    ), { pretty: true });
    return { subject: `Astăzi: ${title}`, html, text: `${title}\n${time}\n${site}/sport` };
  }
  if (template === 'ReminderMovie') {
    if (id && kind === 'movie') {
      const { data } = await supabase.from('movie').select('id, title, slug, cinema_release_ro, netflix_date, prime_date, poster_url').eq('id', id).maybeSingle();
      if (!data) throw new Error('not found');
      let label = 'Noutate';
      if (data.cinema_release_ro) label = 'Cinema';
      else if (data.netflix_date) label = 'Netflix';
      else if (data.prime_date) label = 'Prime';
      const html = await renderAsync(layout(
        React.createElement(React.Fragment, null,
          React.createElement('div', { style: { display: 'inline-block', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 999, fontSize: 12 } }, label),
          React.createElement('h2', null, data.title),
          data.poster_url ? React.createElement('img', { src: data.poster_url, alt: `Poster ${data.title}`, width: 120, style: { borderRadius: 8 } }) : null,
          React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 8 } },
            React.createElement('a', { href: `${site}/filme/${data.slug}`, style: btn }, 'Vezi detalii'),
            React.createElement('a', { href: icsLink('movie', data.id), style: { color: '#2563eb', alignSelf: 'center' } }, 'Adaugă în calendar (ICS)')
          ),
          React.createElement('p', { style: { marginTop: 16, color: '#6b7280', fontSize: 12 } }, 'Acest produs folosește API‑ul TMDB, fără a fi aprobat sau certificat de TMDB.')
        )
      ), { pretty: true });
      const subject = `${label === 'Cinema' ? 'De azi în cinema' : label === 'Netflix' ? 'Pe Netflix' : label === 'Prime' ? 'Pe Prime' : 'Noutate'}: ${data.title}`;
      const textAlt = `${data.title}\n${site}/filme/${data.slug}`;
      return { subject, html, text: textAlt };
    }
    const title = 'Film exemplu';
    const html = await renderAsync(layout(
      React.createElement(React.Fragment, null,
        React.createElement('div', { style: { display: 'inline-block', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 999, fontSize: 12 } }, 'Cinema'),
        React.createElement('h2', null, title),
        React.createElement('a', { href: `${site}/filme`, style: btn }, 'Vezi detalii')
      )
    ), { pretty: true });
    return { subject: `De azi în cinema: ${title}`, html, text: `${title}\n${site}/filme` };
  }
  if (template === 'DigestWeekly') {
    const title = 'Săptămâna ta (12–18 aug)';
    const sections = [
      { name: 'Evenimente', items: [{ title: 'Concert', when: 'Mar 20:00', url: `${site}/evenimente/x` }] },
      { name: 'Sport', items: [{ title: 'FCSB – CFR', when: 'Sâm 21:45', url: `${site}/sport/y` }] },
      { name: 'Filme', items: [{ title: 'Movie', when: 'Joi', url: `${site}/filme/z` }] },
    ];
    const html = await renderAsync(layout(
      React.createElement(React.Fragment, null,
        React.createElement('h2', null, title),
        ...sections.map((s) => React.createElement('div', { key: s.name },
          React.createElement('h3', null, s.name),
          React.createElement('ul', null, ...s.items.map((it) => React.createElement('li', { key: it.url }, React.createElement('a', { href: it.url }, it.title), ' — ', it.when)))
        )),
        React.createElement('a', { href: site, style: btn }, 'Vezi mai multe pe CateZile.ro')
      )
    ), { pretty: true });
    return { subject: 'Săptămâna ta pe CateZile.ro (12–18 aug)', html, text: 'Săptămâna ta pe CateZile.ro' };
  }
  if (template === 'TransactionalGeneric') {
    const title = 'Mesaj important';
    const body = 'Aceasta este o notificare tranzacțională.';
    const html = await renderAsync(layout(
      React.createElement(React.Fragment, null,
        React.createElement('h2', null, title),
        React.createElement('p', { style: text }, body)
      )
    ), { pretty: true });
    return { subject: title, html, text: `${title}\n${body}` };
  }
  throw new Error('Unknown template');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    let template = '' as string; let kind: string | undefined; let id: string | undefined; let sample: string | undefined;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      template = url.searchParams.get('template') || '';
      kind = url.searchParams.get('kind') || undefined;
      id = url.searchParams.get('id') || undefined;
      sample = url.searchParams.get('sample') || undefined;
    } else {
      const body = await req.json();
      template = body.template; kind = body.kind; id = body.id; sample = body.sample;
    }

    const out = await buildPayload(supabase, template, kind, id, sample);
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type':'application/json', ...corsHeaders } });
  }
});
