import { differenceInMinutes, format } from "date-fns";
import { ro } from "date-fns/locale";

function tzAbbr(date: Date, tz: string) {
  try {
    const fmt = new Intl.DateTimeFormat('ro-RO', { timeZone: tz, timeZoneName: 'short' });
    const parts = fmt.formatToParts(date);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
    return tzName; // EET/EEST
  } catch {
    return 'EET';
  }
}

export default function WhenWhere({ start, end, timezone }: { start: Date; end?: Date | null; timezone: string }) {
  const dateStr = format(start, "dd MMM yyyy", { locale: ro });
  const timeStr = format(start, "HH:mm", { locale: ro });
  const abbr = tzAbbr(start, timezone);
  let duration: string | null = null;
  if (end) {
    const mins = Math.max(0, differenceInMinutes(end, start));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) duration = `${h}h ${m}m`;
    else if (h > 0) duration = `${h}h`;
    else duration = `${m}m`;
  }
  return (
    <div className="text-sm text-muted-foreground">
      <p>
        <strong className="text-foreground">{dateStr}</strong> la <strong className="text-foreground">{timeStr}</strong> ({abbr})
        {end && duration && <span> • durează aproximativ {duration}</span>}
      </p>
    </div>
  );
}
