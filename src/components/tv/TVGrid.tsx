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
                    {/* Enhanced program row with TVMaze data */}
                    <div className="w-full">
                      <div className="">
                        <div className="flex items-start justify-between gap-3 p-3 rounded-md border hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm text-muted-foreground font-medium">
                                {new Date(p.starts_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {p.season && p.episode_number && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  S{p.season}E{p.episode_number}
                                </span>
                              )}
                              {p.genres && p.genres.length > 0 && (
                                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                  {p.genres[0]}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-base mb-1">{p.title}</div>
                            {p.subtitle && (
                              <div className="text-sm text-muted-foreground mb-2">{p.subtitle}</div>
                            )}
                            {p.description && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {p.description.length > 120 ? p.description.slice(0, 120) + '...' : p.description}
                              </div>
                            )}
                          </div>
                          {p.image_url && (
                            <div className="w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                              <img 
                                src={p.image_url} 
                                alt={p.title} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
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
