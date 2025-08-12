import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useMemo, useState } from "react";
import { loadCategoryHub } from "@/ssg/loader";
import EventCard from "@/components/cards/EventCard";

export default function Category() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { slug, year: yearParam } = useParams<{ slug: string; year?: string }>();
  const year = useMemo(() => (yearParam ? parseInt(yearParam, 10) : undefined), [yearParam]);
  const initial = getInitialData<{ kind: string; item?: any; year?: number }>();
  const [hub, setHub] = useState<any | null>(initial?.item || null);
  const [loaded, setLoaded] = useState(!!initial?.item);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (!hub && slug) {
          const data = await loadCategoryHub(slug, { year });
          if (!cancelled) setHub(data);
        }
      } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial?.item) run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, year]);

  const noindex = typeof window !== "undefined" && !initial && !loaded;

  const pageTitle = useMemo(() => {
    const name = hub?.category?.name || (slug === 'sarbatori' ? 'Sărbători' : slug === 'examene' ? 'Examene' : slug === 'festivaluri' ? 'Festivaluri' : 'Categorie');
    return year ? `${name} ${year}` : name;
  }, [hub, slug, year]);

  const breadcrumbLd = hub
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro' },
          { "@type": "ListItem", position: 2, name: hub.category.name, item: `${typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro'}/categorii/${hub.category.slug}` },
          ...(year ? [{ "@type": "ListItem", position: 3, name: String(year), item: `${typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro'}/categorii/${hub.category.slug}/${year}` }] : []),
        ],
      }
    : null;
  const faqLd = hub && hub.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: hub.faq.map((f: any) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  const onYearChange = (y: number) => {
    if (!slug) return;
    if (y) navigate(`/categorii/${slug}/${y}`);
    else navigate(`/categorii/${slug}`);
  };

  return (
    <>
      <SEO kind="category" slug={slug} title={pageTitle} path={pathname} noindex={noindex} />
      <Helmet>
        {breadcrumbLd && <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>}
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>
      <Container className="py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            {slug === 'sarbatori' && `Vezi sărbătorile importante${year ? ` din ${year}` : ''} în România.`}
            {slug === 'examene' && `Calendar examene${year ? ` ${year}` : ''}: probe, date, rezultate.`}
            {slug === 'festivaluri' && `Festivaluri${year ? ` ${year}` : ''}: date, program, bilete.`}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm">An</label>
            <select
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={year || hub?.year || new Date().getFullYear()}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            >
              {[-1, 0, 1].map((off) => {
                const y = (hub?.year || new Date().getFullYear()) + off;
                return (
                  <option key={y} value={y}>{y}</option>
                );
              })}
            </select>
          </div>
        </header>

        {hub?.featured?.length > 0 && (
          <section>
            <h2 className="text-lg font-medium mb-3">Recomandate</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hub.featured.map((e: any) => (
                <Link key={e.slug} to={`/evenimente/${e.slug}`} aria-label={e.title}>
                  <EventCard title={e.title} datetime={e.start_at} category={hub.category.name} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {hub?.upcoming?.length > 0 && (
          <section>
            <h2 className="text-lg font-medium mb-3">În următoarele 90 de zile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hub.upcoming.map((e: any) => (
                <Link key={e.slug} to={`/evenimente/${e.slug}`} aria-label={e.title}>
                  <EventCard title={e.title} datetime={e.start_at} category={hub.category.name} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {hub?.byYear?.length > 0 && (
          <section>
            <h2 className="text-lg font-medium mb-3">Toate în {hub.year}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hub.byYear.map((e: any) => (
                <Link key={e.slug} to={`/evenimente/${e.slug}`} aria-label={e.title}>
                  <EventCard title={e.title} datetime={e.start_at} category={hub.category.name} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {hub?.sources?.length > 0 && (
          <aside className="border rounded-md p-3">
            <h2 className="text-base font-medium mb-2">Surse oficiale</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {hub.sources.map((s: any, i: number) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {s.url}
                  </a>
                  {s.lastVerified && (
                    <span className="ml-2 text-muted-foreground">Ultima verificare: {new Date(s.lastVerified).toLocaleDateString('ro-RO')}</span>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Container>
    </>
  );
}
