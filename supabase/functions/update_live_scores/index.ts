import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function norm(s: string) {
  return s
    .normalize("NFD").replace(/\p{Diacritic}+/gu, "")
    .toLowerCase().replace(/\s+/g, " ")
    .replace(/ş|ș/gi, "s").replace(/ţ|ț/gi, "t");
}

const statusMap: Record<string, "SCHEDULED" | "LIVE" | "FINISHED"> = {
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

function withinWindow(kickoffIso: string, hoursBack = 2, hoursFwd = 6) {
  const now = Date.now();
  const t = new Date(kickoffIso).getTime();
  return t >= now - hoursBack * 3600_000 && t <= now + hoursFwd * 3600_000;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    const provider = (Deno.env.get("SPORTS_API_PROVIDER") || "api-football").toLowerCase();
    const baseUrl = Deno.env.get("SPORTS_API_URL") || "";
    const apiKey = Deno.env.get("SPORTS_API_KEY") || "";
    const leagueId = Deno.env.get("LIGA1_PROVIDER_LEAGUE_ID") || "";
    const code = Deno.env.get("LIGA1_COMPETITION_CODE") || "RO-L1";

    const { window_hours } = await req.json().catch(() => ({ window_hours: 4 }));
    const hours = Number(window_hours) || 4;

    // Resolve competition id
    const { data: comp } = await supabase.from("competition").select("id").eq("code", code).maybeSingle();
    if (!comp) return new Response(JSON.stringify({ updated_live: 0, finished: 0 }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // Find matches in window
    const nowIso = new Date(Date.now() - 2 * 3600_000).toISOString();
    const plusIso = new Date(Date.now() + 6 * 3600_000).toISOString();
    const { data: matches } = await supabase
      .from("match")
      .select("id,home,away,kickoff_at,status,score")
      .eq("competition_id", comp.id)
      .in("status", ["SCHEDULED", "LIVE"])
      .gte("kickoff_at", nowIso)
      .lte("kickoff_at", plusIso);

    if (!matches || matches.length === 0) {
      return new Response(JSON.stringify({ updated_live: 0, finished: 0 }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Fetch provider data (api-football by date)
    let providerFixtures: any[] = [];
    if (provider === "api-football") {
      if (!baseUrl || !apiKey || !leagueId) throw new Error("Missing SPORTS_API_URL/KEY or LIGA1_PROVIDER_LEAGUE_ID");
      const days = new Set(matches.map((m: any) => new Date(m.kickoff_at).toISOString().slice(0, 10)));
      for (const d of days) {
        const url = `${baseUrl.replace(/\/$/, "")}/fixtures?league=${encodeURIComponent(leagueId)}&date=${d}`;
        const res = await fetch(url, { headers: { "x-apisports-key": apiKey } });
        if (res.ok) {
          const body = await res.json();
          (body.response || []).forEach((x: any) => providerFixtures.push(x));
        }
      }
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    let updated_live = 0, finished = 0, changedUpcoming = 0;
    const now = new Date();
    const plus24 = new Date(now.getTime() + 24 * 3600_000);

    // Build quick search index from provider by names+minute date proximity
    function findProviderFixture(home: string, away: string, kickoff: string) {
      const targetDay = kickoff.slice(0, 10);
      const nh = norm(home), na = norm(away);
      return providerFixtures.find((f: any) => {
        const fx = f.fixture || f;
        const tm = f.teams || {};
        const day = String(fx.date || "").slice(0, 10);
        if (day !== targetDay) return false;
        return norm(tm.home?.name || "") === nh && norm(tm.away?.name || "") === na;
      });
    }

    for (const m of matches) {
      if (!withinWindow(m.kickoff_at, 2, 6)) continue;
      const pf = findProviderFixture(m.home, m.away, m.kickoff_at);
      if (!pf) continue;
      const fx = pf.fixture || pf;
      const goals = pf.goals || {};
      const score = pf.score || {};
      const st = statusMap[String(fx.status?.short || "NS").toUpperCase()] || "SCHEDULED";
      const nextScore: any = {
        home: { ht: score?.halftime?.home ?? null, ft: goals?.home ?? null },
        away: { ht: score?.halftime?.away ?? null, ft: goals?.away ?? null },
      };
      const minute = fx.status?.elapsed ?? null;
      if (minute != null) nextScore.minute = minute;

      const upd: any = {};
      if (m.status !== st) upd.status = st;
      if (JSON.stringify(m.score || {}) !== JSON.stringify(nextScore)) upd.score = nextScore;

      if (Object.keys(upd).length) {
        const r = await supabase.from("match").update(upd).eq("id", m.id).select("kickoff_at,status").maybeSingle();
        if (!r.error) {
          if (upd.status === "LIVE") updated_live++;
          if (upd.status === "FINISHED") finished++;
          const ko = new Date(r.data!.kickoff_at);
          if (ko <= plus24) changedUpcoming++;
        }
      }
    }

    // log
    await supabase.from("ingestion_log").insert({ source: "liga1-live", status: "OK", rows: updated_live + finished, message: JSON.stringify({ updated_live, finished }) }).then(() => {});

    if (changedUpcoming > 0) {
      try {
        const url = `${supabaseUrl}/functions/v1/rebuild_hook`;
        await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` }, body: JSON.stringify({ scope: "sport" }) }).catch(() => {});
      } catch {}
    }

    return new Response(JSON.stringify({ updated_live, finished }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);
      await supabase.from("ingestion_log").insert({ source: "liga1-live", status: "ERROR", message: e?.message || String(e) }).then(() => {});
    } catch {}
    return new Response(JSON.stringify({ error: e?.message || "Eroare" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
