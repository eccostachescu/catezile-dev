import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SITE_URL = Deno.env.get("SITE_URL") ?? "https://catezile.ro";
    const CRON_SECRET = Deno.env.get("ADMIN_CRON_SECRET");

    if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      // no body provided, that's fine
    }

    const sitemap = body?.sitemapUrl || `${SITE_URL}/sitemap.xml`;

    const targets = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    ];

    const results = await Promise.all(
      targets.map(async (url) => {
        try {
          const res = await fetch(url, { method: "GET" });
          const text = await res.text();
          return { url, status: res.status, ok: res.ok, body: text.slice(0, 500) };
        } catch (e) {
          return { url, status: 0, ok: false, error: String(e) };
        }
      })
    );

    return new Response(JSON.stringify({ sitemap, results }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("ping_sitemaps error", e);
    return new Response(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
