import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminEvents() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => { (async () => {
    const { data } = await supabase.from('category').select('id,name,slug').order('name');
    setCats(data ?? []);
  })(); }, []);

  const load = async () => {
    let query = supabase.from('event').select('id,title,slug,start_at,end_at,category_id,editorial_status,verified_at,updated_at').order('updated_at', { ascending: false }).limit(200);
    if (cat) query = query.eq('category_id', cat);
    if (status) query = query.eq('editorial_status', status);
    if (from) query = query.gte('start_at', new Date(from).toISOString());
    if (to) query = query.lte('start_at', new Date(to).toISOString());
    if (q) query = query.ilike('title', `%${q}%`);
    const { data } = await query;
    setItems(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [cat, status, from, to]);

  const catName = useMemo(() => Object.fromEntries(cats.map((c:any)=>[c.id,c.name])), [cats]);

  const setEditorial = async (id: string, editorial_status: string) => {
    await supabase.from('event').update({ editorial_status }).eq('id', id);
    load();
  };
  const verify = async (id: string) => {
    await supabase.from('event').update({ verified_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  return (
    <Container className="py-8 space-y-6">
      <SEO kind="generic" title="Admin — Events" path="/admin/events" noindex />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin — Evenimente</h1>
        <Button onClick={() => navigate('/admin/events/new')}>Nou</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <Input placeholder="Caută…" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') load(); }} className="sm:col-span-2" />
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:col-span-1"><SelectValue placeholder="Categorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate</SelectItem>
            {cats.map((c:any)=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:col-span-1"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
        <Button variant="outline" onClick={load}>Aplică</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left p-2">Titlu</th>
              <th className="text-left p-2">Categorie</th>
              <th className="text-left p-2">Data</th>
              <th className="text-left p-2">Editorial</th>
              <th className="text-left p-2">Verificat</th>
              <th className="text-left p-2">Ultima modif.</th>
              <th className="text-left p-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e:any)=>(
              <tr key={e.id} className="border-t">
                <td className="p-2"><Link to={`/admin/events/${e.id}`} className="underline hover:no-underline">{e.title}</Link></td>
                <td className="p-2">{catName[e.category_id] || '-'}</td>
                <td className="p-2">{e.start_at ? format(new Date(e.start_at), 'PPP p') : '-'}</td>
                <td className="p-2">{e.editorial_status || '—'}</td>
                <td className="p-2">{e.verified_at ? format(new Date(e.verified_at), 'PPP') : '—'}</td>
                <td className="p-2">{e.updated_at ? format(new Date(e.updated_at), 'PPP') : '—'}</td>
                <td className="p-2 space-x-2">
                  <Button variant="outline" size="sm" onClick={()=>setEditorial(e.id,'DRAFT')}>Draft</Button>
                  <Button variant="outline" size="sm" onClick={()=>setEditorial(e.id,'REVIEW')}>Review</Button>
                  <Button variant="outline" size="sm" onClick={()=>setEditorial(e.id,'PUBLISHED')}>Publish</Button>
                  <Button variant="outline" size="sm" onClick={()=>verify(e.id)}>Verify</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
