import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { formatRoDate } from "@/lib/date";
import { track } from "@/lib/analytics";
export type ReminderKind = "event" | "match" | "movie" | "countdown";

interface Props {
  when: Date | string | number;
  kind?: ReminderKind;
  entityId?: string;
}

export default function ReminderButton({ when, kind, entityId }: Props) {
  const [set, setSet] = useState(false);
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<number>(1);
  const [hours, setHours] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [nextFireAt, setNextFireAt] = useState<string | null>(null);
  const { user } = useAuth();

  const disabled = useMemo(() => saving, [saving]);

  const doSave = async () => {
    try {
      setSaving(true);
      
      if (!kind || !entityId) {
        // For events without specific IDs, just show success
        setSet(true);
        track('reminder_set', { kind: kind || 'unknown', entityId: entityId || undefined, offset_days: days, offset_hours: hours });
        toast({ title: "Reminder setat", description: "Îți vom reaminti înainte de eveniment." });
        setOpen(false);
        setSaving(false);
        return;
      }
      
      if (!user) {
        toast({ title: "Autentifică-te", description: "Trebuie să fii logat pentru a seta remindere.", variant: "destructive" });
        setSaving(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('reminder_upsert', {
        body: { kind, entity_id: entityId, offsets: { days, hours } },
      });
      
      if (error) {
        console.error('Reminder error:', error);
        throw new Error(error.message || 'Failed to set reminder');
      }
      
      setSet(true);
      setOpen(false);
      setNextFireAt(data?.next_fire_at || null);
      track('reminder_set', { kind, entityId, offset_days: days, offset_hours: hours });
      toast({ 
        title: "Reminder activ", 
        description: data?.next_fire_at ? `Îți scriem ${formatRoDate(new Date(data.next_fire_at), true)}.` : "Reminder-ul a fost setat cu succes." 
      });
    } catch (e: any) {
      console.error('Failed to save reminder:', e);
      toast({ 
        title: "Eroare", 
        description: e.message || "Nu am putut salva reminderul. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={set ? "secondary" : "default"}
          onClick={() => setOpen(!open)}
          aria-pressed={set}
        >
          <Bell />
          {set ? "Reminder activ" : "Setează reminder"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <div className="text-sm font-medium">Când să te anunțăm?</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={days === 7 && hours === 0 ? 'secondary' : 'outline'} size="sm" onClick={() => { setDays(7); setHours(0); }}>7 zile</Button>
          <Button variant={days === 3 && hours === 0 ? 'secondary' : 'outline'} size="sm" onClick={() => { setDays(3); setHours(0); }}>3 zile</Button>
          <Button variant={days === 1 && hours === 0 ? 'secondary' : 'outline'} size="sm" onClick={() => { setDays(1); setHours(0); }}>1 zi</Button>
          <Button variant={days === 0 && hours === 0 ? 'secondary' : 'outline'} size="sm" onClick={() => { setDays(0); setHours(0); }}>În ziua evenimentului</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Cu</span>
          <Input type="number" min={0} max={12} value={hours} onChange={(e)=>setHours(Number(e.target.value)||0)} className="h-8" />
          <span className="text-sm">ore înainte</span>
        </div>
        {nextFireAt && (
          <p className="text-xs text-muted-foreground">Programat: {formatRoDate(new Date(nextFireAt), true)}</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={()=>setOpen(false)}>Renunță</Button>
          <Button size="sm" onClick={doSave} disabled={disabled}>Salvează</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
