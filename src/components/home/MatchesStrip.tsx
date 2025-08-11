import Container from "@/components/Container";
import MatchCard from "@/components/cards/MatchCard";

export default function MatchesStrip({ matches }: { matches: any[] }) {
  if (!matches?.length) return null;
  return (
    <section className="py-6">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Următoarele meciuri Liga 1</h2>
          <a className="text-sm underline underline-offset-4" href="/sport">Vezi toate</a>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x">
          {matches.map((m) => (
            <a key={m.id} href={`/sport/${m.id}`} className="min-w-[280px] snap-start">
              <MatchCard homeTeam={m.home} awayTeam={m.away} datetime={m.kickoff_at} tv={m.tv_channels || []} isDerby={m.is_derby} />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
