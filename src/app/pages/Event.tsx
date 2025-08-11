import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import EventCard from "@/components/cards/EventCard";
import { Helmet } from "react-helmet-async";
import { eventJsonLd } from "@/seo/jsonld";

export default function Event() {
  const when = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  return (
    <>
      <SEO title="Eveniment" path={location.pathname} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(eventJsonLd({ name: "Untold Festival", startDate: when }))}</script>
      </Helmet>
      <Container className="py-8">
        <h1 className="text-3xl font-semibold mb-4">Eveniment</h1>
        <section aria-labelledby="event-info" className="space-y-6">
          <h2 id="event-info" className="sr-only">Detalii eveniment</h2>
          <EventCard title="Untold Festival" datetime={when} category="Festival" affiliateUrl="#" />
        </section>
      </Container>
    </>
  );
}
