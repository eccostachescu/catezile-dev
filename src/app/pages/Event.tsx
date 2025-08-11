import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import EventCard from "@/components/cards/EventCard";
import { Helmet } from "react-helmet-async";
import { eventJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { useLocation } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";

export default function Event() {
  const when = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const { pathname } = useLocation();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const noindex = typeof window !== 'undefined' && !initial;
  return (
    <>
      <SEO title="Eveniment" path={pathname} noindex={noindex} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(eventJsonLd({ name: "Untold Festival", startDate: when }))}</script>
      </Helmet>
      <Container className="py-8">
        <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Evenimente", href: "/evenimente" }, { label: "Untold Festival" }]} />
        <h1 className="text-3xl font-semibold mb-4">Eveniment</h1>
        <section aria-labelledby="event-info" className="space-y-6">
          <h2 id="event-info" className="sr-only">Detalii eveniment</h2>
          <EventCard title="Untold Festival" datetime={when} category="Festival" affiliateUrl="#" />
        </section>
      </Container>
    </>
  );
}
