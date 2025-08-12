import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSearch() {
  const [rows, setRows] = useState<Array<{ canonical: string; term: string }>>([]);
  const [canonical, setCanonical] = useState("");
  const [term, setTerm] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('search_synonym').select('canonical,term').order('canonical', { ascending: true });
    setRows(data || []);
  }

  useEffect(()=>{ load(); }, []);

  async function add() {
    if (!canonical || !term) return;
    setSaving(true);
    await supabase.from('search_synonym').insert({ canonical, term });
    setCanonical(""); setTerm("");
    await load();
    setSaving(false);
  }

  async function rebuild() {
    await supabase.functions.invoke('search_index_refresh', { body: {} });
    alert('Reindex pornit');
  }

  return (
    <main>
      <SEO kind="generic" title="Admin Search" description="Administrare căutare" path="/admin/search" noindex />
      <Container className="py-8 space-y-6">
        <h1 className="text-2xl font-bold">Admin — Search</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Sinonime</h2>
          <div className="flex gap-2">
            <input placeholder="canonical (ex: liga 1)" className="h-10 px-3 rounded-md border" value={canonical} onChange={(e)=>setCanonical(e.target.value)} />
            <input placeholder="term (ex: superliga)" className="h-10 px-3 rounded-md border" value={term} onChange={(e)=>setTerm(e.target.value)} />
            <button className="h-10 px-3 rounded-md border" disabled={saving} onClick={add}>Adaugă</button>
            <button className="h-10 px-3 rounded-md border" onClick={rebuild}>Rebuild index</button>
          </div>
          <div className="grid gap-1">
            {rows.map((r, idx)=> (
              <div key={idx} className="text-sm text-muted-foreground">{r.term} → <span className="font-medium text-foreground">{r.canonical}</span></div>
            ))}
            {rows.length===0 && <div className="text-sm text-muted-foreground">Nicio regulă încă.</div>}
          </div>
        </section>
      </Container>
    </main>
  );
}
