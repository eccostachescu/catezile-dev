import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useLocation } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";

export default function Category() {
  const { pathname } = useLocation();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const noindex = typeof window !== 'undefined' && !initial;
  return (
    <>
      <SEO title="Categorie" path={pathname} noindex={noindex} />
      <Container>
        <h1 className="text-2xl font-semibold">Categorie</h1>
      </Container>
    </>
  );
}
