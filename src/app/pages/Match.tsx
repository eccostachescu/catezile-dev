import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MatchCard from "@/components/cards/MatchCard";

export default function Match() {
  const when = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000);
  return (
    <>
      <SEO title="Meci" path={location.pathname} />
      <Container className="py-8">
        <h1 className="text-3xl font-semibold mb-4">Meci</h1>
        <section aria-labelledby="match-info" className="space-y-6">
          <h2 id="match-info" className="sr-only">Detalii meci</h2>
          <MatchCard homeTeam="FCSB" awayTeam="CFR Cluj" datetime={when} tv={["Digi Sport", "Prima Sport"]} isDerby />
        </section>
      </Container>
    </>
  );
}
