import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Helmet } from "react-helmet-async";
import { eventJsonLd } from "@/seo/jsonld";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useMemo, useState } from "react";
import { loadEvent, loadRelated } from "@/ssg/loader";
import EventHero from "@/components/event/EventHero";
import AnswerBox from "@/components/event/AnswerBox";
import WhenWhere from "@/components/event/WhenWhere";
import TicketCTA from "@/components/event/TicketCTA";
import ActionsBar from "@/components/event/ActionsBar";
import FAQBlock from "@/components/event/FAQBlock";
import RelatedList from "@/components/event/RelatedList";
import PrintNote from "@/components/event/PrintNote";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { buildOgUrl } from "@/seo/og";

export default function Event() {
  const { pathname } = useLocation();
  const { slug } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [item, setItem] = useState<any>(initial?.item || null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!item && slug) {
        const ev = await loadEvent(slug);
        if (!cancelled) setItem(ev);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    async function runRelated() {
      if (item?.id) {
        const r = await loadRelated(item.id, item.category_id || null);
        if (!cancelled) setRelated(r);
      }
    }
    runRelated();
    return () => { cancelled = true; };
  }, [item?.id, item?.category_id]);

  const crumbs = useMemo(() => {
    const list = [{ label: "Acasă", href: routes.home() } as any];
    if (item?.breadcrumbs?.[0]) list.push({ label: item.breadcrumbs[0].label, href: item.breadcrumbs[0].url });
    if (item?.title) list.push({ label: item.title });
    return list;
  }, [item]);

  const noindex = false; // evenimente publicate
  const ogImage = buildOgUrl({ type: 'event', slug, title: item?.seo_title || item?.title, theme: item?.og_theme });

  return (
    <>
      <SEO kind="event" slug={slug} title={item?.seo_title || item?.title || 'Eveniment'} description={item?.seo_description} path={pathname} imageUrl={ogImage} noindex={noindex} />
      {item?.title && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(eventJsonLd({ name: item.title, startDate: item.start_at }))}</script>
          <style>{`@media print { header, footer, [data-ad], .ad, .ad-slot { display: none !important; } main { padding: 0 !important; } }`}</style>
        </Helmet>
      )}
      <Container className="py-8 space-y-6">
        <Breadcrumbs items={crumbs} />

        <EventHero
          title={item?.seo_h1 || item?.title || 'Eveniment'}
          category={item?.breadcrumbs?.[0]?.label}
          city={item?.city}
          imageUrl={item?.image_url}
          updatedAt={item?.updated_at}
        />

        {item && (
          <section className="space-y-4">
            <AnswerBox data={{ title: item.title, startDate: item.start_at, city: item.city }} />
            <WhenWhere start={new Date(item.start_at)} end={item.end_at ? new Date(item.end_at) : null} timezone={item.timezone || 'Europe/Bucharest'} />
            <div className="flex items-center gap-2">
              {item.state === 'today' && <span className="text-xs rounded-md border px-2 py-0.5">Astăzi</span>}
              {item.state === 'ongoing' && <span className="text-xs rounded-md border px-2 py-0.5">În desfășurare</span>}
              {item.state === 'past' && <span className="text-xs rounded-md border px-2 py-0.5">S-a încheiat</span>}
            </div>
            <TicketCTA offers={item.offers} />
            <ActionsBar title={item.title} start={new Date(item.start_at)} end={item.end_at ? new Date(item.end_at) : null} />
          </section>
        )}

        {item?.description && (
          <article className="prose prose-sm sm:prose" aria-labelledby="descriere">
            <h2 id="descriere" className="text-xl font-semibold mb-2">Descriere</h2>
            <p className="whitespace-pre-line">{item.description}</p>
          </article>
        )}

        <FAQBlock
          faq={Array.isArray(item?.seo_faq) ? item?.seo_faq : undefined}
          fallback={[
            { q: 'Când are loc?', a: item ? new Date(item.start_at).toLocaleString('ro-RO', { timeZone: item.timezone || 'Europe/Bucharest' }) : '' },
            { q: 'Cât durează?', a: item?.end_at ? 'Se încheie la ' + new Date(item.end_at).toLocaleTimeString('ro-RO', { timeZone: item.timezone || 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }) : 'Informația nu este disponibilă.' },
            { q: 'Există bilete/unde găsesc?', a: item?.offers?.length ? 'Vezi secțiunea „Cumpără bilete”.' : 'Nu avem informații despre bilete.' },
          ]}
        />

        <RelatedList items={related} />
        <PrintNote />
      </Container>
    </>
  );
}
