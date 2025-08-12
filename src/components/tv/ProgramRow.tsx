import TVChips from "@/components/sport/TVChips";

export default function ProgramRow({ item }: { item: any }) {
  const start = new Date(item.starts_at);
  const time = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' }).format(start);
  const m = item.match;
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md border hover:bg-muted">
      <div>
        <div className="text-sm text-muted-foreground">{time}</div>
        <div className="font-medium">{m ? `${m.home} – ${m.away}` : item.title}</div>
        {m && <div className="text-xs text-muted-foreground mt-0.5">{m.tv_channels?.join(', ')}</div>}
      </div>
      {m && <TVChips channels={m.tv_channels || []} />}
    </div>
  );
}
