import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type Provider = "api-football" | "football-data" | "sportmonks" | "custom";

function stripDiacritics(s: string) {
  return s
    .normalize("NFD").replace(/\p{Diacritic}+/gu, "")
    .replace(/ş|ș/gi, "s").replace(/ţ|ț/gi, "t");
}

function slugify(txt: string) {
  const s = stripDiacritics(txt.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s;
}

function normBase(s: string) {
  return stripDiacritics(s.trim().toLowerCase().replace(/\s+/g, " "))
    .replace(/primasport/g, "prima sport")
    .replace(/orangesport/g, "orange sport")
    .replace(/\barena\b/g, "pro arena");
}

async function loadAliasMaps(supabase: any) {
  const [teams, tv] = await Promise.all([
    supabase.from("team_alias").select("alias,canonical"),
    supabase.from("tv_channel_alias").select("alias,canonical,priority"),
  ]);
  const teamMap = new Map<string, string>();
  (teams.data || []).forEach((r: any) => teamMap.set(String(r.alias).toLowerCase(), r.canonical));
  const tvMap = new Map<string, { canonical: string; priority: number }>();
  (tv.data || []).forEach((r: any) => tvMap.set(String(r.alias).toLowerCase(), { canonical: r.canonical, priority: r.priority ?? 0 }));
  return { teamMap, tvMap };
}

function normalizeTeam(name: string, teamMap: Map<string, string>) {
  const key = normBase(name);
  return teamMap.get(key) || name;
}

function normalizeTvChannels(raw: string[] | null | undefined, tvMap: Map<string, { canonical: string; priority: number }>) {
  if (!raw || raw.length === 0) return [] as string[];
  const mapped = raw
    .map((c) => normBase(c))
    .map((alias) => tvMap.get(alias) || { canonical: alias, priority: 0 });
  const byCanon = new Map<string, number>();
  for (const m of mapped) {
    const prev = byCanon.get(m.canonical) ?? -Infinity;
    if (m.priority > prev) byCanon.set(m.canonical, m.priority);
  }
  return Array.from(byCanon.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);
}

function seasonFor(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1; // 1-12
  // Liga 1 sezonul începe vara; dacă e până în iunie, sezonul curent e (y-1)
  return m < 7 ? y - 1 : y;
}

const statusMapApiFootball: Record<string, "SCHEDULED" | "LIVE" | "FINISHED"> = {
  NS: "SCHEDULED",
  PST: "SCHEDULED",
  CANC: "SCHEDULED",
  ABD: "SCHEDULED",
  TBA: "SCHEDULED",
  "1H": "LIVE",
  HT: "LIVE",
  "2H": "LIVE",
  ET: "LIVE",
  BT: "LIVE",
  P: "LIVE",
  SUSP: "LIVE",
  INT: "LIVE",
  FT: "FINISHED",
  AET: "FINISHED",
  PEN: "FINISHED",
};

const DERBY_PAIRS = new Set([
  "fcsb|dinamo bucuresti",
  "cfr cluj|u cluj",
  "universitatea craiova|fc u craiova 1948",
  "rapid bucuresti|dinamo bucuresti",
  "farul constanta|universitatea craiova",
]);

function isDerby(home: string, away: string) {
  const k = `${normBase(home)}|${normBase(away)}`;
  const k2 = `${normBase(away)}|${normBase(home)}`;
  return DERBY_PAIRS.has(k) || DERBY_PAIRS.has(k2);
}

function parseIsoToUtcString(s: string): string {
  const d = new Date(s);
  return new Date(d.getTime()).toISOString();
}

async function fetchFixturesAPIFootball(baseUrl: string, apiKey: string, leagueId: string, year: number) {
  const url = `${baseUrl.replace(/\/$/, "")}/fixtures?league=${encodeURIComponent(leagueId)}&season=${year}`;
  const res = await fetch(url, { headers: { "x-apisports-key": apiKey } });
  if (!res.ok) throw new Error(`API-Football failed ${res.status}`);
  const body = await res.json();
  // Expect body.response[]
  return (body.response || []) as any[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    const provider = (Deno.env.get("SPORTS_API_PROVIDER") || "api-football") as Provider;
    const baseUrl = Deno.env.get("SPORTS_API_URL") || "";
    const apiKey = Deno.env.get("SPORTS_API_KEY") || "";
    const leagueId = Deno.env.get("LIGA1_PROVIDER_LEAGUE_ID") || "";

    const { season: seasonBody } = await req.json().catch(() => ({ season: undefined as number | undefined }));
    const season = seasonBody ?? seasonFor();

    // Optional simple secret for cron
    const cronSecret = Deno.env.get("SPORTS_WEBHOOK_SECRET");
    if (req.method === "GET" && cronSecret) {
      const hdr = req.headers.get("x-cron-secret");
      if (hdr !== cronSecret) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Ensure competition exists
    const code = Deno.env.get("LIGA1_COMPETITION_CODE") || "RO-L1";
    const compUp = await supabase
      .from("competition")
      .upsert({ code, name: "SuperLiga", season, external: { provider, league_id: leagueId } }, { onConflict: "code" })
      .select("id")
      .maybeSingle();
    if (compUp.error) throw compUp.error;
    const competitionId = compUp.data!.id as string;

    const { teamMap, tvMap } = await loadAliasMaps(supabase);

    let fixtures: any[] = [];
    if (provider === "api-football") {
      if (!baseUrl || !apiKey || !leagueId) throw new Error("Missing SPORTS_API_URL/KEY or LIGA1_PROVIDER_LEAGUE_ID");
      fixtures = await fetchFixturesAPIFootball(baseUrl, apiKey, leagueId, season);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    let inserted = 0, updated = 0, skipped = 0, changedUpcoming = 0;
    const now = new Date();
    const plus7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const f of fixtures) {
      // API-Football mapping
      const fx = f.fixture || f;
      const lg = f.league || {};
      const teams = f.teams || {};
      const goals = f.goals || {};
      const score = f.score || {};
      const broadcasts = (f.broadcasts ?? f.tv ?? []) as Array<{ network?: string; channel?: string }> | string[];

      const kickoffIso = parseIsoToUtcString(fx.date);
      const homeName = normalizeTeam(teams.home?.name || "Home", teamMap);
      const awayName = normalizeTeam(teams.away?.name || "Away", teamMap);
      const tvRaw = Array.isArray(broadcasts)
        ? broadcasts.map((b: any) => (typeof b === "string" ? b : (b?.network || b?.channel || "")).trim()).filter(Boolean)
        : [] as string[];
      const tv_channels = normalizeTvChannels(tvRaw, tvMap);
      const st = statusMapApiFootball[String(fx.status?.short || "NS").toUpperCase()] || "SCHEDULED";

      const scoreJson: any = {
        home: { ht: score?.halftime?.home ?? null, ft: goals?.home ?? null },
        away: { ht: score?.halftime?.away ?? null, ft: goals?.away ?? null },
      };
      const minute = fx.status?.elapsed ?? null;
      if (minute != null) scoreJson.minute = minute;

      // Dedup lookup: same day + names
      const dayStart = new Date(kickoffIso);
      dayStart.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const { data: sameDay } = await supabase
        .from("match")
        .select("id, home, away, kickoff_at, status, score, is_derby, tv_channels")
        .eq("competition_id", competitionId)
        .gte("kickoff_at", dayStart.toISOString())
        .lt("kickoff_at", nextDay.toISOString());
      const existing = (sameDay || []).find((m: any) => normBase(m.home) === normBase(homeName) && normBase(m.away) === normBase(awayName));

      // Compute fields
      const baseRow: any = {
        competition_id: competitionId,
        home: homeName,
        away: awayName,
        kickoff_at: kickoffIso,
        stadium: fx.venue?.name || null,
        city: fx.venue?.city || null,
        status: st,
        score: scoreJson,
        tv_channels,
        slug: slugify(`${homeName}-${awayName}-${kickoffIso.slice(0, 16).replace(/[:T]/g, "")}`),
      };

      if (!existing) {
        const ins = await supabase.from("match").insert(baseRow).select("id,kickoff_at").maybeSingle();
        if (!ins.error) {
          inserted++;
          const ko = new Date(ins.data!.kickoff_at);
          if (ko >= now && ko <= plus7) changedUpcoming++;
        }
        continue;
      }

      // Build update diff
      const update: any = {};
      if (existing.status !== st) update.status = st;
      // Merge score (preserve FT when FINISHED)
      const prevScore = existing.score || {};
      if (st !== existing.status || JSON.stringify(prevScore) !== JSON.stringify(scoreJson)) {
        if (st === "FINISHED") {
          // lock FT
          update.score = { ...(prevScore || {}), ...scoreJson, home: { ...scoreJson.home }, away: { ...scoreJson.away } };
        } else {
          update.score = scoreJson;
        }
      }
      if (tv_channels.length) update.tv_channels = tv_channels;
      if (!existing.is_derby && isDerby(homeName, awayName)) update.is_derby = true;
      if (fx.venue?.name && fx.venue?.name !== existing.stadium) update.stadium = fx.venue?.name;
      if (fx.venue?.city && fx.venue?.city !== existing.city) update.city = fx.venue?.city;

      if (Object.keys(update).length) {
        const upd = await supabase.from("match").update(update).eq("id", existing.id).select("kickoff_at").maybeSingle();
        if (!upd.error) {
          updated++;
          const ko = new Date(upd.data!.kickoff_at);
          if (ko >= now && ko <= plus7) changedUpcoming++;
        }
      } else {
        skipped++;
      }
    }

    // Log
    await supabase.from("ingestion_log").insert({ source: "liga1-fixtures", status: "OK", rows: inserted + updated, message: JSON.stringify({ inserted, updated, skipped, season }) }).then(() => {});

    // Trigger rebuild if needed (best-effort)
    if (changedUpcoming > 0) {
      try {
        const url = `${supabaseUrl}/functions/v1/rebuild_hook`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({ scope: "sport" }),
        }).catch(() => {});
      } catch {}
    }

    return new Response(JSON.stringify({ inserted, updated, skipped, season }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);
      await supabase.from("ingestion_log").insert({ source: "liga1-fixtures", status: "ERROR", message: e?.message || String(e) }).then(() => {});
    } catch {}
    return new Response(JSON.stringify({ error: e?.message || "Eroare" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
