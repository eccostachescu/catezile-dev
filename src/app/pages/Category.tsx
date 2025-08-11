import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useState } from "react";
import { loadCategory } from "@/ssg/loader";

export default function Category() {
  const { pathname } = useLocation();
  const { slug } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [loaded, setLoaded] = useState(!!initial);
  useEffect(() => {
    let cancelled = false;
    async function run() { try { if (!initial && slug) await loadCategory(slug); } catch {} if (!cancelled) setLoaded(true); }
    if (!initial) run();
    return () => { cancelled = true; };
  }, [initial, slug]);
  const noindex = typeof window !== 'undefined' && !initial && !loaded;
  return (
    <>
      <SEO kind="category" slug={slug} title="Categorie" path={pathname} noindex={noindex} />
      <Container>
        <h1 className="text-2xl font-semibold">Categorie</h1>
      </Container>
    </>
  );
}
