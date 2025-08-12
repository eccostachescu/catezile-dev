import FollowButton from "@/components/FollowButton";
import ReminderButton from "@/components/ReminderButton";
import { Button } from "@/components/Button";
import { Share2, CalendarPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { buildIcs } from "@/lib/ics";

export default function ActionsBar({ id, kind = 'event', title, start, end }: { id?: string; kind?: 'event'|'match'|'movie'|'countdown'; title: string; start: Date; end?: Date | null }) {
  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiat" });
      }
    } catch {}
  };

  const addToCalendar = () => {
    const ics = buildIcs({ title, start, end, url: typeof window !== 'undefined' ? window.location.href : undefined });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g,'-')}.ics`;
    a.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FollowButton />
      <ReminderButton when={start} kind={kind} entityId={id} />
      <Button variant="outline" onClick={share} aria-label="Distribuie">
        <Share2 />
        Share
      </Button>
      <Button variant="outline" onClick={addToCalendar} aria-label="Adaugă în calendar">
        <CalendarPlus />
        Calendar
      </Button>
    </div>
  );
}
