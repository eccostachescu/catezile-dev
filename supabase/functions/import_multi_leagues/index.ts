import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type Provider = "api-football";

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

async function fetchFixturesAPIFootball(baseUrl: string, apiKey: string, leagueId: string, season: number) {
  const url = `${baseUrl.replace(/\/$/, "")}/fixtures?league=${encodeURIComponent(leagueId)}&season=${season}`;
  console.log(`Fetching from: ${url}`);
  
  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey }
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }
  
  const body = await res.json();
  return body.response || [];
}

function seasonFor() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  return month >= 7 ? year : year - 1; // Season starts in July/August
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { 
      global: { headers: { ...Object.fromEntries(req.headers) } } 
    });

    const provider = (Deno.env.get("SPORTS_API_PROVIDER") || "api-football") as Provider;
    const baseUrl = Deno.env.get("SPORTS_API_URL") || "";
    const apiKey = Deno.env.get("SPORTS_API_KEY") || "";

    if (!baseUrl || !apiKey) {
      throw new Error("Missing SPORTS_API_URL or SPORTS_API_KEY");
    }

    console.log('Multi-league import started with provider:', provider);

    // Parse request body for specific league codes or import all
    const requestBody = await req.json().catch(() => ({}));
    const { league_codes, season: seasonBody } = requestBody;
    const season = seasonBody ?? seasonFor();
    
    console.log('Season:', season);
    console.log('League codes requested:', league_codes);

    // Get leagues to import
    let leaguesQuery = supabase
      .from("competition")
      .select("id, code, name, external")
      .not("external", "is", null);
      
    if (league_codes && Array.isArray(league_codes) && league_codes.length > 0) {
      leaguesQuery = leaguesQuery.in("code", league_codes);
    }

    const { data: competitions, error: compError } = await leaguesQuery;
    
    if (compError) throw compError;
    if (!competitions || competitions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No competitions found", imported: 0 }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${competitions.length} competitions to import`);

    const { teamMap, teamIdByAlias, tvMap } = await loadAliasMaps(supabase);
    
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const results = [];

    // Process each competition
    for (const comp of competitions) {
      console.log(`Processing ${comp.code}: ${comp.name}`);
      
      const external = comp.external || {};
      const leagueId = external.league_id;
      
      if (!leagueId) {
        console.log(`Skipping ${comp.code} - no league_id in external config`);
        continue;
      }

      try {
        let fixtures: any[] = [];
        
        if (provider === "api-football") {
          fixtures = await fetchFixturesAPIFootball(baseUrl, apiKey, leagueId, season);
          console.log(`Fetched ${fixtures.length} fixtures for ${comp.name}`);
        }

        let inserted = 0, updated = 0, skipped = 0;
        
        for (const fixture of fixtures) {
          try {
            const fixtureId = fixture.fixture?.id;
            if (!fixtureId) continue;

            const home = normalizeTeam(fixture.teams?.home?.name || "", teamMap);
            const away = normalizeTeam(fixture.teams?.away?.name || "", teamMap);
            const kickoffAt = fixture.fixture?.date;
            const status = fixture.fixture?.status?.short || "SCHEDULED";

            if (!home || !away || !kickoffAt) continue;

            const slug = slugify(`${home}-${away}-${new Date(kickoffAt).toISOString().slice(0, 10)}`);

            // Check if match exists
            const { data: existing } = await supabase
              .from("match")
              .select("id, status, score")
              .eq("competition_id", comp.id)
              .eq("home", home)
              .eq("away", away)
              .eq("kickoff_at", kickoffAt)
              .maybeSingle();

            const matchData = {
              competition_id: comp.id,
              home,
              away,
              kickoff_at: kickoffAt,
              status,
              slug,
              score: {
                home: fixture.goals?.home || null,
                away: fixture.goals?.away || null,
                elapsed: fixture.fixture?.status?.elapsed || null
              }
            };

            if (existing) {
              // Update existing match
              const { error: updateError } = await supabase
                .from("match")
                .update(matchData)
                .eq("id", existing.id);

              if (updateError) {
                console.error(`Error updating match ${existing.id}:`, updateError);
              } else {
                updated++;
              }
            } else {
              // Insert new match
              const { error: insertError } = await supabase
                .from("match")
                .insert(matchData);

              if (insertError) {
                console.error(`Error inserting match:`, insertError);
              } else {
                inserted++;
              }
            }
          } catch (matchError) {
            console.error(`Error processing fixture:`, matchError);
            skipped++;
          }
        }

        const compResult = {
          competition: comp.code,
          name: comp.name,
          fixtures_fetched: fixtures.length,
          inserted,
          updated,
          skipped
        };
        
        results.push(compResult);
        totalImported += inserted;
        totalUpdated += updated;
        totalSkipped += skipped;
        
        console.log(`${comp.code}: inserted=${inserted}, updated=${updated}, skipped=${skipped}`);
        
      } catch (compError) {
        console.error(`Error processing competition ${comp.code}:`, compError);
        results.push({
          competition: comp.code,
          name: comp.name,
          error: compError.message,
          inserted: 0,
          updated: 0,
          skipped: 0
        });
      }
    }

    console.log(`Multi-league import completed. Total: inserted=${totalImported}, updated=${totalUpdated}, skipped=${totalSkipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_imported: totalImported,
        total_updated: totalUpdated,
        total_skipped: totalSkipped,
        competitions_processed: competitions.length,
        results
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Multi-league import error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});