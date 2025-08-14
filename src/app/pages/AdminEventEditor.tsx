import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { buildOgUrl } from "@/seo/og";

const Schema = z.object({
  title: z.string().min(4).max(120),
  category_id: z.string().uuid(),
  start_at: z.string(),
  end_at: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  is_recurring: z.boolean().optional().nullable(),
  rrule: z.string().optional().nullable(),
  official_source_url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_h1: z.string().optional().nullable(),
  seo_faq: z.any().optional().nullable(),
  editorial_status: z.enum(['DRAFT','REVIEW','PUBLISHED']).optional(),
});

export default function AdminEventEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cats, setCats] = useState<any[]>([]);
  const [data, setData] = useState<any>({ editorial_status: 'DRAFT' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('category').select('id,name,slug').in('slug', ['sarbatori','examene','festivaluri']).order('name');
    setCats(data ?? []);
  })(); }, []);

  useEffect(() => { if (!id) return; (async () => {
    const { data } = await supabase.from('event').select('*').eq('id', id).maybeSingle();
    if (data) setData(data);
  })(); }, [id]);

  const onChange = (k: string, v: any) => setData((d:any)=>({ ...d, [k]: v }));

  const save = async (nextStatus?: 'DRAFT'|'REVIEW'|'PUBLISHED') => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (nextStatus) payload.editorial_status = nextStatus;
      // Publish requires official_source_url
      if (payload.editorial_status === 'PUBLISHED' && !payload.official_source_url) {
        alert('Setează sursa oficială înainte de Publicare.');
        setLoading(false);
        return;
      }
      if (payload.editorial_status === 'PUBLISHED' && !payload.verified_at) {
        payload.verified_at = new Date().toISOString();
      }
      const parsed = Schema.safeParse(payload);
      if (!parsed.success) {
        alert(parsed.error.issues.map(i=>i.message).join('\n'));
        setLoading(false);
        return;
      }
      if (id) {
        await supabase.from('event').update(parsed.data as any).eq('id', id);
      } else {
        const { data: ins } = await supabase.from('event').insert(parsed.data as any).select('id').maybeSingle();
        if (ins?.id) navigate(`/admin/events/${ins.id}`, { replace: true });
      }
      alert('Salvat.');
    } finally {
      setLoading(false);
    }
  };

  const ogImage = buildOgUrl({ type: 'event', slug: data.slug, title: data.seo_title || data.title, theme: data.og_theme });

  return (
    <Container className="py-8 space-y-6">
      <SEO kind="generic" title={id ? 'Admin — Edit Event' : 'Admin — New Event'} path={id ? `/admin/events/${id}` : '/admin/events/new'} noindex />
      <h1 className="text-2xl font-semibold">{id ? 'Editează' : 'Creează'} Eveniment</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <Input placeholder="Titlu" value={data.title || ''} onChange={(e)=>onChange('title', e.target.value)} />
          <Select value={data.category_id || ''} onValueChange={(v)=>onChange('category_id', v)}>
            <SelectTrigger><SelectValue placeholder="Categorie" /></SelectTrigger>
            <SelectContent>
              {cats.map((c:any)=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input type="datetime-local" value={data.start_at ? data.start_at.slice(0,16) : ''} onChange={(e)=>onChange('start_at', new Date(e.target.value).toISOString())} />
            <Input type="datetime-local" value={data.end_at ? data.end_at.slice(0,16) : ''} onChange={(e)=>onChange('end_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Oraș" value={data.city || ''} onChange={(e)=>onChange('city', e.target.value)} />
            <Input placeholder="Țara" value={data.country || ''} onChange={(e)=>onChange('country', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.is_recurring} onChange={(e)=>onChange('is_recurring', e.target.checked)} /> Recurent</label>
            <Input placeholder="RRULE (ex: FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25)" value={data.rrule || ''} onChange={(e)=>onChange('rrule', e.target.value)} />
          </div>
          <Input placeholder="Sursă oficială (URL)" value={data.official_source_url || ''} onChange={(e)=>onChange('official_source_url', e.target.value)} />
          <Input placeholder="Imagine (URL)" value={data.image_url || ''} onChange={(e)=>onChange('image_url', e.target.value)} />
          <Textarea placeholder="Descriere" value={data.description || ''} onChange={(e)=>onChange('description', e.target.value)} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="SEO Title" value={data.seo_title || ''} onChange={(e)=>onChange('seo_title', e.target.value)} />
            <Input placeholder="SEO Description" value={data.seo_description || ''} onChange={(e)=>onChange('seo_description', e.target.value)} />
            <Input placeholder="SEO H1" value={data.seo_h1 || ''} onChange={(e)=>onChange('seo_h1', e.target.value)} />
          </div>
        </div>

        <aside className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">Preview OG</div>
            <img src={ogImage} alt="OG Preview" className="w-full rounded-md border" loading="lazy" />
          </div>
          <div className="space-y-2">
            <div className="text-sm">Status editorial: <span className="font-medium">{data.editorial_status}</span></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={()=>save('DRAFT')} disabled={loading}>Save draft</Button>
              <Button variant="outline" onClick={()=>save('REVIEW')} disabled={loading}>Send to review</Button>
              <Button onClick={()=>save('PUBLISHED')} disabled={loading}>Publish</Button>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
