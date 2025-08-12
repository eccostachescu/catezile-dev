import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const SITE_URL = "https://catezile.ro";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function iso(dt?: string | Date | null) {
  const d = dt ? new Date(dt) : new Date();
  return d.toISOString();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: chunks, error } = await supabase
      .from("sitemap_chunk")
      .select("section, chunk_no, last_built_at")
      .order("section")
      .order("chunk_no");
    if (error) console.warn("sitemap_index: sitemap_chunk read error", error.message);

    type Entry = { loc: string; lastmod: string };
    const entries: Entry[] = [];

    if (chunks && chunks.length > 0) {
      for (const c of chunks) {
        const chunkStr = String(c.chunk_no).padStart(5, "0");
        const loc = `${SITE_URL}/sitemaps/sitemap-${c.section}-${chunkStr}.xml.gz`;
        entries.push({ loc, lastmod: iso(c.last_built_at) });
      }
    } else {
      // Fallback to existing static category sitemaps if DB has no chunks yet
      ["sarbatori", "examene", "festivaluri"].forEach((slug) => {
        entries.push({ loc: `${SITE_URL}/sitemaps/sitemap-${slug}.xml`, lastmod: iso() });
      });
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map((e) =>
        [
          "  <sitemap>",
          `    <loc>${e.loc}</loc>`,
          `    <lastmod>${e.lastmod}</lastmod>`,
          "  </sitemap>",
        ].join("\n")
      ),
      "</sitemapindex>",
    ].join("\n");

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error("sitemap_index error", e);
    return new Response("Internal Error", { status: 500, headers: corsHeaders });
  }
});
