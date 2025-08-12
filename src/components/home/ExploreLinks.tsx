import Container from "@/components/Container";

export default function ExploreLinks({ discovery }: { discovery: { tags: Array<{ slug: string; name: string }>; teams: Array<{ slug: string; name: string }>; tv: Array<{ slug: string; name: string }> } }) {
  return (
    <section className="py-6" aria-labelledby="explore-title">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 id="explore-title" className="text-xl font-semibold">Explorează</h2>
          <a className="text-sm underline underline-offset-4" href={`/cauta`}>Caută</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Taguri populare</div>
            <div className="flex flex-wrap gap-2">
              {discovery.tags.slice(0,10).map((t) => (
                <a key={t.slug} href={`/tag/${t.slug}`} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">#{t.name}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Echipe</div>
            <div className="flex flex-wrap gap-2">
              {discovery.teams.slice(0,8).map((t) => (
                <a key={t.slug} href={`/echipa/${t.slug}`} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{t.name}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">TV</div>
            <div className="flex flex-wrap gap-2">
              {discovery.tv.slice(0,8).map((t) => (
                <a key={t.slug} href={`/tv/${t.slug}`} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{t.name}</a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
