// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple OG image edge function stub. For now, redirects to placeholder.svg
Deno.serve(async (req: Request) => {
  const { method } = req;
  if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') ?? 'CateZile.ro';
    const origin = url.origin;

    // Return a simple SVG as OG (social scrapers may still render). In production, generate PNG.
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D946EF"/>
      <stop offset="55%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="60" y="320" font-size="72" fill="#fff" font-family="Inter, Arial, sans-serif">${title}</text>
  <text x="60" y="400" font-size="36" fill="#fff" opacity="0.85">catezile.ro</text>
</svg>`;

    return new Response(svg, { headers: { ...corsHeaders, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
