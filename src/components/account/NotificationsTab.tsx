import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { formatRoDate } from "@/lib/date";

interface ReminderRow {
  id: string;
  entity_type: 'event'|'match'|'movie'|'countdown';
  entity_id: string;
  offset_days: number;
  offset_hours?: number | null;
  status: 'ACTIVE'|'PAUSED'|'CANCELLED';
  next_fire_at?: string | null;
  created_at?: string | null;
}

export default function NotificationsTab() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState({ email_reminders: true, email_digest: false, marketing_emails: false, pushes: false });
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [icalToken, setIcalToken] = useState<string | null>(null);

  const icalUrl = useMemo(() => icalToken ? `https://ibihfzhrsllndxhfwgvb.supabase.co/functions/v1/ics_user_feed/${icalToken}.ics` : null, [icalToken]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [{ data: setData }, { data: rData }, { data: pData }] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('reminder').select('id, entity_type, entity_id, offset_days, offset_hours, status, next_fire_at, created_at').order('created_at', { ascending: false }),
        supabase.from('profile').select('ical_token').eq('id', user.id).maybeSingle(),
      ]);
      if (setData) setS({
        email_reminders: !!setData.email_reminders,
        email_digest: !!setData.email_digest,
        marketing_emails: !!setData.marketing_emails,
        pushes: !!setData.pushes,
      });
      setReminders(((rData || []) as any[]).map((r) => ({ ...r, entity_type: r.entity_type as ReminderRow['entity_type'] }) as ReminderRow));
      setIcalToken(pData?.ical_token || null);
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

  const pauseResume = async (id: string, status: ReminderRow['status']) => {
    const next = status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const { error } = await supabase.from('reminder').update({ status: next }).eq('id', id);
    if (error) return toast({ title: 'Eroare', description: error.message });
    setReminders((rows) => rows.map(r => r.id === id ? { ...r, status: next as any } : r));
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('reminder').delete().eq('id', id);
    if (error) return toast({ title: 'Eroare', description: error.message });
    setReminders((rows) => rows.filter(r => r.id !== id));
  };

  const resetIcal = async () => {
    if (!user) return;
    const token = (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2);
    const { error } = await supabase.from('profile').update({ ical_token: token }).eq('id', user.id);
    if (error) return toast({ title: 'Eroare', description: error.message });
    setIcalToken(token);
    toast({ title: 'Link iCal resetat' });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-4">
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
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold">Feed iCalendar personal</h3>
        {icalUrl ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a href={icalUrl} target="_blank" rel="noreferrer" className="underline break-all">{icalUrl}</a>
            <Button variant="outline" size="sm" onClick={resetIcal}>Resetează link</Button>
          </div>
        ) : (
          <Button size="sm" onClick={resetIcal}>Generează link iCal</Button>
        )}
        <p className="text-xs text-muted-foreground">Importă-l în Google/Apple Calendar. Linkul este privat — nu îl distribui.</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold">Reminderele tale</h3>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu ai remindere încă.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map(r => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-md p-3">
                <div className="text-sm">
                  <div className="font-medium uppercase tracking-wide text-xs">{r.entity_type}</div>
                  <div className="text-muted-foreground text-xs">Offset: {r.offset_days} zile {r.offset_hours?`și ${r.offset_hours} ore`:''}</div>
                  {r.next_fire_at && (
                    <div className="text-xs">Următorul e-mail: {formatRoDate(new Date(r.next_fire_at), true)}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={()=>pauseResume(r.id, r.status)}>{r.status === 'ACTIVE' ? 'Pauză' : 'Reia'}</Button>
                  <Button variant="outline" size="sm" onClick={()=>del(r.id)}>Șterge</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
