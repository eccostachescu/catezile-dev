import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { formatRoDate } from "@/lib/date";

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
    if (!kind || !entityId) {
      setSet(true);
      toast({ title: "Reminder setat", description: "Îți vom reaminti înainte de eveniment." });
      setOpen(false);
      return;
    }
    if (!user) {
      toast({ title: "Autentifică-te", description: "Trebuie să fii logat pentru a seta remindere." });
      return;
    }
    try {
      setSaving(true);
      const { data, error } = await supabase.functions.invoke('reminder_upsert', {
        body: { kind, entity_id: entityId, offsets: { days, hours } },
      });
      setSaving(false);
      if (error) throw error;
      setSet(true);
      setOpen(false);
      setNextFireAt(data?.next_fire_at || null);
      toast({ title: "Reminder activ", description: data?.next_fire_at ? `Îți scriem ${formatRoDate(new Date(data.next_fire_at), true)}.` : undefined });
    } catch (e: any) {
      setSaving(false);
      toast({ title: "Eroare", description: e.message || "Nu am putut salva reminderul" });
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
