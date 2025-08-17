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
          className="transition-all duration-200"
        >
          <Bell />
          {set ? "Reminder activ" : "Setează reminder"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-lg border-border/50 shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Setează reminder</h3>
            <p className="text-sm text-muted-foreground">Când să te anunțăm despre acest film?</p>
          </div>

          {/* Quick options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Opțiuni rapide</label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={days === 7 && hours === 0 ? 'default' : 'outline'} 
                size="lg" 
                onClick={() => { setDays(7); setHours(0); }}
                className="h-12 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                7 zile
              </Button>
              <Button 
                variant={days === 3 && hours === 0 ? 'default' : 'outline'} 
                size="lg" 
                onClick={() => { setDays(3); setHours(0); }}
                className="h-12 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                3 zile
              </Button>
              <Button 
                variant={days === 1 && hours === 0 ? 'default' : 'outline'} 
                size="lg" 
                onClick={() => { setDays(1); setHours(0); }}
                className="h-12 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                1 zi
              </Button>
              <Button 
                variant={days === 0 && hours === 0 ? 'default' : 'outline'} 
                size="lg" 
                onClick={() => { setDays(0); setHours(0); }}
                className="h-12 font-medium text-xs leading-tight transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                În ziua<br />evenimentului
              </Button>
            </div>
          </div>

          {/* Custom hours */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Personalizează (ore înainte)</label>
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Cu</span>
              <Input 
                type="number" 
                min={0} 
                max={23} 
                value={hours} 
                onChange={(e)=>setHours(Number(e.target.value)||0)} 
                className="h-11 text-center font-medium bg-background border-border/50 focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">ore înainte</span>
            </div>
          </div>

          {/* Status */}
          {nextFireAt && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary font-medium text-center">
                📅 Programat: {formatRoDate(new Date(nextFireAt), true)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={()=>setOpen(false)}
              className="flex-1 h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Renunță
            </Button>
            <Button 
              onClick={doSave} 
              disabled={disabled}
              className="flex-1 h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
