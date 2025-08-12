import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Item {
  kind: 'event'|'match'|'movie'|'countdown'|'team'|'tv'|'tag';
  id?: string;
  slug?: string;
  title: string;
  subtitle?: string;
  when_at?: string;
}

export default function SearchBox({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(q, 150);

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (debounced.trim().length < 2) { setItems([]); return; }
      const { data, error } = await supabase.functions.invoke('search_suggest', { method: 'GET', headers: {}, body: undefined, query: { q: debounced, limit: '8' } as any } as any);
      if (!cancel) setItems((data as any)?.items || []);
      setOpen(true);
    }
    run();
    return () => { cancel = true; }
  }, [debounced]);

  function goTo(item?: Item) {
    const query = q.trim();
    if (!item) {
      navigate(`/cauta?q=${encodeURIComponent(query)}`);
      return;
    }
    let href = '/cauta?q=' + encodeURIComponent(query);
    if (item.kind === 'event' && item.slug) href = `/evenimente/${item.slug}`;
    if (item.kind === 'match' && item.id) href = `/sport/${item.id}`;
    if (item.kind === 'movie' && item.id) href = `/filme/${item.id}`;
    if (item.kind === 'countdown' && item.slug) href = `/c/${item.slug}`;
    if (item.kind === 'tag' && item.slug) href = `/tag/${item.slug}`;
    if (item.kind === 'tv' && item.slug) href = `/tv/${item.slug}`;
    navigate(href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a)=>Math.min(a+1, items.length-1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a)=>Math.max(a-1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); goTo(items[active]); }
    if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div className={cn("relative w-full", className)} role="combobox" aria-expanded={open}>
      <input
        aria-label="Căutare"
        placeholder="Caută evenimente, filme, sport…"
        className="flex-1 h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
        value={q}
        onChange={(e)=>{ setQ(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        onBlur={()=> setTimeout(()=>setOpen(false), 150)}
        onFocus={()=> setOpen(true)}
      />
      {open && items.length > 0 && (
        <div ref={listRef} role="listbox" className="absolute z-50 mt-2 w-full rounded-md border bg-popover shadow">
          {items.map((it, idx)=> (
            <button
              key={`${it.kind}-${it.id||it.slug||idx}`}
              role="option"
              aria-selected={active===idx}
              onMouseEnter={()=>setActive(idx)}
              onMouseDown={(e)=>{ e.preventDefault(); goTo(it); }}
              className={cn("w-full text-left p-2 hover:bg-muted focus:bg-muted", active===idx && "bg-muted")}
            >
              <div className="text-sm font-medium">{it.title}</div>
              {it.subtitle && <div className="text-xs text-muted-foreground">{it.subtitle}</div>}
            </button>
          ))}
          <div className="p-2 text-right"><button className="text-xs text-primary" onMouseDown={(e)=>{e.preventDefault(); goTo();}}>Vezi toate rezultatele</button></div>
        </div>
      )}
    </div>
  );
}

function useDebounce<T>(value: T, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(()=>{ const t = setTimeout(()=>setV(value), delay); return ()=>clearTimeout(t); }, [value, delay]);
  return v;
}
