import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SITE_URL = Deno.env.get("SITE_URL") ?? "https://catezile.ro";
    const INDEXNOW_KEY = Deno.env.get("INDEXNOW_KEY");
    const CRON_SECRET = Deno.env.get("ADMIN_CRON_SECRET");

    if (!INDEXNOW_KEY) {
      return new Response(JSON.stringify({ error: "INDEXNOW_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST with { urls: string[] }" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { urls } = await req.json().catch(() => ({ urls: [] }));
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "Body must include non-empty 'urls' array" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const host = new URL(SITE_URL).host;
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: urls,
    };

    const upstream = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();

    return new Response(
      JSON.stringify({ ok: upstream.ok, status: upstream.status, keyLocation, host, count: urls.length, response: text.slice(0, 1000) }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("indexnow_submit error", e);
    return new Response(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
