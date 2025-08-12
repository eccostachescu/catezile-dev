import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { routes } from "@/app/routes";

export default function ChannelFilters({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [days, setDays] = useState<Array<{ label: string; value: string }>>([]);
  useEffect(()=>{
    const arr: Array<{ label: string; value: string }> = [];
    const base = new Date(); base.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i*24*3600*1000);
      arr.push({ label: d.toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: '2-digit' }), value: d.toISOString().slice(0,10) });
    }
    setDays(arr);
  },[]);

  return (
    <div className="flex items-center gap-2 mb-3" role="navigation" aria-label="Zile">
      {days.map((d) => (
        <button key={d.value} onClick={() => onChange(d.value)} className={`px-3 py-1 rounded-md border ${value===d.value? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          {d.label}
        </button>
      ))}
    </div>
  );
}
