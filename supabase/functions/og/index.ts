import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import React from "https://esm.sh/react@18.3.1";
import satori, { init as satoriInit } from "https://esm.sh/satori@0.10.13/wasm";
import initYoga from "https://esm.sh/yoga-wasm-web@0.3.3";
import initSvg2Png, { svg2png } from "https://esm.sh/svg2png-wasm@1.4.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { buildBase } from "./templates/base.tsx";
import { EventTemplate } from "./templates/event.tsx";
import { MatchTemplate } from "./templates/match.tsx";
import { MovieTemplate } from "./templates/movie.tsx";
import { BfTemplate } from "./templates/bf.tsx";
import { THEMES } from "../og/theme.ts";
import { corsHeaders, etagFor, formatRoDate, getFont, imageToDataURL, okDimensions, pick } from "./utils.ts";

let yogaReady: Promise<void> | null = null;
async function ensureYoga() {
  if (!yogaReady) {
    yogaReady = (async () => {
      const res = await fetch("https://esm.sh/yoga-wasm-web@0.3.3/dist/yoga.wasm");
      const wasm = new Uint8Array(await res.arrayBuffer());
      const yoga = await (initYoga as unknown as (wasm: Uint8Array) => Promise<any>)(wasm);
      satoriInit(yoga);
    })();
  }
  await yogaReady;
}

let s2pReady: Promise<void> | null = null;
async function ensureSvg2png() {
  if (!s2pReady) {
    s2pReady = initSvg2Png(fetch('https://unpkg.com/svg2png-wasm@1.4.1/svg2png_wasm_bg.wasm'));
  }
  await s2pReady;
}

const schema = z.object({
  type: z.enum(["event","match","movie","bf"]).default("event"),
  slug: z.string().optional(),
  id: z.string().optional(),
  merchant: z.string().optional(),
  theme: z.enum(["T1","T2","T3"]).optional(),
  title: z.string().optional(),
  w: z.coerce.number().optional(),
  h: z.coerce.number().optional(),
  v: z.string().optional(),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false, autoRefreshToken: false } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const params = schema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!params.success) {
      return new Response(JSON.stringify({ error: "Invalid params", issues: params.error.issues }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    const q = params.data;

    const width = q.w ?? 1200;
    const height = q.h ?? 630;
    if (!okDimensions(width, height)) {
      return new Response(JSON.stringify({ error: "Invalid dimensions" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // Fetch DB data (tolerant; if missing, we’ll still render generic)
    let payload: any = null;
    if (q.type === "event" && q.slug) {
      const { data } = await supabase
        .from("event")
        .select("title,start_at,timezone,city,image_url,category_id,seo_h1,updated_at")
        .eq("slug", q.slug)
        .maybeSingle();
      payload = data;
    } else if (q.type === "match" && q.id) {
      const { data } = await supabase
        .from("match")
        .select("home,away,kickoff_at,stadium,city,tv_channels,is_derby,competition_id,updated_at")
        .eq("id", q.id)
        .maybeSingle();
      payload = data;
    } else if (q.type === "movie" && q.id) {
      const { data } = await supabase
        .from("movie")
        .select("title,poster_url,cinema_release_ro,netflix_date,prime_date,updated_at")
        .eq("id", q.id)
        .maybeSingle();
      payload = data;
    } else if (q.type === "bf") {
      payload = { merchant: q.merchant ?? "Black Friday", updated_at: new Date().toISOString() };
    }

    // Choose theme
    let themeKey = q.theme || (q.type === "bf" ? "T3" : "T2");
    if (q.type === "match" && payload?.is_derby) themeKey = "T3";
    const theme = THEMES[themeKey as keyof typeof THEMES];

    await ensureYoga();

    // Fonts (cached)
    const interReg = await getFont("Inter-Regular.woff");
    const interBold = await getFont("Inter-Bold.woff");
    const dmSansBold = await getFont("DMSans-Bold.woff");

    const base = buildBase({ theme, width, height });
    let content: React.ReactNode = null;

    if (q.type === "event") {
      const title = payload?.seo_h1 || payload?.title || q.title || "Eveniment";
      const subtitle = [
        formatRoDate(payload?.start_at ?? null, true),
        payload?.city,
      ].filter(Boolean).join(" · ");
      content = React.createElement(EventTemplate, {
        title,
        subtitle: subtitle || undefined,
        badge: payload?.category_id ? "Eveniment" : undefined,
        imageDataURL: await imageToDataURL(payload?.image_url),
      });
    } else if (q.type === "match") {
      const title = `${payload?.home ?? ''} vs ${payload?.away ?? ''}`.trim() || q.title || "Meci";
      const subtitle = [
        formatRoDate(payload?.kickoff_at ?? null, true),
        payload?.stadium || payload?.city,
      ].filter(Boolean).join(" · ");
      content = React.createElement(MatchTemplate, {
        title,
        subtitle: subtitle || undefined,
        derby: !!payload?.is_derby,
        tv: (payload?.tv_channels ?? []).slice(0,3),
      });
    } else if (q.type === "movie") {
      const title = payload?.title || q.title || "Film";
      content = React.createElement(MovieTemplate, {
        title,
        cinema: payload?.cinema_release_ro ? formatRoDate(payload.cinema_release_ro, false) : undefined,
        netflix: payload?.netflix_date ? formatRoDate(payload.netflix_date, false) : undefined,
        prime: payload?.prime_date ? formatRoDate(payload.prime_date, false) : undefined,
        posterDataURL: await imageToDataURL(payload?.poster_url),
      });
    } else if (q.type === "bf") {
      content = React.createElement(BfTemplate, {
        year: new Date().getFullYear(),
        merchant: payload?.merchant ?? "Black Friday",
        subtitle: "Luna noiembrie",
      });
    }

    // Fallback content if not built above
    if (!content) {
      content = React.createElement(EventTemplate, { title: q.title || "CateZile.ro", subtitle: undefined });
    }

    const svg = await satori(React.createElement(base, { theme }, content), {
      width, height,
      fonts: [
        { name: "Inter", data: interReg, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "DM Sans", data: dmSansBold, weight: 700, style: "normal" },
      ],
    });

    await ensureSvg2png();
    const png = await svg2png(svg, { width, height });

    const tag = await etagFor(JSON.stringify({
      q: pick(q as any, ["type","slug","id","merchant","theme","w","h","v","title"] as any),
      u: (payload && (payload.updated_at || null)) || null,
      theme: themeKey,
    }));

    if (req.headers.get("if-none-match") === tag) {
      return new Response(null, { status: 304, headers: { ...corsHeaders, ETag: tag, "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } });
    }

    return new Response(png, { headers: { ...corsHeaders, ETag: tag, "cache-control": "public, max-age=86400, stale-while-revalidate=604800", "content-type": "image/png" } });
  } catch (err) {
    console.error("OG error", err);
    const message = "OG error";
    const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'><rect width='100%' height='100%' fill='#111'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#fff' font-family='Arial' font-size='32'>${message}</text></svg>`;
    await ensureSvg2png();
    const png = await svg2png(fallbackSvg, { width: 800, height: 420 });
    return new Response(png, { status: 500, headers: { ...corsHeaders, "content-type": "image/png" } });
  }
});
