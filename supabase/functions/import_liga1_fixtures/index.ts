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
    supabase.from("team_alias").select("alias,canonical,team_id"),
    supabase.from("tv_channel_alias").select("alias,canonical,priority"),
  ]);
  const teamMap = new Map<string, string>();
  const teamIdByAlias = new Map<string, string>();
  (teams.data || []).forEach((r: any) => {
    const key = String(r.alias).toLowerCase();
    if (r.canonical) teamMap.set(key, r.canonical);
    if (r.team_id) teamIdByAlias.set(key, r.team_id);
  });
  const tvMap = new Map<string, { canonical: string; priority: number }>();
  (tv.data || []).forEach((r: any) => tvMap.set(String(r.alias).toLowerCase(), { canonical: r.canonical, priority: r.priority ?? 0 }));
  return { teamMap, teamIdByAlias, tvMap };
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

async function getOrCreateTeamId(
  supabase: any,
  name: string,
  teamMap: Map<string, string>,
  teamIdByAlias: Map<string, string>
): Promise<string> {
  const aliasKey = normBase(name);
  const existing = teamIdByAlias.get(aliasKey);
  if (existing) return existing;
  const canonicalName = teamMap.get(aliasKey) || name;
  const slug = slugify(canonicalName);
  const up = await supabase
    .from("team")
    .upsert({ slug, name: canonicalName }, { onConflict: "slug" })
    .select("id")
    .maybeSingle();
  if (up.error) throw up.error;
  const teamId = up.data!.id as string;
  await supabase
    .from("team_alias")
    .upsert({ alias: aliasKey, canonical: canonicalName, team_id: teamId }, { onConflict: "alias" })
    .then(() => {});
  teamIdByAlias.set(aliasKey, teamId);
  if (!teamMap.has(aliasKey)) teamMap.set(aliasKey, canonicalName);
  return teamId;
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

async function loadDerbies(supabase: any) {
  const { data } = await supabase
    .from("derby")
    .select("team_a_id, team_b_id, team_a, team_b");
  const set = new Set<string>();
  (data || []).forEach((d: any) => {
    if (d.team_a_id && d.team_b_id) {
      set.add(`${d.team_a_id}|${d.team_b_id}`);
      set.add(`${d.team_b_id}|${d.team_a_id}`);
    }
  });
  return set;
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

    console.log('Sports API config:', { provider, hasBaseUrl: !!baseUrl, hasApiKey: !!apiKey, leagueId });

    const { season: seasonBody } = await req.json().catch(() => ({ season: undefined as number | undefined }));
    const season = seasonBody ?? seasonFor();
    console.log('Season:', season);

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

    const { teamMap, teamIdByAlias, tvMap } = await loadAliasMaps(supabase);
    const derbyPairsId = await loadDerbies(supabase);

    let fixtures: any[] = [];
    if (provider === "api-football") {
      if (!baseUrl || !apiKey || !leagueId) throw new Error("Missing SPORTS_API_URL/KEY or LIGA1_PROVIDER_LEAGUE_ID");
      console.log('Fetching fixtures from API-Football...');
      console.log(`URL: ${baseUrl}/fixtures?league=${leagueId}&season=${season}`);
      console.log(`Headers: x-apisports-key present: ${!!apiKey}`);

      try {
        fixtures = await fetchFixturesAPIFootball(baseUrl, apiKey, leagueId, season);
        console.log(`API Response: ${fixtures.length} fixtures fetched`);
        
        // Debug first fixture
        if (fixtures.length > 0) {
          console.log('First fixture sample:', JSON.stringify(fixtures[0], null, 2));
        } else {
          // Try different league IDs for Romanian Liga 1
          const alternativeLeagueIds = ['283', '384', '288']; // Different possible IDs
          
          for (const altId of alternativeLeagueIds) {
            console.log(`Trying alternative league ID: ${altId}`);
            try {
              const altFixtures = await fetchFixturesAPIFootball(baseUrl, apiKey, altId, season);
              if (altFixtures.length > 0) {
                console.log(`SUCCESS with league ID ${altId}: ${altFixtures.length} fixtures`);
                fixtures = altFixtures;
                break;
              }
            } catch (altError) {
              console.log(`Failed with league ID ${altId}:`, altError.message);
            }
          }
          
          // Try current season and previous season
          if (fixtures.length === 0) {
            const currentYear = new Date().getFullYear();
            const seasonsToTry = [currentYear, currentYear - 1, currentYear + 1];
            
            for (const tryYear of seasonsToTry) {
              console.log(`Trying season: ${tryYear}`);
              try {
                const seasonFixtures = await fetchFixturesAPIFootball(baseUrl, apiKey, leagueId, tryYear);
                if (seasonFixtures.length > 0) {
                  console.log(`SUCCESS with season ${tryYear}: ${seasonFixtures.length} fixtures`);
                  fixtures = seasonFixtures;
                  break;
                }
              } catch (seasonError) {
                console.log(`Failed with season ${tryYear}:`, seasonError.message);
              }
            }
          }
        }
      } catch (fetchError) {
        console.error('API-Football fetch error:', fetchError);
        
        // Try to get available leagues to debug
        try {
          const leaguesUrl = `${baseUrl.replace(/\/$/, "")}/leagues?country=Romania`;
          const leaguesRes = await fetch(leaguesUrl, { headers: { "x-apisports-key": apiKey } });
          if (leaguesRes.ok) {
            const leaguesData = await leaguesRes.json();
            console.log('Available Romanian leagues:', JSON.stringify(leaguesData.response, null, 2));
          }
        } catch (debugError) {
          console.log('Could not fetch available leagues for debugging');
        }
        
        throw fetchError;
      }
      console.log(`Fetched ${fixtures?.length || 0} fixtures from API`);
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
      const homeId = await getOrCreateTeamId(supabase, homeName, teamMap, teamIdByAlias);
      const awayId = await getOrCreateTeamId(supabase, awayName, teamMap, teamIdByAlias);
      const derbyByIds = derbyPairsId.has(`${homeId}|${awayId}`);
      const tvCandidates = (Array.isArray(broadcasts) ? broadcasts : [])
        .map((b: any) => (typeof b === "string" ? b : (b?.network ?? b?.name ?? b?.channel ?? "")))
        .map((s: any) => String(s).trim())
        .filter(Boolean);
      const tv_channels = normalizeTvChannels(tvCandidates, tvMap);
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
        home_id: homeId,
        away_id: awayId,
        kickoff_at: kickoffIso,
        stadium: fx.venue?.name || null,
        city: fx.venue?.city || null,
        status: st,
        score: scoreJson,
        tv_channels,
        is_derby: derbyByIds || isDerby(homeName, awayName),
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
      if (!existing.is_derby && (derbyByIds || isDerby(homeName, awayName))) update.is_derby = true;
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

    return new Response(JSON.stringify({ 
      inserted, 
      updated, 
      skipped, 
      season,
      debug: {
        provider,
        hasBaseUrl: !!baseUrl,
        hasApiKey: !!apiKey,
        leagueId,
        fixturesCount: fixtures.length
      }
    }), {
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
