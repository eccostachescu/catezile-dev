import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

const templates = [
  { id: 'ReminderEvent', label: 'ReminderEvent' },
  { id: 'ReminderMatch', label: 'ReminderMatch' },
  { id: 'ReminderMovie', label: 'ReminderMovie' },
  { id: 'DigestWeekly', label: 'DigestWeekly' },
  { id: 'TransactionalGeneric', label: 'TransactionalGeneric' },
];

export default function AdminEmails() {
  const { isAdmin } = useAuth();
  const [tpl, setTpl] = useState('ReminderEvent');
  const [sample, setSample] = useState('1');
  const [html, setHtml] = useState('');
  const [text, setText] = useState('');
  const [to, setTo] = useState('');
  const [trackMarketing, setTrackMarketing] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!html || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (doc) { doc.open(); doc.write(html); doc.close(); }
  }, [html]);

  const loadPreview = async () => {
    const { data, error } = await supabase.functions.invoke('email_render', { body: { template: tpl, sample } });
    if (error) return toast({ title: 'Eroare', description: error.message });
    setHtml(data.html);
    setText(data.text);
  };

  const sendTest = async () => {
    if (!to) return toast({ title: 'Introduce o adresă' });
    const { error } = await supabase.functions.invoke('email_send', { body: { to, template: tpl, track_marketing: trackMarketing } });
    if (error) return toast({ title: 'Eroare', description: error.message });
    toast({ title: 'Trimis' });
  };

  useEffect(() => { loadPreview(); }, [tpl, sample]);

  if (!isAdmin) return <main className="container mx-auto p-4">Doar admin.</main>;

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Email Templates</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={tpl} onValueChange={setTpl}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Alege template" /></SelectTrigger>
          <SelectContent>
            {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sample} onValueChange={setSample}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Sample data" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Sample implicit</SelectItem>
            <SelectItem value="today">Varianta „Astăzi”</SelectItem>
            <SelectItem value="live">Meci LIVE</SelectItem>
            <SelectItem value="cinema">Film la cinema</SelectItem>
            <SelectItem value="netflix">Film pe Netflix</SelectItem>
            <SelectItem value="prime">Film pe Prime</SelectItem>
            <SelectItem value="digest">Digest săptămânal</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Marketing tracking</span>
          <Switch checked={trackMarketing} onCheckedChange={setTrackMarketing} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Dark mode preview</span>
          <Switch checked={darkPreview} onCheckedChange={setDarkPreview} />
        </div>
        <Button variant="outline" onClick={loadPreview}>Regenerează</Button>
        <div className="flex items-center gap-2">
          <Input placeholder="email de test" value={to} onChange={(e)=>setTo(e.target.value)} />
          <Button onClick={sendTest}>Trimite test</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">HTML Preview</h3>
          <iframe ref={iframeRef} title="preview" className="w-full h-[600px] border rounded" />
        </div>
        <div>
          <h3 className="font-medium mb-2">Text fallback</h3>
          <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-3 rounded min-h-[200px]">{text}</pre>
        </div>
      </div>
    </main>
  );
}
