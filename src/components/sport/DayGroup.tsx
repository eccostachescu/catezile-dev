import { format } from "date-fns";
import { ro } from "date-fns/locale";
import MatchCard, { SportMatchItem } from "@/components/sport/MatchCard";

export default function DayGroup({ dateKey, matches, onMatchClick }: { dateKey: string; matches: SportMatchItem[]; onMatchClick?: (id: string) => void }) {
  const d = new Date(dateKey);
  const title = `${format(d, 'EEEE', { locale: ro })} • ${format(d, 'dd MMM', { locale: ro })}`;
  return (
    <section aria-labelledby={`day-${dateKey}`} className="space-y-3">
      <h2 id={`day-${dateKey}`} className="text-lg font-semibold capitalize">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.map((m) => (
          <MatchCard key={m.id} m={m as any} onClick={onMatchClick} />
        ))}
      </div>
    </section>
  );
}
