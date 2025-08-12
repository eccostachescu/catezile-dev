import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminSport() {
  const { toast } = useToast();
  const [teamAliases, setTeamAliases] = useState<Array<{ alias: string; canonical: string }>>([]);
  const [tvAliases, setTvAliases] = useState<Array<{ alias: string; canonical: string; priority: number }>>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [t, tv, mt] = await Promise.all([
      supabase.from("team_alias").select("alias,canonical").order("alias", { ascending: true }),
      supabase.from("tv_channel_alias").select("alias,canonical,priority").order("priority", { ascending: false }),
      supabase.from("match").select("id,home,away,kickoff_at,is_derby,tv_channels").order("kickoff_at", { ascending: true }).limit(30),
    ]);
    setTeamAliases(t.data || []);
    setTvAliases(tv.data || []);
    setMatches(mt.data || []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function addTeamAlias(alias: string, canonical: string) {
    const r = await supabase.from("team_alias").insert({ alias, canonical });
    if (r.error) return toast({ title: "Eroare", description: r.error.message, variant: "destructive" });
    toast({ title: "Salvat" });
    loadAll();
  }
  async function addTvAlias(alias: string, canonical: string, priority = 0) {
    const r = await supabase.from("tv_channel_alias").insert({ alias, canonical, priority });
    if (r.error) return toast({ title: "Eroare", description: r.error.message, variant: "destructive" });
    toast({ title: "Salvat" });
    loadAll();
  }
  async function removeAlias(table: string, alias: string) {
    const r = await supabase.from(table).delete().eq("alias", alias);
    if (r.error) return toast({ title: "Eroare", description: r.error.message, variant: "destructive" });
    toast({ title: "Șters" });
    loadAll();
  }

  async function saveMatch(m: any) {
    const r = await supabase.from("match").update({ is_derby: !!m.is_derby, tv_channels: m.tv_channels || [] }).eq("id", m.id);
    if (r.error) return toast({ title: "Eroare", description: r.error.message, variant: "destructive" });
    toast({ title: "Match salvat" });
  }

  async function runImport() {
    const r = await supabase.functions.invoke("import_liga1_fixtures", { body: {} });
    if ((r as any).error) toast({ title: "Eroare import", description: (r as any).error.message, variant: "destructive" });
    else toast({ title: "Import rulat", description: JSON.stringify(r.data) });
    loadAll();
  }
  async function runLiveUpdate() {
    const r = await supabase.functions.invoke("update_live_scores", { body: {} });
    if ((r as any).error) toast({ title: "Eroare live", description: (r as any).error.message, variant: "destructive" });
    else toast({ title: "Live update", description: JSON.stringify(r.data) });
    loadAll();
  }

  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Admin Sport</h1>
          <div className="flex gap-2">
            <Button onClick={runImport} disabled={loading}>Rulează import</Button>
            <Button variant="outline" onClick={runLiveUpdate} disabled={loading}>Update scoruri</Button>
          </div>
        </div>
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Meciuri</TabsTrigger>
            <TabsTrigger value="aliases">Aliasuri</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-4">
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="rounded-md border p-3 flex items-center gap-3">
                  <div className="min-w-0 grow">
                    <div className="font-medium truncate">{m.home} – {m.away}</div>
                    <div className="text-sm text-muted-foreground">{new Date(m.kickoff_at).toLocaleString("ro-RO")}</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!m.is_derby} onChange={(e)=>setMatches(prev=>prev.map(x=>x.id===m.id?{...x,is_derby:e.target.checked}:x))} /> Derby
                  </label>
                  <Input className="w-[300px]" placeholder="tv_channels, separate prin virgulă" value={(m.tv_channels||[]).join(", ")} onChange={(e)=>setMatches(prev=>prev.map(x=>x.id===m.id?{...x,tv_channels:e.target.value.split(",").map((s)=>s.trim()).filter(Boolean)}:x))} />
                  <Button size="sm" onClick={()=>saveMatch(m)}>Save</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aliases" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold mb-2">Aliasuri Echipe</h2>
                <AliasForm onAdd={addTeamAlias} placeholderCanonical="FCSB" />
                <ul className="mt-3 divide-y">
                  {teamAliases.map((a)=> (
                    <li key={a.alias} className="py-2 flex items-center justify-between text-sm">
                      <span className="truncate">{a.alias} → <b>{a.canonical}</b></span>
                      <Button size="sm" variant="ghost" onClick={()=>removeAlias("team_alias", a.alias)}>Șterge</Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Aliasuri Canale TV</h2>
                <AliasForm onAdd={(alias, canonical, priority)=>addTvAlias(alias, canonical, priority)} placeholderCanonical="Digi Sport 1" withPriority />
                <ul className="mt-3 divide-y">
                  {tvAliases.map((a)=> (
                    <li key={a.alias} className="py-2 flex items-center justify-between text-sm">
                      <span className="truncate">{a.alias} → <b>{a.canonical}</b> (p={a.priority})</span>
                      <Button size="sm" variant="ghost" onClick={()=>removeAlias("tv_channel_alias", a.alias)}>Șterge</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </section>
  );
}

function AliasForm({ onAdd, placeholderCanonical, withPriority = false }: { onAdd: (alias: string, canonical: string, priority?: number)=>void; placeholderCanonical: string; withPriority?: boolean }) {
  const [alias, setAlias] = useState("");
  const [canonical, setCanonical] = useState("");
  const [priority, setPriority] = useState<number>(0);
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="alias (lowercase)" value={alias} onChange={(e)=>setAlias(e.target.value)} />
      <Input placeholder={`canonical (ex: ${placeholderCanonical})`} value={canonical} onChange={(e)=>setCanonical(e.target.value)} />
      {withPriority && <Input type="number" className="w-[120px]" placeholder="priority" value={priority} onChange={(e)=>setPriority(parseInt(e.target.value||"0",10))} />}
      <Button onClick={()=>{ if (!alias || !canonical) return; onAdd(alias, canonical, priority); setAlias(""); setCanonical(""); }}>{withPriority?"Adaugă (p)":"Adaugă"}</Button>
    </div>
  );
}
