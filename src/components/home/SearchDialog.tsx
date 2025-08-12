import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/lib/routes";

interface Result {
  kind: 'event'|'match'|'movie';
  id?: string;
  slug?: string;
  title: string;
  subtitle?: string;
}

export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean)=>void }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const debouncedQ = useDebounce(q, 250);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!debouncedQ.trim()) { setResults([]); return; }
      setLoading(true);
      const { data } = await supabase.functions.invoke('search_suggest', { body: { q: debouncedQ, limit: 8 } });
      if (cancelled) return;
      const items = (data as any)?.items || [];
      const evRes: Result[] = items.filter((i:any)=>i.kind==='event').map((e:any)=>({ kind:'event', slug:e.slug, title:e.title, subtitle: e.when_at ? new Date(e.when_at).toLocaleString('ro-RO') : undefined }));
      const mtRes: Result[] = items.filter((i:any)=>i.kind==='match').map((m:any)=>({ kind:'match', id:m.id||m.entity_id, title:m.title, subtitle: m.when_at ? new Date(m.when_at).toLocaleString('ro-RO') : undefined }));
      const mvRes: Result[] = items.filter((i:any)=>i.kind==='movie').map((m:any)=>({ kind:'movie', id:m.id||m.entity_id, title:m.title, subtitle: m.when_at ? `La cinema din ${new Date(m.when_at).toLocaleDateString('ro-RO')}` : undefined }));
      setResults([...evRes, ...mtRes, ...mvRes]);
      setLoading(false);
    }
    run();
    return () => { cancelled = true };
  }, [debouncedQ]);

  function go(r: Result) {
    const href = r.kind==='event' && r.slug ? routes.event(r.slug) : r.kind==='match' && r.id ? routes.match(r.id) : r.kind==='movie' && r.id ? routes.movie(r.id) : '#';
    if (href !== '#') {
      window.location.href = href;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Caută</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input autoFocus placeholder="Caută evenimente, meciuri, filme…" value={q} onChange={(e)=>setQ(e.target.value)} aria-label="Căutare" />
          <div className="max-h-[60vh] overflow-auto divide-y">
            {loading && <div className="p-3 text-sm text-muted-foreground">Se caută…</div>}
            {!loading && results.length === 0 && debouncedQ && (
              <div className="p-3 text-sm text-muted-foreground">Nicio potrivire.</div>
            )}
            {!loading && results.map((r, idx)=> (
              <button key={idx} onClick={()=>go(r)} className="w-full text-left p-3 hover:bg-muted focus:bg-muted focus:outline-none">
                <div className="font-medium">{r.title}</div>
                {r.subtitle && <div className="text-xs text-muted-foreground">{r.subtitle}</div>}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useDebounce<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(()=>{
    const t = setTimeout(()=>setV(value), delay);
    return ()=>clearTimeout(t);
  }, [value, delay]);
  return v;
}
