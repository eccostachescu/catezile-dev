import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

export default function NotificationsTab() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState({ email_reminders: true, email_digest: false, marketing_emails: false, pushes: false });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setS({
        email_reminders: !!data.email_reminders,
        email_digest: !!data.email_digest,
        marketing_emails: !!data.marketing_emails,
        pushes: !!data.pushes,
      });
    }
    load();
  }, [user?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('user_settings').upsert({ user_id: user.id, ...s });
    setSaving(false);
    if (error) toast({ title: "Eroare", description: error.message });
    else toast({ title: "Salvat", description: "Preferințe actualizate." });
  };

  return (
    <section className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={s.email_reminders} onCheckedChange={(v)=>setS(prev=>({...prev, email_reminders: !!v}))} />
        E-mail reminders (ex. cu 24h înainte de evenimente urmărite)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={s.email_digest} onCheckedChange={(v)=>setS(prev=>({...prev, email_digest: !!v}))} />
        Rezumat săptămânal pe e-mail
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={s.marketing_emails} onCheckedChange={(v)=>setS(prev=>({...prev, marketing_emails: !!v}))} />
        E-mailuri de marketing (promoții)
      </label>
      <Button onClick={save} disabled={saving}>Salvează</Button>
    </section>
  );
}
