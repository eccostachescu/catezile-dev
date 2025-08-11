import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MatchCard from "@/components/cards/MatchCard";
import { Helmet } from "react-helmet-async";
import { sportsEventJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";

export default function Match() {
  const homeTeam = "FCSB";
  const awayTeam = "CFR Cluj";
  const when = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000);
  return (
    <>
      <SEO title="Meci" path={location.pathname} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(sportsEventJsonLd({ name: `${homeTeam} vs ${awayTeam}` , homeTeam, awayTeam, startDate: when }))}</script>
      </Helmet>
      <Container className="py-8">
        <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Sport", href: routes.sport() }, { label: `${homeTeam} vs ${awayTeam}` }]} />
        <h1 className="text-3xl font-semibold mb-4">Meci</h1>
        <section aria-labelledby="match-info" className="space-y-6">
          <h2 id="match-info" className="sr-only">Detalii meci</h2>
          <MatchCard homeTeam={homeTeam} awayTeam={awayTeam} datetime={when} tv={["Digi Sport", "Prima Sport"]} isDerby />
        </section>
      </Container>
    </>
  );
}
