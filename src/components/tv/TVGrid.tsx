export default function TVGrid({ loading, channels, programsByChannel }: { loading: boolean; channels: Array<{ id: string; name: string; slug: string }>; programsByChannel: Record<string, any[]> }) {
  if (loading) return <div className="grid gap-2">{Array.from({ length: 6 }).map((_,i)=>(<div key={i} className="h-16 rounded-md border animate-pulse" />))}</div>;
  if (!channels?.length) return <div className="text-muted-foreground">Nu există programe disponibile pentru această zi.</div>;
  return (
    <div className="space-y-4">
      {channels.map((c) => (
        <section key={c.id} aria-labelledby={`ch-${c.slug}`}>
          <h3 id={`ch-${c.slug}`} className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-base font-semibold py-2">{c.name}</h3>
          <div className="grid gap-2">
            {(programsByChannel[c.id] || []).map((p: any, idx: number) => (
              <a key={`${c.id}-${idx}-${p.starts_at}`} href={p.match_id ? `/sport/${p.match_id}` : '#'} className="block">
                <div className="w-full">
                  <div className="inline-block min-w-full">
                    {/* Program row */}
                    <div className="w-full">
                      <div className="">
                        {/* Using separate component might be overkill here, keep inline for perf */}
                        <div className="flex items-center justify-between gap-3 p-2 rounded-md border hover:bg-muted">
                          <div>
                            <div className="text-sm text-muted-foreground">{new Date(p.starts_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="font-medium">{p.title}</div>
                            {p.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
