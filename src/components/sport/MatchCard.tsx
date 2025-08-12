import { Link } from "react-router-dom";
import { Badge } from "@/components/Badge";
import TVChips from "@/components/sport/TVChips";
import LivePill from "@/components/sport/LivePill";
import Scoreboard from "@/components/sport/Scoreboard";

export type SportMatchItem = {
  id: string;
  home: string;
  away: string;
  kickoff_at: string | Date;
  tv_channels?: string[] | null;
  is_derby?: boolean | null;
  status?: string | null;
  score?: any;
};

export default function MatchCard({ m, onClick }: { m: SportMatchItem; onClick?: (id: string) => void }) {
  const date = new Date(m.kickoff_at);
  const time = Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' }).format(date);
  return (
    <Link to={`/sport/${m.id}`} onClick={() => onClick?.(m.id)} className="block rounded-md border p-3 hover:bg-muted/40 transition">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>SuperLiga</Badge>
          {m.is_derby && <Badge variant="secondary">Derby</Badge>}
        </div>
        {m.status === 'LIVE' && <LivePill minute={m?.score?.elapsed || m?.score?.minute} />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-lg font-semibold">{m.home} vs {m.away}</div>
        <div className="text-sm text-muted-foreground">• {time}</div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <TVChips channels={m.tv_channels || []} />
        <Scoreboard status={m.status || undefined} score={m.score} />
      </div>
    </Link>
  );
}
