export default function Scoreboard({ status, score }: { status?: string | null; score?: any }) {
  if (!status || status === 'SCHEDULED') return null;
  const home = score?.home ?? score?.goals?.home ?? score?.fulltime?.home ?? 0;
  const away = score?.away ?? score?.goals?.away ?? score?.fulltime?.away ?? 0;
  const minute = score?.elapsed ?? score?.minute;
  const isLive = status === 'LIVE';
  const isFinished = status === 'FINISHED' || status === 'FT';
  return (
    <div className="inline-flex items-center gap-2 text-base font-semibold">
      <span>{home}–{away}</span>
      {isLive && <span className="text-sm text-muted-foreground">{minute ? `${minute}'` : 'LIVE'}</span>}
      {isFinished && <span className="text-sm text-muted-foreground">(FT)</span>}
    </div>
  );
}
